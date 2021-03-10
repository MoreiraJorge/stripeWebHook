import Router from "koa-router";
import Stripe from "stripe";
import koabody from "koa-body";

require("dotenv").config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
    typescript: true
});

const router = new Router();

router.post("/webhook", 
    koabody({ includeUnparsed : true }), 
    async (ctx) => {
    
    //get the webhook signature for verification
    const sig = ctx.request.headers['stripe-signature'] as string;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        //get the rawBody
        ctx.request.body[Symbol.for("unparsedBody")],
        sig, 
        WEBHOOK_SECRET
        );
    }
    catch (err) {
        console.log(`⚠️ Webhook signature verification failed.`);
        ctx.status = 400;
        ctx.response.body = `Webhook Error: ${err.message}`;
        return;
    }

    // Extract the data from the event.
    const data: Stripe.Event.Data = event.data;

    // Handle the event types you want, these are just examples
    switch (event.type) {
        case 'payment_intent.succeeded':
            // Cast the event into a PaymentIntent to make use of the types.
            const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent;
            // Funds have been captured
            // Fulfill any orders, e-mail receipts, etc
            console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`);
            console.log("💰 Payment captured!");
            break;
        case 'payment_method.attached':
            console.log('PaymentMethod was attached to a Customer!');
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    ctx.status = 200;
});

export default router;