import axios from 'axios';
import { getCookie } from '../../lib/cookie'; // Import your getCookie function from its correct location

const server_uri = process.env.NEXT_PUBLIC_APP_BACKEND_URL;

export class CreateNftServices {
  async createBasicDetails(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/nft/create-basic-details`, data, {
      headers: {
        authorization: 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async createAdvancedDetails(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/nft/add-advanced-details`, data, {
      headers: {
        authorization: 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async createSellerDetails(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/nft/add-shipment-details`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }

  async mintAndSale(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/nft/mint-and-sale`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }

  async createVoucher(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/nft/add-voucher`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }

  /**
   * @param data Object containing nftId
   * @returns
   */
  async removeFromDb(data: { nftId: string }) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/nft/delete`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }

  async editNft(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/nft/editNft`, data, {
      headers: {
        authorization: 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}
