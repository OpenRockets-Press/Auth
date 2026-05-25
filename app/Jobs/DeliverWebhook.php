<?php

namespace App\Jobs;

use App\Models\Admin\WebhookDelivery;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class DeliverWebhook implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = [60, 300, 900, 3600, 7200];

    protected array $blockedRanges = [
        '127.0.0.0/8',
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16',
        '169.254.0.0/16',
        '0.0.0.0/8',
        '240.0.0.0/4',
        '::1/128',
        'fc00::/7',
        'fe80::/10',
    ];

    public function __construct(
        public WebhookDelivery $delivery,
    ) {}

    public function handle(): void
    {
        $endpoint = $this->delivery->webhookEndpoint;

        if (! $endpoint || ! $endpoint->is_active) {
            $this->delivery->markFailed(0, 'Webhook endpoint is inactive or deleted.');

            return;
        }

        $resolvedIp = $this->resolveHostSafe($endpoint->url);
        if ($resolvedIp === null) {
            $this->delivery->markFailed(0, 'Webhook URL could not be resolved.');

            return;
        }

        if (! $this->isIpAllowed($resolvedIp)) {
            $this->delivery->markFailed(0, 'Webhook URL resolved to a blocked IP address.');

            return;
        }

        $payload = json_encode([
            'event' => $this->delivery->event_type,
            'data' => $this->delivery->payload,
            'timestamp' => now()->toIso8601String(),
        ]);

        $signature = $endpoint->generateSignature($payload);

        $this->delivery->incrementAttempts();

        try {
            $response = Http::timeout(config('auth-system.webhooks.timeout_seconds', 30))
                ->withoutRedirecting()
                ->withOptions([
                    'curl' => [
                        CURLOPT_RESOLVE => [parse_url($endpoint->url, PHP_URL_HOST).':'.$this->getUriPort($endpoint->url).':'.$resolvedIp],
                    ],
                ])
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Webhook-Signature' => 'sha256='.$signature,
                    'X-Webhook-Event' => $this->delivery->event_type,
                    'User-Agent' => 'Auth-System-Webhook/1.0',
                ])
                ->post($endpoint->url, json_decode($payload, true));

            if ($response->successful()) {
                $this->delivery->markDelivered($response->status(), $response->body());
            } else {
                if ($this->delivery->attempts >= $this->tries) {
                    $this->delivery->markFailed($response->status(), $response->body());

                    return;
                }

                $backoffIndex = min($this->delivery->attempts - 1, count($this->backoff) - 1);
                $this->release($this->backoff[$backoffIndex] ?? 3600);
            }
        } catch (\Exception $e) {
            if ($this->delivery->attempts >= $this->tries) {
                $this->delivery->markFailed(0, $e->getMessage());

                return;
            }

            $backoffIndex = min($this->delivery->attempts - 1, count($this->backoff) - 1);
            $this->release($this->backoff[$backoffIndex] ?? 3600);
        }
    }

    protected function getUriPort(string $url): int
    {
        $parsed = parse_url($url);

        return $parsed['port'] ?? (($parsed['scheme'] ?? 'https') === 'https' ? 443 : 80);
    }

    protected function resolveHostSafe(string $url): ?string
    {
        $host = parse_url($url, PHP_URL_HOST);

        if (! $host) {
            return null;
        }

        $cacheKey = 'webhook_dns_'.md5($host);

        return Cache::remember($cacheKey, 300, function () use ($host) {
            $ip = @gethostbyname($host);

            if ($ip === $host) {
                return null;
            }

            if (! filter_var($ip, FILTER_VALIDATE_IP)) {
                return null;
            }

            return $ip;
        });
    }

    protected function isIpAllowed(string $ip): bool
    {
        foreach ($this->blockedRanges as $range) {
            if ($this->ipInRange($ip, $range)) {
                return false;
            }
        }

        return true;
    }

    protected function ipInRange(string $ip, string $range): bool
    {
        [$subnet, $mask] = explode('/', $range);

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            return $this->ipv6InRange($ip, $subnet, (int) $mask);
        }

        $ipLong = ip2long($ip);
        $subnetLong = ip2long($subnet);
        $maskLong = -1 << (32 - (int) $mask);

        return ($ipLong & $maskLong) === ($subnetLong & $maskLong);
    }

    protected function ipv6InRange(string $ip, string $subnet, int $mask): bool
    {
        $ipBin = $this->ipv6ToBinary($ip);
        $subnetBin = $this->ipv6ToBinary($subnet);

        if ($ipBin === false || $subnetBin === false) {
            return false;
        }

        return substr($ipBin, 0, $mask) === substr($subnetBin, 0, $mask);
    }

    protected function ipv6ToBinary(string $ip): string|false
    {
        $packed = @inet_pton($ip);

        return $packed !== false ? $packed : false;
    }
}
