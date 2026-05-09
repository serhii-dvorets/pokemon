import * as path from 'path';
import * as fs from 'fs/promises';
import Handlebars from 'handlebars';

interface ITemplate {
  body: HandlebarsTemplateDelegate;
  subject: HandlebarsTemplateDelegate;
}

export class TemplateService {
  private static templates = {};
  static async getTemplate(actionName: string) {
    if (this.templates[actionName]) {
      return this.templates[actionName];
    }

    const templatesDir = path.join(__dirname, '../../../templates');

    const [body, subject] = await Promise.all([
      fs.readFile(path.join(templatesDir, actionName, 'body.html')),
      fs.readFile(path.join(templatesDir, actionName, 'subject.html')),
    ]);

    this.templates[actionName] = {
      body: Handlebars.compile(body.toString()),
      subject: Handlebars.compile(subject.toString()),
    };

    return this.templates[actionName] as ITemplate;
  }
}
