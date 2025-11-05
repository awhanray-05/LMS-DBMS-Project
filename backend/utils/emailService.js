const nodemailer = require('nodemailer');

// Create transporter for sending emails via SMTP
const createTransporter = () => {
  // Check if SMTP configuration is provided
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    // For Gmail and some providers, may need TLS
    tls: {
      rejectUnauthorized: false // Set to true in production with valid certificates
    }
  });
};

// Send email to new member with credentials
const sendMemberCreationEmail = async (memberEmail, memberName, temporaryPassword) => {
  try {
    // Skip email sending if SMTP configuration is not provided
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('SMTP configuration not found. Skipping email send.');
      console.log(`Member creation email would be sent to: ${memberEmail}`);
      console.log(`Temporary password: ${temporaryPassword}`);
      return { success: true, skipped: true };
    }

    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('Failed to create email transporter. Skipping email send.');
      console.log(`Member creation email would be sent to: ${memberEmail}`);
      console.log(`Temporary password: ${temporaryPassword}`);
      return { success: true, skipped: true };
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const fromName = process.env.SMTP_FROM_NAME || 'Library Management System';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: memberEmail,
      subject: 'Welcome to Library Management System - Your Account Has Been Created',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Created</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Library Management System</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #667eea; margin-top: 0;">Welcome, ${memberName}!</h2>
            
            <p>Your library account has been successfully created by the administrator.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #333;">Your Login Credentials:</h3>
              <p style="margin: 10px 0;"><strong>Username (Email):</strong> ${memberEmail}</p>
              <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${temporaryPassword}</code></p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0;"><strong>⚠️ Important:</strong> For security reasons, you will be required to change your password the first time you log in.</p>
            </div>
            
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/member-login" 
                 style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Login Now
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you did not expect this email, please contact the library administrator immediately.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Library Management System!

Dear ${memberName},

Your library account has been successfully created by the administrator.

Your Login Credentials:
Username (Email): ${memberEmail}
Temporary Password: ${temporaryPassword}

IMPORTANT: For security reasons, you will be required to change your password the first time you log in.

You can log in at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/member-login

If you did not expect this email, please contact the library administrator immediately.

This is an automated email. Please do not reply to this message.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Member creation email sent:', info.messageId);
    console.log('Email sent to:', memberEmail);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending member creation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendMemberCreationEmail,
  createTransporter
};
