import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to handle /api/contact during development
function contactApiPlugin(env) {
  return {
    name: 'contact-api',
    configureServer(server) {
      server.middlewares.use('/api/contact', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, message: 'Method not allowed' }))
          return
        }

        // Read the request body
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const formData = JSON.parse(body)
            const { name, email, phone, subject, message } = formData

            // Validate required fields
            if (!name || !email || !subject || !message) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, message: 'Please fill in all required fields' }))
              return
            }

            // Check for API key
            const accessKey = env.WEB3FORMS_ACCESS_KEY
            const apiUrl = env.WEB3FORMS_API_URL || 'https://api.web3forms.com/submit'

            if (!accessKey) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, message: 'WEB3FORMS_ACCESS_KEY not configured in .env.local' }))
              return
            }

            // Send to Web3Forms
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                access_key: accessKey,
                name,
                email,
                phone: phone || 'Not provided',
                subject,
                message,
                from_name: 'Portfolio Contact Form',
                botcheck: '',
              })
            })

            const data = await response.json()

            res.statusCode = data.success ? 200 : 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              success: data.success,
              message: data.success ? 'Message sent successfully!' : (data.message || 'Failed to send message')
            }))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, message: 'Something went wrong. Please try again later.' }))
          }
        })
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss(), contactApiPlugin(env)],
  }
})
