const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = {
      sendMail: async (opts) => {
        console.log("[Mailer] SMTP not configured. Logging email:", opts);
        return { messageId: "logged", envelope: opts };
      },
    };
  }

  return transporter;
}

async function verifyConnection() {
  if (!process.env.SMTP_HOST) return false;
  try {
    const t = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await t.verify();
    console.log("SMTP connection verified");
    return true;
  } catch (err) {
    console.warn("SMTP connection failed:", err.message);
    return false;
  }
}

module.exports = { getTransporter, verifyConnection };
