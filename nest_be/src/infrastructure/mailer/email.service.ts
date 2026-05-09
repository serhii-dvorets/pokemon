import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TemplateService } from './template.service';

@Injectable()
export class EmailService {
  mailUrl: string;
  mailFrom: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    const params = this.configService.get('mailer');

    this.mailUrl = params.mainUrl;
    this.mailFrom = params.mailFrom;
  }

  async send({ type, mailTo, data }) {
    const template = await TemplateService.getTemplate(type);

    const templateParams = {
      ...data,
      mainUrl: this.mailUrl,
    };

    await this.mailerService.sendMail({
      from: this.mailUrl,
      to: mailTo,
      subject: template.subject(templateParams),
      html: template.body(templateParams),
    });
  }
}
