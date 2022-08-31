const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `meet vaghasiya nodejs test" <${process.env.ADMIN_EMAIL}>`;
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/views/mail/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };
    await this.newTransporter().sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
    });
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the fake app.');
  }
  async resetPassword() {
    await this.send('reset-password', 'password reset link');
  }
};
