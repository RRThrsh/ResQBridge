const { getTransporter } = require("../config/email");

const FROM = process.env.SMTP_FROM || "noreply@resqbridge.com";

async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: FROM,
    to,
    subject,
    html,
    text,
  });
}

async function sendOtp(email, otp) {
  return sendEmail({
    to: email,
    subject: "ResQBridge - Your OTP Code",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing: 6px; font-size: 32px;">${otp}</h1>
      <p>This code expires in 1 minute.</p>
    `,
    text: `Your OTP code is: ${otp}. It expires in 1 minute.`,
  });
}

async function sendPasswordReset(email, resetToken) {
  return sendEmail({
    to: email,
    subject: "ResQBridge - Password Reset",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}">
        Reset Password
      </a>
      <p>This link expires in 1 hour.</p>
    `,
    text: `Reset your password at: ${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`,
  });
}

async function sendWelcome(email, firstName) {
  return sendEmail({
    to: email,
    subject: "Welcome to ResQBridge",
    html: `<h2>Welcome, ${firstName}!</h2><p>Your account has been created.</p>`,
    text: `Welcome, ${firstName}! Your account has been created.`,
  });
}

async function sendReportStatus(email, reportType, reportId, status) {
  return sendEmail({
    to: email,
    subject: `ResQBridge - ${reportType} Report ${status}`,
    html: `
      <h2>Report ${status}</h2>
      <p>Your ${reportType} report (ID: ${reportId}) has been <strong>${status}</strong>.</p>
    `,
    text: `Your ${reportType} report (ID: ${reportId}) has been ${status}.`,
  });
}

async function sendAssignment(email, reportType, reportId) {
  return sendEmail({
    to: email,
    subject: `ResQBridge - ${reportType} Report Assigned`,
    html: `
      <h2>New Assignment</h2>
      <p>A ${reportType} report (ID: ${reportId}) has been assigned to you.</p>
    `,
    text: `A ${reportType} report (ID: ${reportId}) has been assigned to you.`,
  });
}

module.exports = {
  sendEmail,
  sendOtp,
  sendPasswordReset,
  sendWelcome,
  sendReportStatus,
  sendAssignment,
};
