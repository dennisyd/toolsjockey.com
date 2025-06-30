# Setting Up the Contact Form Handler

This guide will walk you through setting up the contact form handler on your other domain to receive emails from the ToolsJockey.com contact form.

## Step 1: Upload the PHP Script

1. Upload the `contact-form-handler.php` file to your other domain's web server.
2. Place it in a directory like `/api/contact/` or wherever you prefer.
3. Make sure the file has proper permissions (typically 644).

## Step 2: Update the Endpoint URL

1. Open `src/pages/Contact.tsx` in your ToolsJockey.com codebase.
2. Update the `FORM_ENDPOINT` constant with your actual endpoint URL:

```javascript
const FORM_ENDPOINT = 'https://your-other-domain.com/api/contact/contact-form-handler.php';
```

## Step 3: Configure the Email Address

1. Open the `contact-form-handler.php` file on your other domain.
2. Update the `$to` variable with your actual email address:

```php
$to = 'your-actual-email@your-other-domain.com';
```

## Step 4: Configure CORS Settings

1. In the `contact-form-handler.php` file, update the allowed origin to match your ToolsJockey.com domain:

```php
header("Access-Control-Allow-Origin: https://toolsjockey.com");
```

If you have multiple domains or subdomains, you can configure them accordingly.

## Step 5: Test the Form

1. Run your ToolsJockey.com website locally or deploy it.
2. Fill out the contact form and submit it using the "Submit Directly" option.
3. Check your email to see if you received the message.

## Troubleshooting

If you encounter issues with the form submission:

1. **CORS Errors**: Make sure the Access-Control-Allow-Origin header is correctly set to your domain.
2. **PHP Mail Function**: Ensure that the mail() function is enabled and properly configured on your server.
3. **Server Logs**: Check your server logs for any PHP errors or warnings.
4. **Network Tab**: Use your browser's developer tools to inspect the network request and response.

## Security Considerations

- The script includes basic validation and sanitization of inputs.
- Consider adding additional security measures such as rate limiting or CAPTCHA if needed.
- Make sure your server is configured to use HTTPS for secure form submissions.

## Additional Configuration Options

### Using a Different Mail Library

If you prefer to use a more robust mailing library like PHPMailer:

1. Install PHPMailer on your server.
2. Replace the `mail()` function with PHPMailer's methods.
3. This can provide better reliability and additional features like attachments.

### Storing Form Submissions in a Database

You might want to store form submissions in a database before or in addition to sending emails:

1. Set up a database connection in your PHP script.
2. Insert the form data into a table before sending the email.
3. This provides a backup of all submissions and allows for easier management. 