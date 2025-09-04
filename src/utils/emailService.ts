import nodemailer from 'nodemailer';
import config from '../app/config';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.smtp_host,
    port: Number(config.smtp_port) || 587,
    secure: false,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
  });
};

export const sendOTPEmail = async (email: string, otpCode: string, fullName: string) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.smtp_user,
      to: email,
      subject: 'Email Verification - OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${fullName}!</h2>
          <p>Thank you for registering with us. Please use the following OTP code to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
          </div>
          <p>This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Loop Nest Team</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    // Don't log to console, just return error
    return { success: false, error: 'Failed to send email' };
  }
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
