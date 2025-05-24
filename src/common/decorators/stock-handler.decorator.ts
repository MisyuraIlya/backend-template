import { SetMetadata } from '@nestjs/common';

export const STOCK_HANDLER_KEY = 'stock_handler';

export const StockHandler = () => SetMetadata(STOCK_HANDLER_KEY, true);
