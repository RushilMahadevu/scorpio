import { AsyncLocalStorage } from 'node:async_hooks';
export const billingContext = new AsyncLocalStorage<{ organizationId: string; userId?: string; type: string }>();
