import { loadStripe } from '@stripe/stripe-js';

// Make sure to set this in your .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default stripePromise;