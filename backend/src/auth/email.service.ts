import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private async createTransporter(): Promise<nodemailer.Transporter> {
    const user = process.env.SMTP_USER ?? '';
    const pass = process.env.SMTP_PASS ?? '';

    // Si no hay credenciales configuradas, usar Ethereal (cuenta de prueba)
    if (!user || !pass) {
      this.logger.warn(
        'SMTP_USER/SMTP_PASS no configurados — usando cuenta Ethereal de prueba.',
      );
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    const host = process.env.SMTP_HOST ?? 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async enviarCodigoRecuperacion(
    destinatario: string,
    codigo: string,
  ): Promise<void> {
    const transporter = await this.createTransporter();
    const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'no-reply@cyaco.mx';

    const info = await transporter.sendMail({
      from: `"Cyaco ERP" <${from}>`,
      to: destinatario,
      subject: 'Código de recuperación de contraseña — Cyaco ERP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1a1a2e; margin-bottom: 8px;">Recuperación de contraseña</h2>
          <p style="color: #4b5563;">Usa el siguiente código para restablecer tu contraseña en <strong>Cyaco ERP</strong>.</p>
          <div style="background:#f3f4f6; border-radius:6px; padding:20px 32px; text-align:center; margin:24px 0;">
            <span style="font-size:36px; font-weight:700; letter-spacing:8px; color:#c0392b;">${codigo}</span>
          </div>
          <p style="color:#6b7280; font-size:13px;">Este código expira en <strong>15 minutos</strong>. Si no solicitaste esta recuperación, ignora este correo.</p>
          <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
          <p style="color:#9ca3af; font-size:11px;">Cyaco Tecnología Industrial · No respondas a este correo.</p>
        </div>
      `,
      text: `Tu código de recuperación de contraseña es: ${codigo}\n\nExpira en 15 minutos. Si no solicitaste esto, ignora el correo.`,
    });

    this.logger.log(`Correo de recuperación enviado a ${destinatario} (messageId: ${info.messageId})`);

    // En modo Ethereal, imprimir el enlace de vista previa en consola
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      this.logger.log(`\n\n📧  VISTA PREVIA DEL CORREO (Ethereal):\n   ${previewUrl}\n`);
    }
  }
}
