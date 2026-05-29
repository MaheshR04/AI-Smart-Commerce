import Razorpay from 'razorpay';

let razorpayInstance = null;

try {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keyId !== 'rzp_test_mock_id_123') {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } else {
    console.warn('Razorpay credentials not fully configured or set to mock. Running in offline/mock payments mode.');
  }
} catch (error) {
  console.error('Error initializing Razorpay client:', error.message);
}

export const getRazorpayInstance = () => razorpayInstance;

export default razorpayInstance;
