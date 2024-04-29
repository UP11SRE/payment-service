const {channel, sendMessage} = require('../config/rabbitmq');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Replace with your Stripe secret key

async function initiatePayment(amount, email, productId,orderId, quantity) {
  try {
    const amountInCents = amount * 100; // Convert amount to cents for Stripe

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Accept card payments only
      line_items: [
        {
          price_data: {
            currency: 'INR', // Change to your currency code if needed
            product_data: {
              name: `Order #${orderId}`, // Customize product name
              description: `Your order for ${productId}`, // Customize description
            },
            unit_amount: amountInCents,
          },
          quantity: quantity,
        },
      ],
      mode: 'payment', // Set to 'payment' for immediate capture
      customer_email: email, // Optional: Pre-fill customer email
      success_url: 'http://localhost:8083/api/payment/pay?payment=success&session_id={CHECKOUT_SESSION_ID}', // Redirect URL on successful payment
      cancel_url: 'http://localhost:8083/api/payment/pay?payment=fail&session_id={CHECKOUT_SESSION_ID}', // Redirect URL on cancellation
      metadata: { // Optional: Store additional data
        orderId,
        productId,
        quantity,
      },
    });

    return session.url; // Return Stripe checkout session URL
  } catch (error) {
    console.error('Error during payment initiation:', error);
    throw new Error('Payment initiation failed. Please try again.');
  }
}

async function transactionUpdate(status, session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      const chargeId = session.payment_intent?.charges.data[0]?.id; 
      const productId = session.metadata.productId;
      const orderId  = session.metadata.orderId;
      const amount = session.amount_total;

      let quantity = 0;

      if(status == "sucess"){
      quantity = session.metadata.quantity; 
      }
     
      sendMessage({
        action: 'orderStatusUpdate',
        data: {
          status,
          chargeId,
          quantity,
          amount,
          productId,
          orderId
        }
      });
    } catch (error) {
      if (error.type === 'StripeError') {
        console.error("Stripe Error:", error.message);
      } else {
        console.error("Error:", error.message);
      }
      throw new Error('Transaction update failed'); // More specific error message
    }
  }
  
  

async function initiateRefund(data) {
  try {
    const charge_id = data.charge_id;
 
    const refund = await stripe.refunds.create({
        charge: charge_id
      });
      console.log(`Refund successful: ${refund.id}`);

    // Assuming you have access to 'channel' here
    sendMessage({
      action: 'refunded',
      data: {
        refundId : refund.id,
        charge_id : charge_id,
      }
    });
    return refund;
  } catch (error) {
    console.error('Error during refund:', error);
    throw new Error('Refund initiation failed');
  }
}

module.exports = { initiatePayment, transactionUpdate, initiateRefund };
