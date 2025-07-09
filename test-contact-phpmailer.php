<?php
// Test Contact Form with PHPMailer - Enhanced Debugging Version
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
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$debug_info = [];
$debug_info['timestamp'] = date('Y-m-d H:i:s');
$debug_info['request_method'] = $_SERVER['REQUEST_METHOD'];
$debug_info['php_version'] = phpversion();
$debug_info['server_name'] = $_SERVER['SERVER_NAME'] ?? 'Unknown';

// Test PHPMailer availability
$debug_info['phpmailer_available'] = class_exists('PHPMailer\PHPMailer\PHPMailer');
$debug_info['phpmailer_smtp_available'] = class_exists('PHPMailer\PHPMailer\SMTP');
$debug_info['phpmailer_exception_available'] = class_exists('PHPMailer\PHPMailer\Exception');

// Check file permissions
$debug_info['phpmailer_files_exist'] = [
    'PHPMailer.php' => file_exists('PHPMailer-master/src/PHPMailer.php'),
    'SMTP.php' => file_exists('PHPMailer-master/src/SMTP.php'),
    'Exception.php' => file_exists('PHPMailer-master/src/Exception.php')
];

// If GET request, show debug info and form
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>PHPMailer Test Form</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .debug-info { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
            button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #005a87; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 10px; border-radius: 4px; margin: 10px 0; }
            .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 10px; border-radius: 4px; margin: 10px 0; }
            pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>PHPMailer Test Form</h1>
            
            <div class="debug-info">
                <h3>System Debug Information</h3>
                <pre><?php echo json_encode($debug_info, JSON_PRETTY_PRINT); ?></pre>
            </div>

            <form id="testForm" onsubmit="submitForm(event)">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" value="Test User" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="test@example.com" required>
                </div>
                
                <div class="form-group">
                    <label for="message">Message:</label>
                    <textarea id="message" name="message" rows="4">This is a test message from the PHPMailer test form.</textarea>
                </div>
                
                <div class="form-group">
                    <label for="smtp_debug">SMTP Debug Level:</label>
                    <select id="smtp_debug" name="smtp_debug">
                        <option value="0">0 - No debug output</option>
                        <option value="1">1 - Client messages</option>
                        <option value="2" selected>2 - Client and server messages</option>
                        <option value="3">3 - As 2 plus connection status</option>
                        <option value="4">4 - Low-level data output</option>
                    </select>
                </div>
                
                <button type="submit">Send Test Email</button>
            </form>
            
            <div id="result"></div>
        </div>

        <script>
        async function submitForm(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<p>Sending email...</p>';
            
            try {
                const response = await fetch('test-contact-phpmailer.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    resultDiv.innerHTML = '<div class="success">' + result.message + '</div>';
                } else {
                    resultDiv.innerHTML = '<div class="error">' + result.message + '</div>';
                }
                
                if (result.debug_info) {
                    resultDiv.innerHTML += '<div class="debug-info"><h3>Debug Information</h3><pre>' + JSON.stringify(result.debug_info, null, 2) + '</pre></div>';
                }
                
                if (result.smtp_debug) {
                    resultDiv.innerHTML += '<div class="debug-info"><h3>SMTP Debug Output</h3><pre>' + result.smtp_debug + '</pre></div>';
                }
                
            } catch (error) {
                resultDiv.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
            }
        }
        </script>
    </body>
    </html>
    <?php
    exit();
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed', 'debug_info' => $debug_info]);
    exit();
}

try {
    // Get JSON input
    $input_raw = file_get_contents('php://input');
    $debug_info['raw_input'] = $input_raw;
    
    $input = json_decode($input_raw, true);
    $debug_info['json_decode_error'] = json_last_error_msg();
    
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
    $smtp_debug_level = isset($input['smtp_debug']) ? (int)$input['smtp_debug'] : 2;

    $debug_info['form_data'] = [
        'name' => $name,
        'email' => $email,
        'message_length' => strlen($message),
        'smtp_debug_level' => $smtp_debug_level
    ];

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address');
    }

    // Create PHPMailer instance
    $mail = new PHPMailer(true);
    
    // Capture SMTP debug output
    ob_start();

    try {
        // Server settings with debug
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'archisalt@salt-lab.net';
        $mail->Password   = 'wthybcdztzzhjwgh';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        
        // Enable SMTP debugging
        $mail->SMTPDebug = $smtp_debug_level;
        $mail->Debugoutput = function($str, $level) {
            echo "Debug level $level: $str\n";
        };

        $debug_info['smtp_config'] = [
            'host' => $mail->Host,
            'port' => $mail->Port,
            'username' => $mail->Username,
            'password_set' => !empty($mail->Password) && $mail->Password !== 'YOUR_APP_PASSWORD_HERE',
            'smtp_secure' => $mail->SMTPSecure,
            'smtp_debug_level' => $mail->SMTPDebug
        ];

        // Recipients
        $mail->setFrom('archisalt@salt-lab.net', 'SalT Lab Test Form');
        $mail->addAddress('archisalt@gmail.com', 'Sal Taranto');
        $mail->addReplyTo($email, $name);

        // Content
        $mail->isHTML(true);
        $mail->Subject = '[TEST] Contact Form Submission from ' . $name;
        
        // HTML body
        $mail->Body = '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #007cba; padding: 20px; color: white;">
                <h1>TEST EMAIL - PHPMailer Working!</h1>
                <p>This is a test email from the PHPMailer test form</p>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
                <h2>Contact Details</h2>
                <p><strong>Name:</strong> ' . htmlspecialchars($name) . '</p>
                <p><strong>Email:</strong> ' . htmlspecialchars($email) . '</p>
                <p><strong>Message:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 4px;">
                    ' . nl2br(htmlspecialchars($message)) . '
                </div>
                
                <hr>
                <p><small>Sent at: ' . date('Y-m-d H:i:s') . '</small></p>
                <p><small>Server: ' . ($_SERVER['SERVER_NAME'] ?? 'Unknown') . '</small></p>
                <p><small>IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . '</small></p>
            </div>
        </div>';

        // Plain text alternative
        $mail->AltBody = "TEST EMAIL - PHPMailer Working!\n\n";
        $mail->AltBody .= "Name: " . $name . "\n";
        $mail->AltBody .= "Email: " . $email . "\n";
        $mail->AltBody .= "Message: " . $message . "\n";
        $mail->AltBody .= "\nSent at: " . date('Y-m-d H:i:s');

        // Send the email
        $mail->send();
        
        $smtp_debug_output = ob_get_contents();
        ob_end_clean();
        
        $debug_info['email_sent'] = true;
        $debug_info['smtp_response'] = 'Email sent successfully';
        
        echo json_encode([
            'success' => true, 
            'message' => 'TEST EMAIL SENT SUCCESSFULLY! Check your inbox at archisalt@salt-lab.net',
            'debug_info' => $debug_info,
            'smtp_debug' => $smtp_debug_output
        ]);

    } catch (Exception $e) {
        $smtp_debug_output = ob_get_contents();
        ob_end_clean();
        
        $debug_info['email_sent'] = false;
        $debug_info['phpmailer_error'] = $mail->ErrorInfo;
        $debug_info['exception_message'] = $e->getMessage();
        
        echo json_encode([
            'success' => false,
            'message' => 'PHPMailer Error: ' . $mail->ErrorInfo,
            'debug_info' => $debug_info,
            'smtp_debug' => $smtp_debug_output
        ]);
    }

} catch (Exception $e) {
    $debug_info['general_error'] = $e->getMessage();
    
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage(),
        'debug_info' => $debug_info
    ]);
}
?>