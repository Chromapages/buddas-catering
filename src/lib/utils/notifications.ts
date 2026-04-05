import { client } from "@/sanity/lib/client";

// Simple in-memory cache for templates to reduce Sanity API calls
const templateCache: Record<string, { subject?: string; content: string; smsBody?: string }> = {};

/**
 * Fetches a template from Sanity by ID.
 */
async function getSanityTemplate(id: string) {
  if (templateCache[id]) return templateCache[id];

  try {
    const query = `*[_type == "communicationTemplate" && id == $id][0] { subject, content, smsBody }`;
    const template = await client.fetch(query, { id });
    
    if (template) {
      templateCache[id] = template;
      return template;
    }
  } catch (error) {
    console.error(`[SANITY_TEMPLATE_ERROR] ID: ${id}`, error);
  }
  return null;
}

/**
 * Production email notification utility using Resend.
 */

export async function sendEmail({
  to,
  subject,
  message,
  link,
  html
}: {
  to: string;
  subject: string;
  message: string;
  link?: string;
  html?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn(`[EMAIL_MOCK] To: ${to} | Subject: ${subject}`);
    console.warn("Missing RESEND_API_KEY. Email was not sent.");
    return { success: false, error: "Missing API Key" };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Buddas Catering <orders@buddascatering.com>',
        to: [to],
        subject,
        html: html || `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #1C5F56; border-bottom: 2px solid #1C5F56; padding-bottom: 10px;">Buddas Catering</h1>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">${message}</p>
            ${link ? `
              <div style="margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://buddascatering.com'}${link}" 
                   style="background-color: #1C5F56; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  View Details
                </a>
              </div>
            ` : ''}
            <p style="font-size: 12px; color: #999; margin-top: 40px; border-top: 1px solid #eee; padding-top: 15px;">
              This is an automated notification from Buddas Catering.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("[EMAIL_ERROR]", errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error("[EMAIL_SYSTEM_ERROR]", error);
    return { success: false, error };
  }
}

/**
 * Sends an SMS notification using Twilio.
 * Optionally uses a Sanity template if templateId is provided.
 */
export async function sendSMS({
  to,
  body,
  templateId,
  params = {}
}: {
  to: string;
  body?: string;
  templateId?: string;
  params?: Record<string, string>;
}) {
  let finalBody = body || "";

  if (templateId) {
    const template = await getSanityTemplate(templateId);
    if (template) {
      finalBody = template.smsBody || template.content;
      // Simple param replacement
      Object.entries(params).forEach(([key, val]) => {
        finalBody = finalBody.replace(new RegExp(`{{${key}}}`, 'g'), val);
      });
    }
  }

  if (!finalBody) {
    console.error("[SMS_ERROR] No body content provided.");
    return { success: false, error: "No body" };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn(`[SMS_MOCK] To: ${to} | Body: ${body}`);
    console.warn("Missing Twilio configuration. SMS was not sent.");
    return { success: false, error: "Missing Twilio config" };
  }

  try {
    // Note: In a real Next.js environment, we'd use the twilio npm package,
    // but we can also use the REST API via fetch for simplicity and to avoid adding deps if not needed.
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: finalBody,
      } as Record<string, string>).toString(),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("[SMS_ERROR]", errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error("[SMS_SYSTEM_ERROR]", error);
    return { success: false, error };
  }
}

/**
 * Sends a high-trust confirmation email to a new lead.
 */
export async function sendLeadConfirmation(leadName: string, leadEmail: string) {
  const templateId = "lead-confirmation";
  const template = await getSanityTemplate(templateId);
  
  if (template) {
    return sendEmail({
      to: leadEmail,
      subject: template.subject?.replace("{{name}}", leadName) || "We've received your catering request! 🥙",
      message: template.content.replace("{{name}}", leadName),
    });
  }

  const subject = "We've received your catering request! 🥙";
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333;">
      <div style="background-color: #1C5F56; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Buddas Catering</h1>
      </div>
      
      <div style="padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1C5F56; margin-top: 0;">Hi ${leadName},</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
          Thanks for reaching out! We've received your catering request and our team is already reviewing the details.
        </p>
        
        <div style="background-color: #fdf2f2; border-left: 4px solid #f97316; padding: 20px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #f97316;">What happens next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.5;">
            <li>One of our sales reps will review your event details.</li>
            <li>We'll build a custom quote tailored to your group size and dietary needs.</li>
            <li><strong>You'll hear from us within 2 business hours.</strong></li>
          </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
          In the meantime, if you have any immediate questions, feel free to reply to this email or visit our website.
        </p>
        
        <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-weight: bold; color: #1C5F56;">The Buddas Team</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Utah's Most Reliable Office Catering</p>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} Buddas Catering. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: leadEmail,
    subject,
    message: `Hi ${leadName}, we've received your catering request!`,
    html
  });
}

/**
 * Sends a high-trust, program-specific confirmation email.
 */
export async function sendProgramConfirmation(contactName: string, email: string, tier: string) {
  const templateId = "corporate-signup";
  const template = await getSanityTemplate(templateId);

  // Format tier name for display
  const tierDisplay = tier === '2_events' ? '2-Event / 10% Off' 
                    : tier === "4_events" ? "4-Event / 15% Off" 
                    : "6-Event / 20% Off";

  if (template) {
    return sendEmail({
      to: email,
      subject: template.subject?.replace("{{name}}", contactName).replace("{{tier}}", tierDisplay) || "Catering Application Review 🎉",
      message: template.content.replace("{{name}}", contactName).replace("{{tier}}", tierDisplay),
    });
  }

  const subject = "Your Corporate Catering Application is Under Review! 🎉";

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333;">
      <div style="background-color: #f97316; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Buddas Corporate Catering</h1>
      </div>
      
      <div style="padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #f97316; margin-top: 0;">Hi ${contactName},</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
          Thank you for applying for the Buddas Corporate Program! We've received your request for the <strong>${tierDisplay}</strong> tier.
        </p>
        
        <div style="background-color: #fdf2f2; border-left: 4px solid #1C5F56; padding: 20px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1C5F56;">What happens next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.5;">
            <li>Your dedicated catering account manager is reviewing your application right now.</li>
            <li>We will reach out to schedule a quick 5-minute kickoff call.</li>
            <li>Once approved, you'll receive a custom booking portal locking in your discounts for the year.</li>
          </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
          We build long-term relationships with offices across Utah County to make feeding your team the easiest part of your job.
        </p>
        
        <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-weight: bold; color: #1C5F56;">The Buddas Corporate Team</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Utah's Most Reliable Office Catering</p>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} Buddas Catering. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    message: `Hi ${contactName}, we've received your Corporate Program application!`,
    html
  });
}
