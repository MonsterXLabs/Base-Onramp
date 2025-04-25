import axios from 'axios';
import { getCookie } from '../../lib/cookie'; // Import your getCookie function from its correct location

const server_uri = process.env.NEXT_PUBLIC_APP_BACKEND_URL;

export class CategoryService {
  private token: string | null;

  constructor() {
    this.token = getCookie('token');
  }

  async getAllCategories(skip: number, limit: number) {
    return await axios.get(
      `${server_uri}/category/getAllCategories/${skip}/${limit}`,
    );
  }
}
