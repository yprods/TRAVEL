import nodemailer from 'nodemailer'

// Create transporter using PHP mail (via SMTP or direct)
// For production, configure with your SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 25,
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
})

export const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@globe-travel.com',
    to: email,
    subject: 'Your OTP Verification Code',
    html: `
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
        <div class="container">
          <div class="header">
            <h1>🌍 Globe Travel</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for signing up! Please use the following OTP code to verify your email address:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <div class="footer">
              <p>© 2024 Globe Travel. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    // Fallback: Try using PHP mail script
    return await sendOTPViaPHP(email, name, otp)
  }
}

// Fallback PHP mail function
const sendOTPViaPHP = async (email, name, otp) => {
  try {
    const response = await fetch('http://localhost:8080/send-otp.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, otp })
    })
    return await response.json()
  } catch (error) {
    console.error('PHP mail fallback failed:', error)
    throw error
  }
}

