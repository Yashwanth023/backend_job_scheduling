
import { useState, useEffect } from "react";
import { JobScheduler } from "@/components/JobScheduler";
import { JobList } from "@/components/JobList";
import { Job } from "@/types/job";

const Index = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<"scheduler" | "jobs">("scheduler");

  useEffect(() => {
    const savedJobs = localStorage.getItem("scheduledJobs");
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("scheduledJobs", JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (job: Omit<Job, "id" | "createdAt" | "lastRun" | "status">) => {
    const newJob: Job = {
      ...job,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastRun: null,
      status: "active"
    };
    setJobs(prev => [...prev, newJob]);
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, ...updates } : job
    ));
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  const executeJob = (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (job) {
      console.log(`Executing job: ${job.name} - Hello World`);
      updateJob(id, { 
        lastRun: new Date(),
        status: "completed"
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
            Job Scheduling System
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
            </div>
            
            <div className="p-6">
              {activeTab === "scheduler" ? (
                <JobScheduler onAddJob={addJob} />
              ) : (
                <JobList 
                  jobs={jobs} 
                  onExecuteJob={executeJob}
                  onDeleteJob={deleteJob}
                  onUpdateJob={updateJob}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
