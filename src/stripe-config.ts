export interface StripeProduct {
  priceId?: string; // Optional for custom amount donations
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    name: 'Donation',
    description: 'Support Our Developers - Custom Amount',
    mode: 'payment'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};