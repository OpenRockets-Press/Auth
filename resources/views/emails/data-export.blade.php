<x-mail::message>
# Your Data Export is Ready

Your data export has been compiled and is ready for download.

<x-mail::button :url="$downloadUrl" color="primary">
Download Data
</x-mail::button>

This link will expire in 7 days.

If you did not request this export, please contact support immediately.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
