
export interface Job {
  id: string;
  name: string;
  description: string;
  scheduleType: "hourly" | "daily" | "weekly";
  scheduleConfig: {
    minute?: number; // For hourly jobs (0-59)
    hour?: number; // For daily jobs (0-23)
    dayOfWeek?: number; // For weekly jobs (0-6, Sunday = 0)
    time?: string; // For daily/weekly jobs (HH:MM format)
  };
  createdAt: Date;
  lastRun: Date | null;
  status: "active" | "paused" | "completed";
}
