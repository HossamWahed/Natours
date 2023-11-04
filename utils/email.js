
const nodemailer = require('nodemailer');

const sendMail = async  (options) => {
  // 1) create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST_R,
    port: process.env.EMAIL_PORT_R,
    auth: {
      user: process.env.EMAIL_USERNAME_REAL,
      pass: process.env.EMAIL_PASSWORD_REAL,
    },
  });

  // 2) Define the email options
  const mailoptions = {
    from: 'hossam wahed <hossam@gmail.com>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };
  // 2) Actully send the email
  await transporter.sendMail(mailoptions);
};
module.exports = sendMail;