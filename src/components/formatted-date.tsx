"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

// The props now accept Firestore Timestamps (objects with a toDate method)
// and also null/undefined values to be safe.
type DateInput = Date | string | number | { toDate: () => Date } | null | undefined;

const FormattedDate: React.FC<{ date: DateInput; formatString: string }> = ({ date, formatString }) => {
  const [clientDate, setClientDate] = useState("");

  useEffect(() => {
    // 1. Guard against null or undefined dates.
    if (!date) {
      setClientDate(""); // Let the placeholder handle it
      return;
    }

    let dateObject: Date;

    // 2. Handle Firestore Timestamp objects, which have a .toDate() method.
    if (typeof date === 'object' && date !== null && 'toDate' in date && typeof (date as any).toDate === 'function') {
      dateObject = (date as any).toDate();
    } else {
      // 3. Handle standard Date, string, or number inputs.
      dateObject = new Date(date);
    }
    
    // 4. Check if the resulting dateObject is valid before formatting.
    if (!isNaN(dateObject.getTime())) {
      setClientDate(format(dateObject, formatString));
    } else {
      // If date is invalid, don't render anything, let the placeholder show.
      setClientDate("");
    }
  }, [date, formatString]);

  // Render a placeholder on the server and during initial client render if date is being processed.
  if (!clientDate) {
    return <span className="inline-block h-4 w-24 animate-pulse rounded-md bg-muted" />;
  }

  return <>{clientDate}</>;
};

export default FormattedDate;
