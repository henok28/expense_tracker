import { transcode } from "node:buffer";
import nodemailer from "nodemailer";
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}
//
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: "Expense Tracker App <noreply@ExpenseTrackerApp.com>",
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
};
