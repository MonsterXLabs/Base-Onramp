import * as dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import { MailerSendService } from './mailersend.service';

(async () => {
  try {
    // Get the service instance
    const mailerSendService = new MailerSendService();

    // Call the function
    const result = await mailerSendService.sendTransactionByStateList([
      '6790fc4352387d19551f0faf',
    ]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Ensure the process exits after the function completes
    process.exit();
  }
})();
