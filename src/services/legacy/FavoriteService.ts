import axios from 'axios';
import { getCookie } from '../../lib/cookie'; // Import your getCookie function from its correct location

const server_uri = process.env.NEXT_PUBLIC_APP_BACKEND_URL;

export class FavoriteService {
  private token: string | null;

  constructor() {
    this.token = getCookie('token');
  }

  async handleLikeArtists(data: any) {
    return await axios.post(`${server_uri}/favorite/likeArtist/`, data, {
      headers: {
        authorization: 'Bearer ' + this.token,
      },
    });
  }

  async handleLikeNfts(data: any) {
    return await axios.post(`${server_uri}/favorite/likeNft/`, data, {
      headers: {
        authorization: 'Bearer ' + this.token,
      },
    });
  }

  async handleLikeCollections(data: any) {
    return await axios.post(`${server_uri}/favorite/likeCollection/`, data, {
      headers: {
        authorization: 'Bearer ' + this.token,
      },
    });
  }

  async getUserLikedNfts(data: any) {
    return await axios.post(`${server_uri}/favorite/userLikedNft/`, data, {
      headers: {
        authorization: 'Bearer ' + this.token,
      },
    });
  }

  async getUserLikedArtists(data: any) {
    return await axios.post(`${server_uri}/favorite/userLikedArtists/`, data, {
      headers: {
        authorization: 'Bearer ' + this.token,
      },
    });
  }

  async getUserLikedCollections(data: any) {
    return await axios.post(
      `${server_uri}/favorite/userLikedCollection/`,
      data,
      {
        headers: {
          authorization: 'Bearer ' + this.token,
        },
      },
    );
  }

  async getCollectionTotalLikes(data: any) {
    return await axios.post(
      `${server_uri}/favorite/totalLikedCollection/`,
      data,
    );
  }

  async getNftTotalLikes(data: any) {
    return await axios.post(`${server_uri}/favorite/totalLikedNfts/`, data);
  }

  async getArtistsTotalLikes(data: any) {
    return await axios.post(`${server_uri}/favorite/totalLikedArtist/`, data);
  }

  async getUserReactionToArtist(data: any) {
    return await axios.post(
      `${server_uri}/favorite/getUserReactionToArtist/`,
      data,
      {
        headers: {
          authorization: 'Bearer ' + this.token,
        },
      },
    );
  }

  async getUserReactionToNft(data: any) {
    return await axios.post(
      `${server_uri}/favorite/getUserReactionToNft/`,
      data,
      {
        headers: {
          authorization: 'Bearer ' + this.token,
        },
      },
    );
  }

  async getUserReactionToCollection(data: any) {
    return await axios.post(
      `${server_uri}/favorite/getUserReactionToCollection/`,
      data,
      {
        headers: {
          authorization: 'Bearer ' + this.token,
        },
      },
    );
  }
}
