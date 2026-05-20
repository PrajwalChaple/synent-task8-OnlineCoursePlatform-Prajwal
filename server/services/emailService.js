const nodemailer = require('nodemailer');

// Setup transporter
let transporter;

const setupTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 585,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Nodemailer SMTP Transporter configured.');
  } else {
    console.log('SMTP config missing in .env. Falling back to Console Email Logger.');
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  setupTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@courseplatform.com',
        to,
        subject,
        text,
        html,
      });
      console.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending email via Nodemailer:', error);
      // Fall back to logging on error
      logEmailToConsole({ to, subject, text });
      return true;
    }
  } else {
    logEmailToConsole({ to, subject, text });
    return true;
  }
};

const logEmailToConsole = ({ to, subject, text }) => {
  console.log('\n==================================================');
  console.log('               [EMAIL SIMULATED OUTBOX]            ');
  console.log('==================================================');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Date:    ${new Date().toISOString()}`);
  console.log('--------------------------------------------------');
  console.log(text);
  console.log('==================================================\n');
};

// Send OTP Verification Email
const sendVerificationEmail = async (email, name, otp) => {
  const subject = 'Verify your email - Online Course Platform';
  const text = `Hello ${name},\n\nYour OTP for registration on the Online Course Platform is: ${otp}.\nThis code is valid for 15 minutes.\n\nThank you!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; text-align: center;">Welcome, ${name}!</h2>
      <p>Thank you for registering on our platform. Please verify your email using the verification code below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background-color: #f1f5f9; padding: 10px 20px; border-radius: 6px; border: 1px dashed #cbd5e1;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 15 minutes.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, text, html });
};

// Send Password Reset OTP Email
const sendPasswordResetEmail = async (email, name, otp) => {
  const subject = 'Password Reset OTP - Online Course Platform';
  const text = `Hello ${name},\n\nWe received a request to reset your password. Your password reset OTP is: ${otp}.\nThis code is valid for 10 minutes. If you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; text-align: center;">Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Use the verification OTP below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc2626; background-color: #fef2f2; padding: 10px 20px; border-radius: 6px; border: 1px dashed #fee2e2;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px; text-align: center;">This OTP is valid for 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, text, html });
};

// Send Enrollment Confirmation Email
const sendEnrollmentEmail = async (email, name, courseTitle, amount) => {
  const subject = 'Enrollment Confirmation - ' + courseTitle;
  const text = `Hello ${name},\n\nCongratulations! You have successfully enrolled in the course: "${courseTitle}".\nYou can now access the course from your Student Dashboard.\n\nTransaction Amount: INR ${amount}\n\nHappy Learning!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #10b981; text-align: center;">Successfully Enrolled!</h2>
      <p>Hello ${name},</p>
      <p>Congratulations! You have successfully enrolled in the course: <strong>${courseTitle}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Course Name</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${courseTitle}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Price Paid</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; color: #10b981; font-weight: bold;">INR ${amount}</td>
        </tr>
      </table>
      <p>Go to your dashboard now and start learning!</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEnrollmentEmail,
};
