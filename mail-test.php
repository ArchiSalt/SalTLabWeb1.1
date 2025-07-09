<?php
// Simple mail test script to diagnose mail issues
header('Content-Type: application/json');

$test_results = [];

// Test 1: Check if mail function exists
$test_results['mail_function_exists'] = function_exists('mail');

// Test 2: Check PHP mail configuration
$test_results['php_config'] = [
    'sendmail_path' => ini_get('sendmail_path'),
    'SMTP' => ini_get('SMTP'),
    'smtp_port' => ini_get('smtp_port'),
    'sendmail_from' => ini_get('sendmail_from')
];

// Test 3: Try to send a simple test email
if (function_exists('mail')) {
    $test_email = @mail(
        'archisalt@salt-lab.net',
        'Mail Test from ' . ($_SERVER['SERVER_NAME'] ?? 'salt-lab.net'),
        'This is a test email sent at ' . date('Y-m-d H:i:s') . ' to verify mail functionality.',
        'From: noreply@salt-lab.net'
    );
    
    $test_results['test_email_sent'] = $test_email;
} else {
    $test_results['test_email_sent'] = false;
}

// Test 4: Check server environment
$test_results['server_info'] = [
    'php_version' => phpversion(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'server_name' => $_SERVER['SERVER_NAME'] ?? 'Unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'
];

// Test 5: Check if we can write files (for backup)
$test_file = 'test_write.txt';
$write_test = file_put_contents($test_file, 'test');
$test_results['file_write_works'] = $write_test !== false;
if ($write_test !== false) {
    unlink($test_file); // Clean up
}

echo json_encode($test_results, JSON_PRETTY_PRINT);
?>