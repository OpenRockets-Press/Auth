<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Ubuntu', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
            color: #1f2937;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            width: 100%;
            background-color: #f9fafb;
            padding: 40px 0;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #0f172a;
            padding: 24px 40px;
            text-align: left;
        }
        .header img {
            max-height: 32px;
            display: block;
        }
        .hero {
            text-align: center;
            padding: 32px 24px 0;
        }
        .hero img {
            max-width: 200px;
            height: auto;
        }
        .content {
            padding: 32px 40px;
        }
        .greeting {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #111827;
        }
        .subtitle {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 24px;
            line-height: 1.6;
        }
        .otp-container {
            text-align: center;
            margin: 32px 0;
        }
        .otp-box {
            display: inline-block;
            background-color: #f8fafc;
            padding: 16px 36px;
            border-radius: 8px;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 6px;
            color: #0f172a;
            border: 2px dashed #cbd5e1;
        }
        .footer {
            background-color: #f8fafc;
            padding: 32px 40px;
            border-top: 1px solid #e2e8f0;
            font-size: 13px;
            color: #000000;
            line-height: 1.5;
            text-align: left;
        }
        .footer-links {
            margin-bottom: 24px;
        }
        .footer-links a {
            color: #3b82f6;
            text-decoration: none;
            margin-right: 20px;
            display: inline-block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        .copyright {
            margin-top: 24px;
            color: #000000;
        }
        .contact-info {
            margin-bottom: 24px;
            color: #000000;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://openrockets.com/v/openrockets.png" alt="OpenRockets">
            </div>

            <div class="hero">
                <img src="{{ url('assets/images/email-vector.png') }}" alt="Email Verification">
            </div>

            <div class="content">
                @if ($type === 'parent')
                    <div class="greeting">
                        @if ($name)
                            Hi {{ $name }},
                        @else
                            Hello dear parent,
                        @endif
                    </div>
                    <div class="subtitle">
                        Enter this verification code to verify you are a parent or legal guardian of this child.
                    </div>
                @else
                    <div class="greeting">
                        @if ($name)
                            Hi {{ $name }},
                        @else
                            Welcome to OpenRockets family,
                        @endif
                    </div>
                    <div class="subtitle">
                        <strong>From building your nonprofit to growing your own life, OpenRockets has your back.</strong><br><br>
                        OpenRockets was started in 2022 as just a WhatsApp community group and then crossed to an incorporated company now. So we are always here to support and partner and provide the best resources available to the people who we are dealing with, which is all teenagers and minors. We encourage you to join our programs, or maybe join us and apply...<br><br>
                        Let's finish creating your OpenRockets account.<br>
                        <strong>One account for everything you do.</strong>
                    </div>
                @endif

                <div class="otp-container">
                    <div class="otp-box">
                        {{ $otp }}
                    </div>
                </div>
            </div>

            <div class="footer">
                @if ($type === 'parent')
                    <div style="margin-bottom: 24px; font-weight: 700; color: #000000; font-size: 14px;">
                        By acting as the parent, you verify that you are a legal guardian of this child.
                    </div>
                @endif
                
                <div class="footer-links">
                    <a href="https://press.openrockets.com/legal/privacy-policy" target="_blank">Privacy Policy</a>
                    <a href="https://press.openrockets.com/legal/terms" target="_blank">Terms</a>
                    <a href="https://press.openrockets.com/legal/parental-consent-form" target="_blank">Parental Consent Form</a>
                </div>

                <div class="contact-info">
                    <strong>Contact (24/7)</strong><br>
                    team@openrockets.com<br>
                    +1 (603) 777-2159 (U.S and Canada)<br><br>
                    <strong>Mail us, visit us!</strong><br>
                    266 Elmwood Ave, Ste 420, Buffalo, New York 14222, United States of America<br>
                    Melville Lane Area, FairFax, VA, United States 22033
                </div>
                
                <div class="copyright">
                    &copy; 2022-{{ date('Y') }} OpenRockets Incorporated. All trademarks and copyrights belong to their respective owners.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
