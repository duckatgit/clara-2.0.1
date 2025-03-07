import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
// const supabaseUrl = process.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// import { createClient } from '@supabase/supabase-js';
const webhookSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;
const stripe = new Stripe('sk_test_51QzBokL0alonkQqHHmnBM8qADkvSE5JKPCYKs020hSfU3P5zbx9nIMxfYQhEapzdRhRsHCN0ZwdkURqifsO53xCc00UPldkfrE', {
  apiVersion: '2025-02-24.acacia', 
});
// const supabase = createClient(supabaseUrl, supabaseAnonKey);  
export const cofig = {
  api: {bodyParser: false},
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers['stripe-signature'] as string;
  console.log('Webhook called');
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, "whsec_SSbgwnF0mFmnmJ51tua08Phmbv7BYUvL");
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log('Success:', event.id);
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object; 
      console.log(`PaymentIntent was successful!`, paymentIntent);
      // Handle the successful payment here
      break;
    case 'checkout.session.completed':
      const checkoutSession = event.data.object; // Contains a Stripe Checkout Session
      console.log(`Checkout session completed!`, checkoutSession);
      // Handle the checkout session here
      break;
    // Handle other event types here, like `invoice.payment_succeeded`, `customer.subscription.created`, etc.
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to Stripe
  res.status(200).json({ received: true });
}
