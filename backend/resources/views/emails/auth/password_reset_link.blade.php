<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reinitialisation du mot de passe</title>
</head>
<body style="margin:0;padding:0;background:#f8f5f2;font-family:Arial,sans-serif;color:#1f2937;">
    <div style="max-width:620px;margin:0 auto;padding:24px 16px;">
        <div style="background:#ffffff;border:1px solid #f0d9cf;border-radius:24px;padding:32px;box-shadow:0 20px 60px rgba(31,41,55,0.08);">
            <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#d85d49;">
                Hamza Lhamza
            </p>
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#18233a;">
                Reinitialiser votre mot de passe
            </h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#475569;">
                Bonjour {{ $user->name ?: 'client' }}, nous avons recu une demande de reinitialisation pour votre compte.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
                Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire automatiquement pour proteger votre compte.
            </p>
            <p style="margin:0 0 28px;">
                <a href="{{ $resetUrl }}" style="display:inline-block;background:#ff6f61;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:14px;font-weight:bold;">
                    Reinitialiser mon mot de passe
                </a>
            </p>
            <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#64748b;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
            </p>
            <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.6;color:#d85d49;">
                {{ $resetUrl }}
            </p>
        </div>
    </div>
</body>
</html>
