
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Play, Pause, Trash2, Clock } from "lucide-react";
import { Job } from "@/types/job";
import { useToast } from "@/hooks/use-toast";

interface JobListProps {
  jobs: Job[];
  onExecuteJob: (id: string) => void;
  onDeleteJob: (id: string) => void;
  onUpdateJob: (id: string, updates: Partial<Job>) => void;
}

export const JobList = ({ jobs, onExecuteJob, onDeleteJob, onUpdateJob }: JobListProps) => {
  const { toast } = useToast();

  const getScheduleDescription = (job: Job) => {
    switch (job.scheduleType) {
      case "hourly":
        return `Every hour at minute ${job.scheduleConfig.minute}`;
      case "daily":
        return `Daily at ${job.scheduleConfig.time}`;
      case "weekly":
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return `Every ${days[job.scheduleConfig.dayOfWeek || 0]} at ${job.scheduleConfig.time}`;
      default:
        return "Unknown schedule";
    }
  };

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTogglePause = (job: Job) => {
    const newStatus = job.status === "active" ? "paused" : "active";
    onUpdateJob(job.id, { status: newStatus });
    
    toast({
      title: newStatus === "active" ? "Job Resumed" : "Job Paused",
      description: `${job.name} has been ${newStatus === "active" ? "resumed" : "paused"}`,
    });
  };

  const handleExecuteJob = (job: Job) => {
    if (job.status === "paused") {
      toast({
        title: "Cannot Execute",
        description: "Job is paused. Resume it first to execute.",
        variant: "destructive"
      });
      return;
    }
    
    onExecuteJob(job.id);
    toast({
      title: "Job Executed",
      description: `${job.name} executed successfully. Check console for output.`,
    });
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs scheduled</h3>
        <p className="text-gray-500">Create your first job using the scheduler tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Scheduled Jobs</h2>
        <Badge variant="outline" className="text-sm">
          {jobs.filter(j => j.status === "active").length} Active
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{job.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {job.description || "No description provided"}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Schedule:</span>
                  </div>
                  <p className="ml-6">{getScheduleDescription(job)}</p>
                </div>
                
                {job.lastRun && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Last run:</span>
                    <span className="ml-2">
                      {new Date(job.lastRun).toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">
                    {new Date(job.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExecuteJob(job)}
                    disabled={job.status === "paused"}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Execute Now
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePause(job)}
                  >
                    {job.status === "active" ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </>
                    )}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{job.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteJob(job.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
