import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import config from './config';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(
      smtpTransport(config.smtpConfig),
    );
  }

  async sendVerificationEmail(email: any) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: config.smtpConfig.auth.user,
      ...email,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
