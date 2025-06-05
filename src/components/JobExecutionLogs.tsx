
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Clock, Play, TrendingUp, BarChart3 } from "lucide-react";
import { Job } from "@/types/job";
import { JobLoggerService, JobExecution } from "@/services/JobLogger";

interface JobExecutionLogsProps {
  jobs: Job[];
}

export const JobExecutionLogs = ({ jobs }: JobExecutionLogsProps) => {
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [logs, setLogs] = useState<JobExecution[]>(JobLoggerService.getLogs());

  const refreshLogs = () => {
    setLogs(JobLoggerService.getLogs());
  };

  const clearLogs = () => {
    JobLoggerService.clearLogs();
    setLogs([]);
  };

  const filteredLogs = selectedJobId === "all" 
    ? logs 
    : logs.filter(log => log.jobId === selectedJobId);

  const getJobStats = () => {
    const totalExecutions = logs.length;
    const uniqueJobs = new Set(logs.map(log => log.jobId)).size;
    const avgDuration = logs.length > 0 
      ? logs.reduce((sum, log) => sum + log.duration, 0) / logs.length 
      : 0;
    
    return { totalExecutions, uniqueJobs, avgDuration };
  };

  const stats = getJobStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Job Execution Logs</h2>
        <div className="flex gap-2">
          <Button onClick={refreshLogs} variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={clearLogs} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold">{stats.totalExecutions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold">{stats.uniqueJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">{stats.avgDuration.toFixed(0)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by Job:</label>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map(job => (
              <SelectItem key={job.id} value={job.id}>
                {job.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs Display */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No execution logs</h3>
            <p className="text-gray-500">Jobs haven't been executed yet or logs have been cleared.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} execution{filteredLogs.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{log.jobName}</h4>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Output:</strong> {log.output}
                      </p>
                      <p className="text-xs text-gray-500">
                        Executed at: {log.executedAt.toLocaleString()} | 
                        Duration: {log.duration.toFixed(0)}ms
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
