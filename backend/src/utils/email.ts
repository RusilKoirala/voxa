import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


export const sendVerificationEmail = async (email: string, verificationUrl: string) => {
    await resend.emails.send({
        from: "Voxa <no-reply@rusilkoirala.com.np>",
        to: [email],
        subject: "Verify your email for Voxa",
        html: `
            <h1> Welcome to Voxa! </h1>
            <p> Please verify your email by clicking the link below: </p>
            <a href="${verificationUrl}">Verify Email</a>
            <p> This link will expire in 24 hours :)</p>
        `
    })
}

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
    await resend.emails.send({
        from: "Voxa <no-reply@rusilkoirala.com.np>",
        to: [email],
        subject: "Reset your password for Voxa",
        html: `
            <h1> Reset your password for Voxa </h1>
            <p> Please reset your password by clicking the link below: </p>
            <a href="${resetUrl}">Reset Password</a>
            <p> This link will expire in 1 hour :)</p>
        `
    })
}