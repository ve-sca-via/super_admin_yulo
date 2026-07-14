import { env } from './env.js';

export const commissionPercent = env.PLATFORM_COMMISSION_PERCENT;
export const perDeliveryRate = env.DELIVERY_PARTNER_PER_DELIVERY_RATE;
export const maxConcurrentOrdersPerPartner = env.DELIVERY_PARTNER_MAX_CONCURRENT_ORDERS;

export const computeCommission = (grossRevenue) => grossRevenue * (commissionPercent / 100);
