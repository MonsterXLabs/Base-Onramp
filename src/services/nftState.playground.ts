import * as dotenv from 'dotenv';
dotenv.config();
import NftStateService from './nftState.service';
(async () => {
  try {
    // Get the service instance
    const nftStateService = new NftStateService();

    // Call the function
    const result = await nftStateService.getNftSatesByIds([
      '6790fc5752387d19551f1001',
    ]);

    // Log the result
    console.log('NFT State DTO:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Ensure the process exits after the function completes
    process.exit();
  }
})();
