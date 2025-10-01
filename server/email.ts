import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "cybexchange@gmail.com",
    pass: process.env.SMTP_PASS || "",
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: '"Currency Business (CyB)" <cybexchange@gmail.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendDepositReference(
  email: string,
  userName: string,
  amount: string,
  currency: string,
  reference: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FFC107 0%, #FF9800 100%); padding: 20px; text-align: center;">
        <h1 style="color: #1a1d2e; margin: 0;">Currency Business (CyB)</h1>
      </div>
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #1a1d2e;">Olá ${userName},</h2>
        <p style="color: #333; font-size: 16px;">
          Recebemos seu pedido de depósito de <strong>${amount} ${currency}</strong>.
        </p>
        <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #FFC107; margin-top: 0;">Referência de Depósito:</h3>
          <p style="font-size: 24px; font-weight: bold; color: #1a1d2e; margin: 10px 0;">
            ${reference}
          </p>
          <h3 style="color: #FFC107; margin-top: 20px;">Coordenadas Bancárias:</h3>
          <p style="color: #333; line-height: 1.6;">
            <strong>Banco:</strong> BAI - Banco Angolano de Investimentos<br>
            <strong>Conta:</strong> 0040 0000 0000 0000 0000 0<br>
            <strong>Titular:</strong> Currency Business LDA<br>
            <strong>IBAN:</strong> AO06 0040 0000 0000 0000 0000 0
          </p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Por favor, utilize a referência acima ao fazer a transferência. Após a confirmação do pagamento, 
          seu saldo será atualizado automaticamente.
        </p>
        <p style="color: #666; font-size: 14px;">
          Para qualquer dúvida, entre em contato conosco:
        </p>
        <p style="color: #666; font-size: 14px;">
          📧 Email: cybexchange@gmail.com<br>
          📱 WhatsApp: +244 926 224 075<br>
          📷 Instagram: @andre_yambi
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Referência de Depósito - ${reference}`,
    html,
  });
}

export async function sendKycStatusEmail(
  email: string,
  userName: string,
  status: "approved" | "rejected",
  reason?: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FFC107 0%, #FF9800 100%); padding: 20px; text-align: center;">
        <h1 style="color: #1a1d2e; margin: 0;">Currency Business (CyB)</h1>
      </div>
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #1a1d2e;">Olá ${userName},</h2>
        ${
          status === "approved"
            ? `
          <div style="background-color: #4CAF50; color: white; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin: 0;">✓ Verificação Aprovada!</h3>
          </div>
          <p style="color: #333; font-size: 16px;">
            Sua verificação de identidade foi aprovada com sucesso! Agora você tem acesso completo a todos os nossos serviços.
          </p>
        `
            : `
          <div style="background-color: #f44336; color: white; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin: 0;">✗ Verificação Recusada</h3>
          </div>
          <p style="color: #333; font-size: 16px;">
            Infelizmente, sua verificação de identidade foi recusada.
          </p>
          ${
            reason
              ? `
            <div style="background-color: white; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <strong>Motivo:</strong> ${reason}
            </div>
          `
              : ""
          }
          <p style="color: #333; font-size: 16px;">
            Por favor, entre em contato conosco para mais informações ou envie novos documentos.
          </p>
        `
        }
        <p style="color: #666; font-size: 14px;">
          Para qualquer dúvida, entre em contato:
        </p>
        <p style="color: #666; font-size: 14px;">
          📧 Email: cybexchange@gmail.com<br>
          📱 WhatsApp: +244 926 224 075
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Verificação de Identidade - ${status === "approved" ? "Aprovada" : "Recusada"}`,
    html,
  });
}

export async function sendLoanStatusEmail(
  email: string,
  userName: string,
  status: "approved" | "rejected",
  amount: string,
  reason?: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FFC107 0%, #FF9800 100%); padding: 20px; text-align: center;">
        <h1 style="color: #1a1d2e; margin: 0;">Currency Business (CyB)</h1>
      </div>
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #1a1d2e;">Olá ${userName},</h2>
        ${
          status === "approved"
            ? `
          <div style="background-color: #4CAF50; color: white; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin: 0;">✓ Empréstimo Aprovado!</h3>
          </div>
          <p style="color: #333; font-size: 16px;">
            Seu pedido de empréstimo de <strong>${amount} KZ</strong> foi aprovado!
          </p>
          <p style="color: #333; font-size: 16px;">
            O valor será creditado em sua conta em breve. Entre em contato conosco para finalizar os detalhes.
          </p>
        `
            : `
          <div style="background-color: #f44336; color: white; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin: 0;">✗ Empréstimo Recusado</h3>
          </div>
          <p style="color: #333; font-size: 16px;">
            Infelizmente, seu pedido de empréstimo de <strong>${amount} KZ</strong> foi recusado.
          </p>
          ${
            reason
              ? `
            <div style="background-color: white; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <strong>Motivo:</strong> ${reason}
            </div>
          `
              : ""
          }
        `
        }
        <p style="color: #666; font-size: 14px;">
          Para qualquer dúvida, entre em contato:
        </p>
        <p style="color: #666; font-size: 14px;">
          📧 Email: cybexchange@gmail.com<br>
          📱 WhatsApp: +244 926 224 075
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Empréstimo - ${status === "approved" ? "Aprovado" : "Recusado"}`,
    html,
  });
}
