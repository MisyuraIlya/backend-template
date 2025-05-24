import { SetMetadata } from '@nestjs/common';

export const PRICE_HANDLER_KEY = 'price_handler';

export const PriceHandler = () => SetMetadata(PRICE_HANDLER_KEY, true);
