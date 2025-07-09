<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Include PHPMailer classes
require_once 'PHPMailer-master/src/PHPMailer.php';
require_once 'PHPMailer-master/src/SMTP.php';
require_once 'PHPMailer-master/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Get JSON input
    $input_raw = file_get_contents('php://input');
    error_log("Raw input: " . $input_raw);
    
    $input = json_decode($input_raw, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    // Validate input
    if (!$input || !isset($input['name']) || !isset($input['email'])) {
        throw new Exception('Name and email are required');
    }

    $name = trim($input['name']);
    $email = trim($input['email']);
    $message = isset($input['message']) ? trim($input['message']) : '';

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address');
    }

    // Save to backup file first (this always works as a fallback)
    $backup_file = 'contact_messages.txt';
    $backup_content = "\n" . str_repeat("=", 50) . "\n";
    $backup_content .= "Date: " . date('Y-m-d H:i:s') . "\n";
    $backup_content .= "Name: " . $name . "\n";
    $backup_content .= "Email: " . $email . "\n";
    $backup_content .= "Message: " . $message . "\n";
    $backup_content .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n";
    $backup_content .= "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . "\n";
    $backup_content .= str_repeat("=", 50) . "\n";
    
    $backup_saved = file_put_contents($backup_file, $backup_content, FILE_APPEND | LOCK_EX);
    
    if (!$backup_saved) {
        error_log("Failed to save to backup file");
    } else {
        error_log("Message saved to backup file: $backup_file");
    }

    $email_success = false;
    $confirmation_success = false;

    // EMAIL 1: Send notification to admin (archisalt@salt-lab.net)
    try {
        $mail = new PHPMailer(true);

        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'archisalt@salt-lab.net';
        $mail->Password   = 'wthybcdztzzhjwgh';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients for admin notification
        $mail->setFrom('archisalt@salt-lab.net', 'SalT Lab Contact Form');
        $mail->addAddress('archisalt@salt-lab.net', 'SalT Lab Admin');
        $mail->addReplyTo($email, $name);

        // Content for admin
        $mail->isHTML(true);
        $mail->Subject = 'New Contact Form Submission from ' . $name;
        
        // HTML body for admin
        $mail->Body = '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                <h1 style="color: #ffa500; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
                <p style="color: #cccccc; margin: 10px 0 0 0;">From SalT Lab Website</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #ffa500;">
                <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
                
                <div style="margin-bottom: 20px;">
                    <strong style="color: #555;">Name:</strong>
                    <p style="margin: 5px 0; color: #333; font-size: 16px;">' . htmlspecialchars($name) . '</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <strong style="color: #555;">Email:</strong>
                    <p style="margin: 5px 0; color: #333; font-size: 16px;">
                        <a href="mailto:' . htmlspecialchars($email) . '" style="color: #ffa500; text-decoration: none;">' . htmlspecialchars($email) . '</a>
                    </p>
                </div>
                
                ' . ($message ? '
                <div style="margin-bottom: 20px;">
                    <strong style="color: #555;">Message:</strong>
                    <div style="margin: 10px 0; padding: 15px; background: white; border-radius: 5px; border: 1px solid #ddd;">
                        <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">' . htmlspecialchars($message) . '</p>
                    </div>
                </div>
                ' : '') . '
            </div>
            
            <div style="margin-top: 20px; padding: 20px; background: #f1f1f1; border-radius: 10px; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                    This email was sent from the SalT Lab contact form at ' . date('Y-m-d H:i:s') . '
                </p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
                    IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . ' | Server: ' . ($_SERVER['SERVER_NAME'] ?? 'Unknown') . '
                </p>
            </div>
        </div>';

        // Plain text alternative for admin
        $mail->AltBody = "New contact form submission:\n\n";
        $mail->AltBody .= "Name: " . $name . "\n";
        $mail->AltBody .= "Email: " . $email . "\n";
        $mail->AltBody .= "Message: " . $message . "\n";
        $mail->AltBody .= "\nSent from SalT Lab website on " . date('Y-m-d H:i:s');
        $mail->AltBody .= "\nServer: " . ($_SERVER['SERVER_NAME'] ?? 'Unknown');
        $mail->AltBody .= "\nIP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown');

        // Send admin notification
        $mail->send();
        $email_success = true;
        error_log("Admin notification email sent successfully");

    } catch (Exception $e) {
        error_log("Admin email failed: " . $e->getMessage());
    }

    // EMAIL 2: Send confirmation to user
    try {
        // Clear the previous email and create new instance for user confirmation
        $confirmMail = new PHPMailer(true);

        // Server settings (same as before)
        $confirmMail->isSMTP();
        $confirmMail->Host       = 'smtp.gmail.com';
        $confirmMail->SMTPAuth   = true;
        $confirmMail->Username   = 'archisalt@salt-lab.net';
        $confirmMail->Password   = 'wthybcdztzzhjwgh';
        $confirmMail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $confirmMail->Port       = 587;

        // Recipients for user confirmation
        $confirmMail->setFrom('archisalt@salt-lab.net', 'SalT Lab');
        $confirmMail->addAddress($email, $name);

        // Content for user confirmation
        $confirmMail->isHTML(true);
        $confirmMail->Subject = 'Thank you for contacting SalT Lab';
        
        // HTML body for user confirmation
        $confirmMail->Body = '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                <h1 style="color: #ffa500; margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
                <p style="color: #cccccc; margin: 10px 0 0 0;">SalT Lab - Tools to Plan, Design, and Build</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #ffa500;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 0;">
                    Hi <strong>' . htmlspecialchars($name) . '</strong>,
                </p>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    Thank you for reaching out to us! We have received your message and will get back to you with a personal (non-automated) reply as soon as possible.
                </p>
                
                <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007cba;">
                    <h3 style="color: #007cba; margin-top: 0; font-size: 18px;">Your Message Summary:</h3>
                    <p style="color: #333; margin: 5px 0;"><strong>Name:</strong> ' . htmlspecialchars($name) . '</p>
                    <p style="color: #333; margin: 5px 0;"><strong>Email:</strong> ' . htmlspecialchars($email) . '</p>
                    ' . ($message ? '<p style="color: #333; margin: 10px 0 0 0;"><strong>Message:</strong></p>
                    <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 5px;">
                        <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">' . htmlspecialchars($message) . '</p>
                    </div>' : '') . '
                </div>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    In the meantime, feel free to explore our tools and resources at <a href="https://salt-lab.net" style="color: #ffa500; text-decoration: none;">salt-lab.net</a>.
                </p>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    Best regards,<br>
                    <strong>The SalT Lab Team</strong>
                </p>
            </div>
            
            <div style="margin-top: 20px; padding: 20px; background: #f1f1f1; border-radius: 10px; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                    This is an automated confirmation email sent on ' . date('Y-m-d H:i:s') . '
                </p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
                    Please do not reply to this email. We will contact you directly from archisalt@salt-lab.net
                </p>
            </div>
        </div>';

        // Plain text alternative for user
        $confirmMail->AltBody = "Thank you for contacting SalT Lab!\n\n";
        $confirmMail->AltBody .= "Hi " . $name . ",\n\n";
        $confirmMail->AltBody .= "Thank you for reaching out to us! We have received your message and will get back to you with a personal (non-automated) reply as soon as possible.\n\n";
        $confirmMail->AltBody .= "Your Message Summary:\n";
        $confirmMail->AltBody .= "Name: " . $name . "\n";
        $confirmMail->AltBody .= "Email: " . $email . "\n";
        if ($message) {
            $confirmMail->AltBody .= "Message: " . $message . "\n";
        }
        $confirmMail->AltBody .= "\nIn the meantime, feel free to explore our tools and resources at https://salt-lab.net\n\n";
        $confirmMail->AltBody .= "Best regards,\nThe SalT Lab Team\n\n";
        $confirmMail->AltBody .= "This is an automated confirmation email sent on " . date('Y-m-d H:i:s') . "\n";
        $confirmMail->AltBody .= "Please do not reply to this email. We will contact you directly from archisalt@salt-lab.net";

        // Send user confirmation
        $confirmMail->send();
        $confirmation_success = true;
        error_log("User confirmation email sent successfully to: " . $email);

    } catch (Exception $e) {
        error_log("User confirmation email failed: " . $e->getMessage());
    }

    // Determine response based on email success
    if ($email_success && $confirmation_success) {
        echo json_encode([
            'success' => true, 
            'message' => 'Thank you! Your message has been sent successfully. We\'ve also sent you a confirmation email and will get back to you soon with a personal reply.'
        ]);
    } else if ($email_success) {
        echo json_encode([
            'success' => true, 
            'message' => 'Thank you! Your message has been sent successfully. We\'ll get back to you soon. (Note: Confirmation email may be delayed)'
        ]);
    } else if ($backup_saved) {
        echo json_encode([
            'success' => true,
            'message' => 'Thank you! Your message has been received and saved. We\'ll contact you soon. (Note: Email delivery may be delayed due to server configuration)'
        ]);
    } else {
        throw new Exception('Failed to process your message. Please try again or contact us directly at archisalt@salt-lab.net');
    }

} catch (Exception $e) {
    error_log("Contact form error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage(),
        'debug_info' => [
            'php_version' => phpversion(),
            'phpmailer_available' => class_exists('PHPMailer\PHPMailer\PHPMailer'),
            'server_name' => $_SERVER['SERVER_NAME'] ?? 'Unknown',
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
}
?>