# reCAPTCHA Setup for Contact Form

## Overview
The contact form now includes Google reCAPTCHA v2 to prevent spam and bot submissions. The implementation works entirely client-side with server-side verification.

## Setup Instructions

### 1. Get reCAPTCHA Keys
1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)2 ClickCreate" to add a new site3 Choose reCAPTCHA v2" →I'mnot a robot" Checkbox
4. Add your domain: `toolsjockey.com`
5. Accept the terms and click "Submit"
6. Copy your **Site Key** and **Secret Key**

### 2. Update the Frontend
In `src/pages/Contact.tsx`, replace the placeholder site key:

```typescript
// Line 32: Replace with your actual site key
sitekey: '6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX,```

And in the reCAPTCHA widget div:

```jsx
// Line ~220: Replace with your actual site key
<div ref={recaptchaRef} className=g-recaptcha" data-sitekey="YOUR_ACTUAL_SITE_KEY></div>
```

### 3Update the Backend
In `server/contact-form-handler.php`, replace the placeholder secret key:

```php
// Line 32: Replace with your actual secret key
$recaptcha_secret = 'YOUR_RECAPTCHA_SECRET_KEY';
```

## How It Works1. **Client-side**: reCAPTCHA widget loads and validates user interaction
2. **Form submission**: User completes reCAPTCHA and submits form
3. **Frontend**: Captures reCAPTCHA response token and sends with form data
4. **Backend**: PHP handler verifies the token with Google's API
5**Email**: Only if verification passes, the email is sent

## Security Benefits

- Prevents automated spam submissions
- Validates human interaction before processing
- Works with your existing client-side architecture
- No user data stored by Google

## Testing1Test the form with reCAPTCHA completed
2. Test without completing reCAPTCHA (should show error)
3. Verify emails are received correctly
4t spam submissions are blocked

## Troubleshooting

- **reCAPTCHA not loading**: Check your site key and domain configuration
- **Verification failing**: Ensure your secret key is correct
- **CORS errors**: Verify the PHP handler is accessible from your domain

## Notes

- The reCAPTCHA widget is styled to match your form design
- Form submission is disabled until reCAPTCHA is completed
- The widget resets after each submission
- All processing remains client-side for privacy 