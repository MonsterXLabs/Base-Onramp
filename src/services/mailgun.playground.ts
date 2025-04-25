import * as dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import { MailGunService } from './mailgun.service';

(async () => {
  try {
    // Get the service instance
    const mailGunService = new MailGunService();

    // await sendEmail('jamesbrownmeth1980@gmail.com');
    // Call the function
    // const result = await mailGunService.sendUnreadMessage(
    //   '66ef55171036e8ce0da0f532',
    //   '66ef5cac1036e8ce0da0f622',
    //   5,
    // );
    // const result = await mailGunService.sendSignup('66ef5cac1036e8ce0da0f622');
    // const result2 = await mailGunService.sendTransactionByEvent(
    //   'purchased',
    //   '67aebbe403b05672fbfb91ff',
    // );
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Ensure the process exits after the function completes
    process.exit();
  }
})();
