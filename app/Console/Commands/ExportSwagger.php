<?php

namespace App\Console\Commands;

use Dedoc\Scramble\Generator;
use Dedoc\Scramble\Scramble;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Yaml\Yaml;

class ExportSwagger extends Command
{
    protected $signature = 'swagger:export {--output=swagger.yaml : Output file path} {--format=yaml : Output format (yaml or json)}';

    protected $description = 'Export OpenAPI specification from Scramble';

    public function handle(): int
    {
        $this->info('Generating OpenAPI specification...');

        $generator = app(Generator::class);
        $config = Scramble::getGeneratorConfig(Scramble::DEFAULT_API);
        $spec = $generator($config);

        $output = $this->option('output');
        $format = $this->option('format');

        if ($format === 'json') {
            $content = json_encode($spec, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        } else {
            $content = Yaml::dump($spec, 10, 2);
        }

        File::put($output, $content);

        $this->info("OpenAPI specification exported to: {$output}");
        $this->info("Format: {$format}");

        return Command::SUCCESS;
    }
}
