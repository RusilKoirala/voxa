import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)


// send user verification email
export const sendVerificationEmail = async (email: string, verificationUrl: string) => {
  await resend.emails.send({
    from: 'Voxa <no-reply@rusilkoirala.com.np>',
    to: [email],
    subject: 'Verify your Voxa email',
    html: `
      <h1>Welcome to Voxa!</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link expires in 24 hours.</p>
    `
  })
}

// send user passwrord reset email
export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  await resend.emails.send({
    from: 'Voxa <no-reply@rusilkoirala.com.np>',
    to: [email],
    subject: 'Reset your Voxa password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `
  })
}
