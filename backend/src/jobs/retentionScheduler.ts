/**
 * Data Retention Job Scheduler
 *
 * Schedules daily data retention job at 2 AM
 * Automatically archives old records and deletes expired records
 */

import { scheduleRetentionJob } from '../services/dataRetention.js';

/**
 * Initialize data retention scheduler
 *
 * This function sets up the daily data retention job.
 * In production, you should use a proper cron solution like:
 * - node-cron
 * - bull/bullmq (Redis-based job queue)
 * - AWS CloudWatch Events
 * - Google Cloud Scheduler
 *
 * For now, this provides a simple setInterval-based scheduler.
 */
export function initializeRetentionScheduler() {
  const job = scheduleRetentionJob();

  console.log('[RETENTION SCHEDULER] Initializing data retention scheduler...');
  console.log(`[RETENTION SCHEDULER] Schedule: ${job.schedule} (daily at 2 AM)`);

  // Calculate time until next 2 AM
  const now = new Date();
  const next2AM = new Date();
  next2AM.setHours(2, 0, 0, 0);

  // If it's past 2 AM today, schedule for tomorrow
  if (now.getHours() >= 2) {
    next2AM.setDate(next2AM.getDate() + 1);
  }

  const msUntilNext2AM = next2AM.getTime() - now.getTime();

  console.log(`[RETENTION SCHEDULER] Next run scheduled for: ${next2AM.toLocaleString()}`);
  console.log(`[RETENTION SCHEDULER] Time until next run: ${Math.round(msUntilNext2AM / 1000 / 60)} minutes`);

  // Schedule first run
  setTimeout(async () => {
    console.log('[RETENTION SCHEDULER] Running initial retention job...');
    await runRetentionJob();

    // After first run, schedule daily at 2 AM
    setInterval(async () => {
      console.log('[RETENTION SCHEDULER] Running scheduled retention job...');
      await runRetentionJob();
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }, msUntilNext2AM);

  console.log('[RETENTION SCHEDULER] ✅ Scheduler initialized successfully');
}

/**
 * Run retention job with error handling and logging
 */
async function runRetentionJob() {
  const job = scheduleRetentionJob();

  try {
    const startTime = Date.now();
    const result = await job.run();
    const duration = Date.now() - startTime;

    console.log('[RETENTION SCHEDULER] ✅ Job completed successfully');
    console.log(`[RETENTION SCHEDULER] Duration: ${duration}ms`);
    console.log(`[RETENTION SCHEDULER] Archived records:`, result.archived);
    console.log(`[RETENTION SCHEDULER] Deleted records:`, result.deleted);

    if (result.errors.length > 0) {
      console.error('[RETENTION SCHEDULER] ⚠️  Job completed with errors:', result.errors);
    }
  } catch (error: any) {
    console.error('[RETENTION SCHEDULER] ❌ Job failed with error:', error.message);
    console.error(error);
  }
}

/**
 * Manually trigger retention job (for testing or admin actions)
 */
export async function triggerRetentionJobManually(): Promise<{
  archived: Record<string, number>;
  deleted: Record<string, number>;
  errors: string[];
}> {
  console.log('[RETENTION SCHEDULER] Manual job trigger requested');
  const job = scheduleRetentionJob();
  return await job.run();
}
