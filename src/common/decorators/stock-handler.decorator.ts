// src/common/decorators/stock-handler.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const STOCK_HANDLER_KEY = 'stock_handler';

/**
 * Marks a route for automatic stock enrichment.
 */
export const StockHandler = () => SetMetadata(STOCK_HANDLER_KEY, true);
