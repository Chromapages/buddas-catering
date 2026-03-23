"use client";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CateringRequest } from "@/types/crm";
import { useMemo } from "react";
import "./calendar-styles.css"; // We'll create this for custom styling

const localizer = momentLocalizer(moment);

interface CateringCalendarProps {
  requests: any[]; // Using any because of potential variations, but mapping to Calendar event format
}

export const CateringCalendar = ({ requests }: CateringCalendarProps) => {
  const events = useMemo(() => {
    return requests.map(req => {
      // preferredDate is usually a Firestore timestamp or a string
      const date = req.preferredDate?.seconds 
        ? new Date(req.preferredDate.seconds * 1000)
        : new Date(req.preferredDate || Date.now());

      // Set a default time if only date is provided
      const start = new Date(date);
      start.setHours(11, 0, 0); // Default 11 AM
      
      const end = new Date(date);
      end.setHours(13, 0, 0); // Default 1 PM

      return {
        id: req.id,
        title: `${req.companyName || 'Catering'} - ${req.eventType || 'Request'}`,
        start,
        end,
        resource: req,
      };
    });
  }, [requests]);

  const eventPropGetter = (event: any) => {
    const status = event.resource.fulfillmentStatus;
    let className = 'calendar-event-pending';
    
    if (status === 'Completed' || status === 'Fulfilled') {
      className = 'calendar-event-completed';
    } else if (status === 'Cancelled') {
      className = 'calendar-event-cancelled';
    }

    return { className };
  };

  return (
    <div className="h-full min-h-[600px] bg-white rounded-2xl border border-gray-border p-4 shadow-sm">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventPropGetter}
        views={['month', 'week', 'day']}
        step={60}
        showMultiDayTimes
        popup
      />
    </div>
  );
};
