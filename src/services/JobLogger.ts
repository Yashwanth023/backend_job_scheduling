export interface JobExecution {
  id: string;
  jobId: string;
  jobName: string;
  executedAt: Date;
  status: 'success' | 'failed';
  output: string;
  duration: number;
}

export class JobLoggerService {
  private static readonly STORAGE_KEY = 'jobExecutionLogs';
  private static readonly MAX_LOGS = 100;

  static logExecution(jobId: string, jobName: string): JobExecution {
    const execution: JobExecution = {
      id: crypto.randomUUID(),
      jobId,
      jobName,
      executedAt: new Date(),
      status: 'success',
      output: `Hello World from ${jobName}!`,
      duration: Math.random() * 1000 + 500 // Simulated duration
    };

    const logs = this.getLogs();
    logs.unshift(execution);
    
    // Keep only the latest MAX_LOGS entries
    if (logs.length > this.MAX_LOGS) {
      logs.splice(this.MAX_LOGS);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    return execution;
  }

  static getLogs(): JobExecution[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored).map((log: any) => ({
        ...log,
        executedAt: new Date(log.executedAt)
      }));
    } catch {
      return [];
    }
  }

  static getJobLogs(jobId: string): JobExecution[] {
    return this.getLogs().filter(log => log.jobId === jobId);
  }

  static clearLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getExecutionStats(jobId: string) {
    const logs = this.getJobLogs(jobId);
    return {
      totalExecutions: logs.length,
      successCount: logs.filter(l => l.status === 'success').length,
      failedCount: logs.filter(l => l.status === 'failed').length,
      lastExecution: logs[0]?.executedAt || null,
      averageDuration: logs.length > 0 
        ? logs.reduce((sum, log) => sum + log.duration, 0) / logs.length 
        : 0
    };
  }
}
