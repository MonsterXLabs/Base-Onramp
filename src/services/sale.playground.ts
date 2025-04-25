import * as dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import { SaleService } from './sale.service';
import Container from 'typedi';

(async () => {
  const saleService = Container.get(SaleService);
  try {
    const sale = await saleService.getSaleById('67668603da94afcb7254e5cb');
    console.log(sale);
  } catch (err) {
    const error = err as Error;
    console.log(error.message);
  }
})();
