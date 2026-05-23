<x-mail::message>
# New App Registration: {{ $appName }}

A new app has been registered and requires review.

**App:** {{ $appName }}
**Developer:** {{ $developerName }}

<x-mail::button :url="$reviewUrl" color="primary">
Review App
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
