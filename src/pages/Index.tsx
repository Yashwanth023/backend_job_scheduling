
import { useState, useEffect, useRef } from "react";
import { JobScheduler } from "@/components/JobScheduler";
import { JobList } from "@/components/JobList";
import { JobExecutionLogs } from "@/components/JobExecutionLogs";
import { Job } from "@/types/job";
import { JobSchedulerService } from "@/services/JobScheduler";
import { JobLoggerService } from "@/services/JobLogger";

const Index = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<"scheduler" | "jobs" | "logs">("scheduler");
  const schedulerRef = useRef<JobSchedulerService | null>(null);

  // Initialize scheduler
  useEffect(() => {
    const handleJobExecute = (jobId: string, jobName: string) => {
      // Log the execution
      JobLoggerService.logExecution(jobId, jobName);
      
      // Update job status
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { 
          ...job, 
          lastRun: new Date(),
          status: "completed" as const,
          executionCount: (job.executionCount || 0) + 1
        } : job
      ));
      
      // Reset status to active after 3 seconds
      setTimeout(() => {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: "active" as const } : job
        ));
      }, 3000);
    };

    const handleJobUpdate = (jobId: string, updates: Partial<Job>) => {
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, ...updates } : job
      ));
    };

    schedulerRef.current = new JobSchedulerService(handleJobExecute, handleJobUpdate);
    
    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.getAllScheduledJobs().forEach(jobId => {
          schedulerRef.current?.cancelJob(jobId);
        });
      }
    };
  }, []);

  // Load jobs from localStorage
  useEffect(() => {
    const savedJobs = localStorage.getItem("scheduledJobs");
    if (savedJobs) {
      const parsedJobs = JSON.parse(savedJobs).map((job: any) => ({
        ...job,
        createdAt: new Date(job.createdAt),
        lastRun: job.lastRun ? new Date(job.lastRun) : null,
        nextRun: job.nextRun ? new Date(job.nextRun) : null,
      }));
      setJobs(parsedJobs);
    }
  }, []);

  // Save jobs to localStorage and reschedule
  useEffect(() => {
    localStorage.setItem("scheduledJobs", JSON.stringify(jobs));
    if (schedulerRef.current) {
      schedulerRef.current.rescheduleAllJobs(jobs);
    }
  }, [jobs]);

  const addJob = (job: Omit<Job, "id" | "createdAt" | "lastRun" | "status">) => {
    const newJob: Job = {
      ...job,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastRun: null,
      status: "active",
      executionCount: 0
    };
    setJobs(prev => [...prev, newJob]);
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, ...updates } : job
    ));
  };

  const deleteJob = (id: string) => {
    if (schedulerRef.current) {
      schedulerRef.current.cancelJob(id);
    }
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  const executeJob = (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (job && schedulerRef.current) {
      // Log manual execution
      JobLoggerService.logExecution(id, job.name);
      console.log(`🔧 MANUAL EXECUTION: ${job.name} - Hello World`);
      
      updateJob(id, { 
        lastRun: new Date(),
        status: "completed",
        executionCount: (job.executionCount || 0) + 1
      });
      
      // Reset status to active after 2 seconds
      setTimeout(() => {
        updateJob(id, { status: "active" });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Backend Job Scheduling System
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("scheduler")}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === "scheduler"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Create Job
              </button>
              <button
                onClick={() => setActiveTab("jobs")}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === "jobs"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Manage Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === "logs"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Execution Logs
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === "scheduler" && (
                <JobScheduler onAddJob={addJob} />
              )}
              {activeTab === "jobs" && (
                <JobList 
                  jobs={jobs} 
                  onExecuteJob={executeJob}
                  onDeleteJob={deleteJob}
                  onUpdateJob={updateJob}
                />
              )}
              {activeTab === "logs" && (
                <JobExecutionLogs jobs={jobs} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
