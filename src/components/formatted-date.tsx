"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

const FormattedDate: React.FC<{ date: Date | string | number; formatString: string }> = ({ date, formatString }) => {
  const [clientDate, setClientDate] = useState("");

  useEffect(() => {
    setClientDate(format(new Date(date), formatString));
  }, [date, formatString]);

  // Render a placeholder on the server and initial client render
  if (!clientDate) {
    // You can return null or a loading skeleton
    return <span className="inline-block h-4 w-24 animate-pulse rounded-md bg-muted" />;
  }

  return <>{clientDate}</>;
};

export default FormattedDate;
