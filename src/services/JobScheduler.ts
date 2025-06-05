
export interface ScheduledJob {
  id: string;
  timeoutId?: NodeJS.Timeout;
  intervalId?: NodeJS.Timeout;
  nextRun?: Date;
}

export class JobSchedulerService {
  private scheduledJobs: Map<string, ScheduledJob> = new Map();
  private onJobExecute?: (jobId: string, jobName: string) => void;
  private onJobUpdate?: (jobId: string, updates: any) => void;

  constructor(
    onJobExecute?: (jobId: string, jobName: string) => void,
    onJobUpdate?: (jobId: string, updates: any) => void
  ) {
    this.onJobExecute = onJobExecute;
    this.onJobUpdate = onJobUpdate;
  }

  scheduleJob(job: any) {
    this.cancelJob(job.id);
    
    if (job.status !== 'active') return;

    const nextRun = this.calculateNextRun(job);
    if (!nextRun) return;

    const delay = nextRun.getTime() - Date.now();
    
    if (delay <= 0) {
      // Execute immediately and schedule next
      this.executeJob(job.id, job.name);
      setTimeout(() => this.scheduleJob(job), 1000);
      return;
    }

    const timeoutId = setTimeout(() => {
      this.executeJob(job.id, job.name);
      
      // Schedule next execution for recurring jobs
      if (job.scheduleType !== 'once') {
        setTimeout(() => this.scheduleJob(job), 1000);
      }
    }, delay);

    this.scheduledJobs.set(job.id, {
      id: job.id,
      timeoutId,
      nextRun
    });

    // Update job with next run time
    if (this.onJobUpdate) {
      this.onJobUpdate(job.id, { nextRun });
    }
  }

  private calculateNextRun(job: any): Date | null {
    const now = new Date();
    let nextRun = new Date();

    switch (job.scheduleType) {
      case 'hourly':
        nextRun.setMinutes(job.scheduleConfig.minute || 0);
        nextRun.setSeconds(0);
        nextRun.setMilliseconds(0);
        
        if (nextRun <= now) {
          nextRun.setHours(nextRun.getHours() + 1);
        }
        break;

      case 'daily':
        const [hours, minutes] = (job.scheduleConfig.time || '00:00').split(':');
        nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        const [weeklyHours, weeklyMinutes] = (job.scheduleConfig.time || '00:00').split(':');
        const targetDay = job.scheduleConfig.dayOfWeek || 0;
        
        nextRun.setHours(parseInt(weeklyHours), parseInt(weeklyMinutes), 0, 0);
        
        const currentDay = nextRun.getDay();
        let daysUntilTarget = targetDay - currentDay;
        
        if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= now)) {
          daysUntilTarget += 7;
        }
        
        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        break;

      default:
        return null;
    }

    return nextRun;
  }

  private executeJob(jobId: string, jobName: string) {
    console.log(`🚀 EXECUTING JOB: ${jobName} at ${new Date().toLocaleString()}`);
    console.log(`📋 Job ID: ${jobId}`);
    console.log(`💬 Output: Hello World from ${jobName}!`);
    
    if (this.onJobExecute) {
      this.onJobExecute(jobId, jobName);
    }
  }

  cancelJob(jobId: string) {
    const scheduledJob = this.scheduledJobs.get(jobId);
    if (scheduledJob) {
      if (scheduledJob.timeoutId) {
        clearTimeout(scheduledJob.timeoutId);
      }
      if (scheduledJob.intervalId) {
        clearInterval(scheduledJob.intervalId);
      }
      this.scheduledJobs.delete(jobId);
    }
  }

  getNextRun(jobId: string): Date | null {
    const scheduledJob = this.scheduledJobs.get(jobId);
    return scheduledJob?.nextRun || null;
  }

  getAllScheduledJobs(): string[] {
    return Array.from(this.scheduledJobs.keys());
  }

  rescheduleAllJobs(jobs: any[]) {
    // Cancel all existing schedules
    this.scheduledJobs.forEach((_, jobId) => this.cancelJob(jobId));
    
    // Reschedule active jobs
    jobs.filter(job => job.status === 'active').forEach(job => {
      this.scheduleJob(job);
    });
  }
}
