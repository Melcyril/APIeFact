require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {

    const info = await transporter.sendMail({
      from: `"Mon E-commerce" <${process.env.SMTP_USER}>`,
      to: "magic.cyril00@gmail.com",
      subject: "Test email MonShop",
      text: "Ceci est un test.",
    });

    console.log("✅ Email envoyé :", info.messageId);

  } catch (error) {

    console.error("❌ Erreur :", error);

  }
}

test();