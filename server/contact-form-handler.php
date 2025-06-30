<?php
// Set headers to handle CORS and JSON responses
header("Access-Control-Allow-Origin: https://toolsjockey.com");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get the JSON data from the request
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate required fields
if (!isset($data['name']) || !isset($data['email']) || !isset($data['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

// Basic validation
$name = filter_var($data['name'], FILTER_SANITIZE_STRING);
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$message = filter_var($data['message'], FILTER_SANITIZE_STRING);
$subject = isset($data['subject']) ? filter_var($data['subject'], FILTER_SANITIZE_STRING) : 'Contact Form Submission';

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit();
}

// Set up email details
$to = 'your-email@your-other-domain.com'; // Your email address
$headers = "From: $name <$email>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

// Create email body
$email_body = "
<html>
<head>
    <title>Contact Form Submission</title>
</head>
<body>
    <h2>Contact Form Submission from ToolsJockey.com</h2>
    <p><strong>Name:</strong> $name</p>
    <p><strong>Email:</strong> $email</p>
    <p><strong>Message:</strong></p>
    <p>" . nl2br($message) . "</p>
</body>
</html>
";

// Send the email
$mail_sent = mail($to, $subject, $email_body, $headers);

if ($mail_sent) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Your message has been sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
?> 