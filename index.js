import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { web } from "./src/applications/web.js";
import { logger } from "./src/applications/logging.js";
import { checkInactiveUsers } from "./src/jobs/checkInactiveUsers.js";
import cleanupOrphanedImages from "./src/jobs/mediaCleanupJob.js";

logger.info("SnapJournal Cloud Function ready.");

const REGION = "asia-southeast2";

const HTTP_OPTIONS = {
  region: REGION,
  memory: "2GiB",
  maxInstances: 10,
};

const SCHEDULE_OPTIONS = {
  region: REGION,
  schedule: "0 * * * *",
  timezone: "Asia/Jakarta",
  memory: "256MiB",
};

const CLEANUP_SCHEDULE_OPTIONS = {
  region: REGION,
  schedule: "0 0 * * *",
  timezone: "Asia/Jakarta",
  memory: "512MiB",
};

export const api = onRequest(HTTP_OPTIONS, web);

export const inactiveUserJob = onSchedule(
  SCHEDULE_OPTIONS,
  async () => {
    logger.info("Running checkInactiveUsers job...");
    try {
      await checkInactiveUsers();
      logger.info("Job finished.");
    } catch (err) {
      logger.error("Job failed:", err);
      throw err;
    }
  }
);

export const mediaCleanupJob = onSchedule(
  CLEANUP_SCHEDULE_OPTIONS,
  async () => {
    logger.info("Running mediaCleanupJob...");
    try {
      await cleanupOrphanedImages();
      logger.info("Media cleanup finished.");
    } catch (err) {
      logger.error("Media cleanup failed:", err);
      throw err;
    }
  }
);