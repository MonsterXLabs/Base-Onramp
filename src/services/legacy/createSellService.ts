import axios from 'axios';
import { getCookie } from '../../lib/cookie'; // Import your getCookie function from its correct location

const server_uri = process.env.NEXT_PUBLIC_APP_BACKEND_URL;

export class CreateSellService {
  async buyItem(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/sale/buyNft`, data, {
      headers: {
        authorization: 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async resellItem(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/sale/sellNft`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }

  async endSale(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/sale/endsale`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }

  async release(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/sale/release`, data, {
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

  async cancelRequest(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/sale/cancelsaleRequest`, data, {
      headers: {
        authorization: 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async releaseRequest(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/sale/releaseRequest`, data, {
      headers: {
        authorization: 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async placeBid(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/sale/placeBid`, data, {
      headers: {
        authorization: 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async acceptBid(data: any) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/sale/acceptBid`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }

  async getNftBids(data: any) {
    return await axios.post(`${server_uri}/sale/getNftBids`, data);
  }

  async getOrders(data: any) {
    const token = getCookie('token');
    return axios.post(`${server_uri}/sale/orders`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }

  async getOrdersByUserId(data: any) {
    return axios.post(`${server_uri}/sale/ordersByUserId`, data);
  }

  async getEarnings(data: any) {
    return axios.post(`${server_uri}/sale/earning`, data);
  }

  /**
   * @param data Object containing bidId and transactionHash
   * @returns
   */
  async cancelBidOnNft(data: { bidId: string; transactionHash: string }) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/sale/cancelBid`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }

  /**
   * @param data Object containing nftId, reason, and transactionHash
   * @returns
   */
  async registerDispute(data: {
    nftId: string;
    reason: string;
    transactionHash: string;
  }) {
    const token = getCookie('token');
    return await axios.post(`${server_uri}/sale/registerDispute`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }
}
