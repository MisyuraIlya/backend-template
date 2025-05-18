// src/common/decorators/price-handler.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PRICE_HANDLER_KEY = 'price_handler';

/**
 * Marks a route for automatic price enrichment.
 */
export const PriceHandler = () => SetMetadata(PRICE_HANDLER_KEY, true);
