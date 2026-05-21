import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailSendOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Envio de e-mails da aplicação.
 *
 * Modo de operação controlado por env vars:
 * - Se SMTP_HOST estiver definido: usa nodemailer com SMTP (modo produção).
 * - Caso contrário: loga o conteúdo no console (modo desenvolvimento).
 *
 * Env vars suportadas:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;

  constructor() {
    this.fromAddress = process.env.SMTP_FROM || 'no-reply@foodclub.local';

    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASSWORD
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
              }
            : undefined,
      });
    } else {
      this.transporter = null;
      this.logger.warn(
        'SMTP_HOST não configurado. EmailService operando em modo console (não enviará e-mails reais).',
      );
    }
  }

  async send(options: EmailSendOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `[EMAIL CONSOLE] Para: ${options.to} | Assunto: ${options.subject}\n${options.text}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }
}
