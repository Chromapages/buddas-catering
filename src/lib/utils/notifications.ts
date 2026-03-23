/**
 * Production-ready email notification utility.
 * Replace the mock implementation with a real service like Resend or SendGrid.
 */

export async function sendEmail({
  to,
  subject,
  message,
  link
}: {
  to: string;
  subject: string;
  message: string;
  link?: string;
}) {
  console.log(`[EMAIL_DISPATCH] To: ${to} | Subject: ${subject}`);
  
  // LOGIC TO SHIP TO RESEND/SENDGRID/ETC
  /*
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Buddas Catering <notifications@buddascatering.com>',
      to: [to],
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #1C5F56; border-bottom: 2px solid #1C5F56; padding-bottom: 10px;">Buddas Catering System</h1>
          <p style="font-size: 16px; color: #333;">${message}</p>
          ${link ? `
            <div style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}${link}" style="background-color: #1C5F56; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Details</a>
            </div>
          ` : ''}
          <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            This is an automated notification from the Buddas CRM. If you didn't expect this, please ignore.
          </p>
        </div>
      `,
    }),
  });
  */

  return { success: true };
}
