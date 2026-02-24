import { web } from "./applications/web.js";
import { logger } from "./applications/logging.js";
import cron from "node-cron";
import { checkInactiveUsers } from "./jobs/checkInactiveUsers.js";
import "./jobs/mediaCleanupJob.js";

const PORT = process.env.LOCAL_PORT || 3001;

web.listen(PORT, "0.0.0.0", () => {
  logger.info(`App start on port ${PORT}`);
});

cron.schedule("0 * * * *", async () => {
  logger.info("Running cron job...");
  await checkInactiveUsers();
});
