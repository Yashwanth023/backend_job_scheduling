
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Job } from "@/types/job";
import { useToast } from "@/hooks/use-toast";

interface JobSchedulerProps {
  onAddJob: (job: Omit<Job, "id" | "createdAt" | "lastRun" | "status">) => void;
}

export const JobScheduler = ({ onAddJob }: JobSchedulerProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleType, setScheduleType] = useState<"hourly" | "daily" | "weekly">("hourly");
  const [minute, setMinute] = useState(0);
  const [hour, setHour] = useState(0);
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [time, setTime] = useState("00:00");
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Job name is required",
        variant: "destructive"
      });
      return;
    }

    let scheduleConfig: Job["scheduleConfig"] = {};
    
    switch (scheduleType) {
      case "hourly":
        scheduleConfig = { minute };
        break;
      case "daily":
        scheduleConfig = { time };
        break;
      case "weekly":
        scheduleConfig = { dayOfWeek, time };
        break;
    }

    onAddJob({
      name: name.trim(),
      description: description.trim(),
      scheduleType,
      scheduleConfig
    });

    // Reset form
    setName("");
    setDescription("");
    setMinute(0);
    setHour(0);
    setDayOfWeek(0);
    setTime("00:00");

    toast({
      title: "Success",
      description: "Job scheduled successfully!",
    });
  };

  const getDayName = (day: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[day];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule New Job</CardTitle>
        <CardDescription>
          Create a new scheduled job that will execute "Hello World" based on your configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Job Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter job name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scheduleType">Schedule Type *</Label>
              <Select value={scheduleType} onValueChange={(value: "hourly" | "daily" | "weekly") => setScheduleType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter job description (optional)"
              rows={3}
            />
          </div>

          {/* Schedule Configuration */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-800">Schedule Configuration</h3>
            
            {scheduleType === "hourly" && (
              <div className="space-y-2">
                <Label htmlFor="minute">Minute of the hour (0-59)</Label>
                <Input
                  id="minute"
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(e) => setMinute(parseInt(e.target.value) || 0)}
                />
                <p className="text-sm text-gray-600">
                  Job will run at minute {minute} of every hour
                </p>
              </div>
            )}

            {scheduleType === "daily" && (
              <div className="space-y-2">
                <Label htmlFor="time">Time of day</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <p className="text-sm text-gray-600">
                  Job will run daily at {time}
                </p>
              </div>
            )}

            {scheduleType === "weekly" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Day of the week</Label>
                  <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map(day => (
                        <SelectItem key={day} value={day.toString()}>
                          {getDayName(day)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyTime">Time</Label>
                  <Input
                    id="weeklyTime"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Job will run every {getDayName(dayOfWeek)} at {time}
                </p>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Schedule Job
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
