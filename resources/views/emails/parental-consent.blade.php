<x-mail::message>
# Parental Consent Request

Your child **{{ $consent->user->name }}** has requested to use our service.

As they are under the age of digital consent in their country, your permission is required.

<x-mail::button :url="$grantUrl" color="success">
Grant Consent
</x-mail::button>

<x-mail::button :url="$denyUrl" color="danger">
Deny Consent
</x-mail::button>

This link will expire in {{ config('auth-system.parental_consent.token_lifetime_hours', 48) }} hours.

If you did not expect this request, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
