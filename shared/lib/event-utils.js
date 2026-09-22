/**
 * Shared Event Timing & Status Computation Utilities
 * Evaluates real-time event lifecycle by checking date, start time, and end time.
 */

export function parseEventTiming(dateInput, timeInput) {
  if (!dateInput) return { start: null, end: null, isToday: false, isPastDate: false, isFutureDate: false };

  let year, month, day;

  if (typeof dateInput === "string") {
    // Check YYYY-MM-DD format
    const isoMatch = dateInput.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      month = parseInt(isoMatch[2], 10) - 1;
      day = parseInt(isoMatch[3], 10);
    } else {
      // Check M/D/YYYY or D/M/YYYY
      const slashMatch = dateInput.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
      if (slashMatch) {
        year = parseInt(slashMatch[3], 10);
        month = parseInt(slashMatch[1], 10) - 1;
        day = parseInt(slashMatch[2], 10);
      } else {
        const parsed = new Date(dateInput);
        if (!isNaN(parsed.getTime())) {
          year = parsed.getFullYear();
          month = parsed.getMonth();
          day = parsed.getDate();
        }
      }
    }
  } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    year = dateInput.getFullYear();
    month = dateInput.getMonth();
    day = dateInput.getDate();
  }

  if (year === undefined || month === undefined || day === undefined) {
    return { start: null, end: null, isToday: false, isPastDate: false, isFutureDate: false };
  }

  const now = new Date();
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDate = new Date(year, month, day).getTime();

  const isToday = nowDate === targetDate;
  const isPastDate = targetDate < nowDate;
  const isFutureDate = targetDate > nowDate;

  if (!timeInput || typeof timeInput !== "string") {
    return {
      start: new Date(year, month, day, 0, 0, 0, 0),
      end: new Date(year, month, day, 23, 59, 59, 999),
      isToday,
      isPastDate,
      isFutureDate,
    };
  }

  // Parse time segments (e.g., "10:00 AM - 01:00 PM", "09:00 AM to 01:00 PM", "14:00 - 17:00")
  const parts = timeInput.split(/[-–—]|(?:\bto\b)/i).map((s) => s.trim()).filter(Boolean);

  const parseClock = (str) => {
    if (!str) return null;
    const m = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const ampm = m[3] ? m[3].toUpperCase() : null;

    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;

    return { h, min };
  };

  const startClock = parseClock(parts[0]);
  const endClock = parts.length > 1 ? parseClock(parts[1]) : null;

  const start = startClock
    ? new Date(year, month, day, startClock.h, startClock.min, 0, 0)
    : new Date(year, month, day, 0, 0, 0, 0);

  let end;
  if (endClock) {
    end = new Date(year, month, day, endClock.h, endClock.min, 0, 0);
    if (end <= start) {
      // Overnight event (crosses midnight)
      end = new Date(year, month, day + 1, endClock.h, endClock.min, 0, 0);
    }
  } else if (startClock) {
    // Default 2-hour event duration if no end time given
    end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  } else {
    end = new Date(year, month, day, 23, 59, 59, 999);
  }

  return { start, end, isToday, isPastDate, isFutureDate };
}

/**
 * Returns the exact computed status for an event taking both Date and Time into account:
 * - "Live": currently in progress between start and end time
 * - "Upcoming": start time is in the future
 * - "Ended": end time has passed or explicitly closed/completed
 * - "Scheduled": future publishing scheduledAt
 * - "Pending Approval", "Draft", "Cancelled": lifecycle states
 */
export function getEventStatus(event, now = new Date()) {
  if (!event) return "Ended";

  const rawStatus = (event.status || "").trim();

  // Lifecycle overrides
  if (rawStatus === "Draft") return "Draft";
  if (rawStatus === "Pending Approval") return "Pending Approval";
  if (rawStatus === "Cancelled") return "Cancelled";

  // Scheduled check
  if (rawStatus === "Scheduled" && event.scheduledAt) {
    const pubDate = new Date(event.scheduledAt);
    if (!isNaN(pubDate.getTime()) && pubDate > now) {
      return "Scheduled";
    }
  }

  // Explicit completion
  if (["Completed", "Past", "Closed", "Ended"].includes(rawStatus)) {
    return "Ended";
  }

  const { start, end } = parseEventTiming(event.date, event.time);

  if (!start || !end) {
    return rawStatus || "Upcoming";
  }

  // Time comparison - STRICT: if time is over, it is Ended
  if (now > end) {
    return "Ended";
  }

  // Manual Live stage override from Live Control Room (only if time is not over)
  if (event.stageStatus === "LIVE" || rawStatus === "Ongoing" || rawStatus === "Live") {
    return "Live";
  }

  if (now >= start && now <= end) {
    return "Live";
  }

  if (now < start) {
    return "Upcoming";
  }

  return "Upcoming";
}

/**
 * Helper to get badge visual configuration
 */
export function getEventStatusConfig(status) {
  switch (status) {
    case "Live":
      return {
        label: "Live",
        tone: "success",
        className: "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs border border-emerald-500/40 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full transition-colors",
        dot: true,
      };
    case "Ended":
      return {
        label: "Ended",
        tone: "neutral",
        className: "bg-slate-100 text-slate-600 border border-slate-200 font-semibold",
        dot: false,
      };
    case "Upcoming":
      return {
        label: "Upcoming",
        tone: "info",
        className: "bg-sky-50 text-sky-700 border border-sky-200 font-semibold",
        dot: false,
      };
    case "Scheduled":
      return {
        label: "Scheduled",
        tone: "primary",
        className: "bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold",
        dot: false,
      };
    case "Pending Approval":
      return {
        label: "Pending Approval",
        tone: "warning",
        className: "bg-amber-50 text-amber-700 border border-amber-200 font-semibold",
        dot: false,
      };
    case "Draft":
      return {
        label: "Draft",
        tone: "neutral",
        className: "bg-gray-100 text-gray-700 border border-gray-200 font-semibold",
        dot: false,
      };
    case "Cancelled":
      return {
        label: "Cancelled",
        tone: "destructive",
        className: "bg-rose-50 text-rose-700 border border-rose-200 font-semibold",
        dot: false,
      };
    default:
      return {
        label: status || "Upcoming",
        tone: "neutral",
        className: "",
        dot: false,
      };
  }
}
