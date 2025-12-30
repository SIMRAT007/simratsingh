// Vercel Serverless Function for Contact Form
// This keeps the Web3Forms API key secure on the server

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Get the API key from environment variable (set in Vercel dashboard)
  // URL has a default fallback, so only API key is required
  const WEB3FORMS_KEY = process.env.WEB3FORMS_ACCESS_KEY;
  const WEB3FORMS_URL = process.env.WEB3FORMS_API_URL || 'https://api.web3forms.com/submit';

  if (!WEB3FORMS_KEY) {
    console.error('WEB3FORMS_ACCESS_KEY not configured in environment variables');
    return res.status(500).json({ 
      success: false, 
      message: 'Server configuration error' 
    });
  }

  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields' 
      });
    }

    // Send to Web3Forms
    const response = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        name: name,
        email: email,
        phone: phone || 'Not provided',
        subject: subject,
        message: message,
        from_name: 'Portfolio Contact Form',
        // Honeypot for spam protection
        botcheck: '',
      })
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Message sent successfully!' 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: data.message || 'Failed to send message' 
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again later.' 
    });
  }
}

