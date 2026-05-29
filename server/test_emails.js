import dotenv from 'dotenv';
dotenv.config();

import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendShippingUpdateEmail,
  sendDeliveryUpdateEmail
} from './services/emailService.js';

const runTest = async () => {
  console.log('🏁 Starting sandboxed Notifications compilation test...');

  const email = 'customer@example.com';
  const name = 'John Doe';
  
  const mockOrder = {
    _id: '6659f1c7d23d8c1c9b2f4a12',
    products: [
      {
        name: 'Wireless Noise Cancelling Headphones',
        quantity: 2,
        price: 8999
      },
      {
        name: 'Smart Fitness Tracker',
        quantity: 1,
        price: 2499
      }
    ],
    shippingAddress: {
      street: '123 Tech Avenue, Suite 400',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      phone: '9876543210'
    },
    paymentMethod: 'Razorpay',
    discountAmount: 1149.8,
    totalAmount: 19347.2,
    paymentDetails: {
      razorpayPaymentId: 'pay_live_tst19485739'
    }
  };

  try {
    console.log('Compiling Welcome Email...');
    await sendWelcomeEmail(email, name);

    console.log('Compiling Order Confirmation Email...');
    await sendOrderConfirmationEmail(email, name, mockOrder);

    console.log('Compiling Payment Confirmation Email...');
    await sendPaymentConfirmationEmail(email, name, mockOrder);

    console.log('Compiling Shipping Update Email...');
    await sendShippingUpdateEmail(email, name, mockOrder);

    console.log('Compiling Delivery Update Email...');
    await sendDeliveryUpdateEmail(email, name, mockOrder);

    console.log('✅ Compilation Complete! Verify files exist inside "server/sent_emails/" directory.');
  } catch (error) {
    console.error('❌ Compilation Test Failed:', error.message);
  }
};

runTest();
