
const nodemailer = require('nodemailer');
// const pug = require('pug');
// const htmlToText = require('html-to-text');


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

/*
module.exports = class Email {
  constructor (user ,url ){
    this.to = user.email;
    this.fristName = user.name.split(' ')[0];
    this.url = url;
    this.from =  `hossam wahed <${process.env.EMAIL_FROM}>`
  }

 newTransport(){
    if(process.env.NODE_ENV === 'production') {
      return 1
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  };

 async send(template , subject) {
    // 1) render html based pug template
    const html = pug.renderFile (
      `${__dirname}/../Views/emails/${template}.pug`, 
      {
      fristName: this.fristName,
      url : this.url,
      subject
     }
    );
    // 2) Define email options
    const mailoptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
      // 3 ) craete transporter and send email
      this.newTransport()

     await this.newTransport().sendMail(mailoptions)
    }

async  sendWelcom(){
    await  this.send('welcom','welcom to Natours Family')
  }
  
};
*/
module.exports = sendMail;