import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendMail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `Outpost <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (e) {
    console.error("Email failed:", e);
  }
}   