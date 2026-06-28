import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class EmailService {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = apiKey;

    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendInvitationEmail(
    toEmail: string,
    toName: string,
    inviterName: string,
    projectName: string,
    inviteLink: string,
    daysToExpire: number = 7,
  ) {
    const senderEmail =
      this.configService.get<string>('BREVO_SENDER_EMAIL') ||
      'noreply@teamboard.com';
    const senderName =
      this.configService.get<string>('BREVO_SENDER_NAME') || 'TeamBoard';

    const subject = `You're invited to join "${projectName}" on TeamBoard`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }
            .header h1 { color: #4f46e5; font-size: 24px; margin: 0; }
            .content { padding: 30px 20px; }
            .content p { color: #374151; line-height: 1.6; font-size: 16px; }
            .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .button:hover { background-color: #4338ca; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
            .footer a { color: #4f46e5; text-decoration: none; }
            .badge { display: inline-block; background-color: #e0e7ff; color: #4f46e5; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 TeamBoard</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${toName}</strong>,</p>
              <p><strong>${inviterName}</strong> has invited you to join the project:</p>
              <p style="text-align: center; font-size: 20px; font-weight: 600; color: #1f2937;">
                <span class="badge">${projectName}</span>
              </p>
              <p>Click the button below to accept the invitation:</p>
              <p style="text-align: center;">
                <a href="${inviteLink}" class="button">Accept Invitation</a>
              </p>
              <p style="font-size: 14px; color: #6b7280;">
                This invitation will expire in ${daysToExpire} days.
              </p>
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                If you don't have an account, you'll be prompted to create one.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TeamBoard. All rights reserved.</p>
              <p>
                <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173'}">
                  ${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173'}
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: senderName,
      email: senderEmail,
    };
    sendSmtpEmail.to = [
      {
        email: toEmail,
        name: toName || toEmail,
      },
    ];

    try {
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(
        `📧 Email sent to ${toEmail} (messageId: ${result.messageId})`,
      );
      return result;
    } catch (error: any) {
      console.error('Brevo API error:', error.response?.body || error.message);
      throw new Error('Failed to send invitation email');
    }
  }
}
