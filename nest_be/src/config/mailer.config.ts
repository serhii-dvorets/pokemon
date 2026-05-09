import { registerAs } from '@nestjs/config';

export default registerAs('mailer', () => ({
  transport: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT, 10) || 465,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASS,
    },
  },
  mailFrom: process.env.MAIL_FROM,
  mainUrl: process.env.MAIN_URL,
}));
