import { User } from '../types';

/**
 * Simulates a backend API call to create a Stripe checkout session and process a payment.
 * In a real application, this would be an actual HTTP request to your secure backend,
 * which would then communicate with the Stripe API.
 * 
 * @param user The user initiating the payment.
 * @param amount The amount to be charged.
 * @returns A promise that resolves on successful "payment".
 */
export const processPayment = (user: User, amount: number): Promise<void> => {
  if (import.meta.env.PROD) {
    return Promise.reject(new Error('Payment processing is not yet configured. Please contact support.'));
  }

  console.log(`[DEV] Simulating payment of $${amount.toFixed(2)} for user ${user.name} (${user.id})...`);

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[DEV] Simulated payment successful for user ${user.id}.`);
      resolve();
    }, 2000);
  });
};
