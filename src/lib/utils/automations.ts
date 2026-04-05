import { Lead, CateringRequest, Commitment } from "@/types/crm";
import { sendEmail, sendSMS } from "./notifications";

/**
 * Triggered when a new lead is assigned to a rep.
 */
export async function triggerNewLeadAssignmentAlert(lead: Lead, repName: string, repPhone?: string) {
  const message = `Aloha ${repName}! A new lead from ${lead.companyName} (${lead.contactName}) has been assigned to you. Check the CRM for details.`;
  
  if (repPhone) {
    await sendSMS({ to: repPhone, body: message });
  }

  // Also send internal email if needed
  // await sendEmail({ ... });
}

/**
 * Triggered when an event is marked as 'Fulfilled'.
 * This starts the "Mahalo" (Thank You) sequence.
 */
export async function triggerPostEventMahalo(request: CateringRequest, contactEmail: string) {
  // T+24h: Thank You & Feedback Survey
  // In a real cloud environment, this would ideally be scheduled via a task queue.
  // For now, we provide the logic that would be called.
  
  const subject = "Mahalo from Buddas Hawaiian! 🌺";
  const message = `Hi ${request.contactName}, thank you for choosing Buddas for your ${request.eventType || 'event'}! We hope your group enjoyed the food. Could you spare 60 seconds to let us know how we did?`;
  
  await sendEmail({
    to: contactEmail,
    subject,
    message,
    link: "/feedback/" + request.id // Hypothetical feedback route
  });
}

/**
 * Logic to check for stale leads and send nudges.
 * Intended to be called by a cron-triggered cloud function.
 */
export async function processStaleLeadNudges(leads: Lead[]) {
  const now = Date.now();
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

  for (const lead of leads) {
    if (lead.status !== "Quote Sent" && lead.status !== "Contacted") continue;
    
    const lastActivity = lead.lastActivityAt?.toDate().getTime() || lead.updatedAt?.toDate().getTime() || 0;
    
    if (now - lastActivity > threeDaysInMs) {
      // Send nudge email
      const subject = "Still thinking about Buddas Catering? 🥙";
      const message = `Hi ${lead.contactName}, just checking in to see if you have any questions about the quote we sent for ${lead.companyName}. We'd love to help make your event a success!`;
      
      await sendEmail({
        to: lead.email,
        subject,
        message,
        link: "/quote/" + (lead.cateringRequestId || lead.id)
      });
      
      // Update lead to prevent immediate re-nudge
      // This would involve a DB write: lead.lastActivityAt = now
    }
  }
}

/**
 * Triggered when a lead's heat score crosses a high threshold.
 */
export async function triggerHighHeatAlert(lead: Lead, score: number, repPhone?: string) {
  if (score >= 80) {
    const body = `🔥 HOT LEAD ALERT: ${lead.companyName} (${lead.contactName}) just engaged! Heat Score: ${score}. Reach out now!`;
    if (repPhone) {
      await sendSMS({ to: repPhone, body });
    }
  }
}

/**
 * Generates a Google Calendar event link for "Won" catering requests.
 */
export function generateGoogleCalendarLink(request: CateringRequest) {
  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const title = encodeURIComponent(`CATERING: ${request.companyName || 'Event'} (${request.cateringNeed})`);
  
  // Format dates: YYYYMMDDTHHmmSSZ
  // Assuming preferredDate is YYYY-MM-DD. We'll default to 11am - 1pm Hawaiian time.
  const dateStr = request.preferredDate?.replace(/-/g, '') || new Date().toISOString().split('T')[0].replace(/-/g, '');
  const start = `${dateStr}T110000Z`;
  const end = `${dateStr}T130000Z`;
  
  const details = encodeURIComponent(`
    Company: ${request.companyName}
    Contact: ${request.contactName}
    Estimated Group: ${request.estimatedGroupSize}
    Notes: ${request.notes || 'N/A'}
    CRM Link: https://buddascatering.com/app/orders/${request.id}
  `.trim());

  return `${baseUrl}&text=${title}&dates=${start}/${end}&details=${details}`;
}
