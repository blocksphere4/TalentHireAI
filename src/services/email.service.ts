import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static getTransporter() {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not configured. Email sending will be skipped.");
      return null;
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const transporter = this.getTransporter();

      if (!transporter) {
        console.warn("Email not sent: SMTP not configured");
        return false;
      }

      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "TalentHireAI"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log("Email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  static async sendShortlistEmail(payload: {
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    interviewUrl: string;
    companyName: string;
  }): Promise<boolean> {
    const { candidateName, candidateEmail, jobTitle, interviewUrl, companyName } =
      payload;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px 20px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
            </div>
            <div class="content">
              <p>Dear ${candidateName},</p>

              <p>We're excited to inform you that your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been shortlisted!</p>

              <p>We were impressed by your qualifications and would like to invite you to the next stage of our recruitment process.</p>

              <h3>Next Steps:</h3>
              <p>Please complete our AI-powered interview by clicking the button below. This interview will help us better understand your skills and experience.</p>

              <div style="text-align: center;">
                <a href="${interviewUrl}" class="button">Start Your Interview</a>
              </div>

              <p><strong>Interview Link:</strong><br/>
              <a href="${interviewUrl}">${interviewUrl}</a></p>

              <p>Please complete the interview within the next 7 days. If you have any questions or concerns, feel free to reach out to us.</p>

              <p>We look forward to learning more about you!</p>

              <p>Best regards,<br/>
              <strong>${companyName} Recruitment Team</strong></p>
            </div>
            <div class="footer">
              <p>Powered by TalentHireAI</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Dear ${candidateName},

Congratulations! Your application for the ${jobTitle} position at ${companyName} has been shortlisted!

Next Steps:
Please complete our AI-powered interview by visiting: ${interviewUrl}

Please complete the interview within the next 7 days.

Best regards,
${companyName} Recruitment Team

---
Powered by TalentHireAI
    `;

    return this.sendEmail({
      to: candidateEmail,
      subject: `🎉 You've been shortlisted for ${jobTitle} at ${companyName}`,
      html,
      text,
    });
  }

  static async sendRejectionEmail(payload: {
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    companyName: string;
  }): Promise<boolean> {
    const { candidateName, candidateEmail, jobTitle, companyName } = payload;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #f3f4f6;
              padding: 30px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #ffffff;
              padding: 30px 20px;
              border: 1px solid #e5e7eb;
              border-radius: 0 0 8px 8px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Update</h1>
            </div>
            <div class="content">
              <p>Dear ${candidateName},</p>

              <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> and for taking the time to apply.</p>

              <p>After careful consideration, we regret to inform you that we have decided not to move forward with your application at this time. This decision was not easy, as we received many qualified applications.</p>

              <p>We encourage you to apply for other opportunities with us in the future that may be a better match for your skills and experience.</p>

              <p>We wish you all the best in your job search and future career endeavors.</p>

              <p>Best regards,<br/>
              <strong>${companyName} Recruitment Team</strong></p>
            </div>
            <div class="footer">
              <p>Powered by TalentHireAI</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Dear ${candidateName},

Thank you for your interest in the ${jobTitle} position at ${companyName}.

After careful consideration, we regret to inform you that we have decided not to move forward with your application at this time.

We encourage you to apply for other opportunities with us in the future.

Best regards,
${companyName} Recruitment Team

---
Powered by TalentHireAI
    `;

    return this.sendEmail({
      to: candidateEmail,
      subject: `Update on your application for ${jobTitle} at ${companyName}`,
      html,
      text,
    });
  }
}
