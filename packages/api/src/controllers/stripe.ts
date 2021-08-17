import { Request, Response } from 'express';
import Stripe from 'stripe';

const PUBLISHABLE_KEY =
  'pk_test_51JPOjkHcR3ufmXpIKyOqPcsGH43UiUOlrYGMZFG15uUIqsRlNLQGnUqr34ugiZNto4E1ltGmqGyt1EFwQ2y1ZUk500CrKyWv3y KEY HERE';
const SECRET_KEY =
  'sk_test_51JPOjkHcR3ufmXpIdcBBRPZUVLgJV0hvpJKJb0qAhchKnxSdZDK8zRkfNA1xxJxPcpKjadKVWSYvOuTIZYGPgX7Z002nEwhdlq KEY HERE';

//Confirm the API version from your stripe dashboard
const stripe = Stripe(SECRET_KEY, { apiVersion: '2020-08-27' });

export const stripePaiement = async (req: Request, res: Response) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099, //lowest denomination of particular currency
      currency: 'usd',
      payment_method_types: ['card'], //by default
    });

    const clientSecret = paymentIntent.client_secret;

    res.json({
      clientSecret: clientSecret,
    });
  } catch (e) {
    console.log(e.message);
    res.json({ error: e.message });
  }
};
