import * as dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import Container from 'typedi';
import { SendbirdService } from './sendbird.service';
import { getEscrowEvents } from '@/lib/helper';

(async () => {
  try {
    // Get the service instance
    const sendbirdService = Container.get(SendbirdService);

    // Call the function
    // const result = await sendbirdService.sendUnreadMessage(
    //   '66ef5cac1036e8ce0da0f622',
    //   '66ef55171036e8ce0da0f532',
    //   5,
    // );

    // const result = await sendbirdService.sendTransactionByStateList([
    //   '678baf94495fc6bb05298e5a',
    // ]);

    // get escrow transactions
    // const events = await getEscrowEvents(
    //   '0x3f6867bdbf78e8ae0973431c4b7e7410d3a5c1e667da6da9f55d59f5b6e3c3cd',
    // );
    // console.log('events', events);

    // get transaction by event
    // await sendbirdService.sendTransactionByEvent(
    //   'escrow',
    //   '6764c1f4c8cdb4a1ad36e425',
    // );

    await sendbirdService.sendSignup('66ef55171036e8ce0da0f532');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Ensure the process exits after the function completes
    process.exit();
  }
})();
