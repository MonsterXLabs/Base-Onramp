import * as dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import { SesService, sendEmail } from './ses.service';

(async () => {
  try {
    // Get the service instance
    const sesService = new SesService();

    // await sendEmail('edwardmeth2@gmail.com');
    // Call the function
    const result = await sesService.sendUnreadMessage(
      '66ef55171036e8ce0da0f532',
      '66ef5cac1036e8ce0da0f622',
      5,
    );
    // const result = await sesService.sendSignup('66ef5cac1036e8ce0da0f622');
    // const result2 = await sesService.sendTransactionByEvent(
    //   'purchased',
    //   '67aae5d94056fd54ad65c679',
    // );
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Ensure the process exits after the function completes
    process.exit();
  }
})();
