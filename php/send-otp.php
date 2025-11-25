<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email']) || !isset($input['name']) || !isset($input['otp'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$name = htmlspecialchars($input['name'], ENT_QUOTES, 'UTF-8');
$otp = htmlspecialchars($input['otp'], ENT_QUOTES, 'UTF-8');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Email content
$subject = "Your OTP Verification Code - Globe Travel";
$message = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class=\"container\">
        <div class=\"header\">
            <h1>🌍 Globe Travel</h1>
            <p>Email Verification</p>
        </div>
        <div class=\"content\">
            <p>Hello {$name},</p>
            <p>Thank you for signing up! Please use the following OTP code to verify your email address:</p>
            <div class=\"otp-box\">
                <div class=\"otp-code\">{$otp}</div>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <div class=\"footer\">
                <p>© 2024 Globe Travel. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
";

// Email headers
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: Globe Travel <noreply@globe-travel.com>" . "\r\n";
$headers .= "Reply-To: noreply@globe-travel.com" . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email using PHP mail()
$mailSent = mail($email, $subject, $message, $headers);

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'OTP email sent successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to send email. Please check your PHP mail configuration.'
    ]);
}
?>

