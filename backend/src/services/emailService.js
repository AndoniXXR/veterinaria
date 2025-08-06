const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const getPasswordResetTemplate = (resetUrl, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperación de Contraseña</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          color: #2563eb;
          margin-bottom: 10px;
        }
        h1 {
          color: #1f2937;
          margin-bottom: 20px;
        }
        .btn {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: bold;
        }
        .btn:hover {
          background-color: #1d4ed8;
        }
        .warning {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🐶 VetCare</div>
          <h1>Recuperación de Contraseña</h1>
        </div>
        
        <p>Hola${userName ? ` ${userName}` : ''},</p>
        
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en VetCare.</p>
        
        <p>Para continuar con el proceso, haz clic en el siguiente botón:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn">Restablecer mi Contraseña</a>
        </div>
        
        <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
        
        <div class="warning">
          <strong>⚠️ Importante:</strong>
          <ul>
            <li>Este enlace expira en <strong>1 hora</strong></li>
            <li>Solo puede ser usado una vez</li>
            <li>Si no solicitaste este cambio, ignora este email</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Si tienes problemas o no solicitaste este cambio, contacta a nuestro equipo de soporte.</p>
          <p><strong>VetCare - Sistema de Gestión Veterinaria</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userName = null) => {
  try {
    const transporter = createTransporter();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    // Email options
    const mailOptions = {
      from: {
        name: 'VetCare - Sistema Veterinario',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🔐 Recuperación de Contraseña - VetCare',
      html: getPasswordResetTemplate(resetUrl, userName),
      text: `
        Recuperación de Contraseña - VetCare
        
        Hola${userName ? ` ${userName}` : ''},
        
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
        
        Para continuar, visita este enlace: ${resetUrl}
        
        Este enlace expira en 1 hora y solo puede ser usado una vez.
        
        Si no solicitaste este cambio, ignora este email.
        
        VetCare - Sistema de Gestión Veterinaria
      `
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Password reset email sent successfully');
    console.log('📧 Email sent to:', email);
    console.log('🔗 Reset URL:', resetUrl);
    console.log('📨 Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      resetUrl // For development/testing purposes
    };
    
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service connection successful');
    return true;
  } catch (error) {
    console.error('❌ Email service connection failed:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConnection
};