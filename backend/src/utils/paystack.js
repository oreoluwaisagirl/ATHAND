import Paystack from 'paystack';

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

// Initialize payment
export const initializePayment = async ({ email, amount, currency = 'NGN', reference, callbackUrl, metadata }) => {
  try {
    const response = await paystack.transaction.initialize({
      email,
      amount: amount * 100, // Paystack expects amount in kobo
      currency,
      reference,
      callback_url: callbackUrl,
      metadata: metadata || {}
    });
    return response;
  } catch (error) {
    console.error('Paystack initialize error:', error);
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (reference) => {
  try {
    const response = await paystack.transaction.verify(reference);
    return response;
  } catch (error) {
    console.error('Paystack verify error:', error);
    throw error;
  }
};

// Create transfer recipient (for paying workers)
export const createTransferRecipient = async ({ name, accountNumber, bankCode }) => {
  try {
    const response = await paystack.transferRecipient.create({
      type: 'nuban',
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN'
    });
    return response;
  } catch (error) {
    console.error('Paystack create recipient error:', error);
    throw error;
  }
};

// Initiate transfer to worker
export const transferToWorker = async ({ amount, recipient, reference }) => {
  try {
    const response = await paystack.transfer.initiate({
      source: 'balance',
      amount: amount * 100, // Amount in kobo
      recipient,
      reference,
      reason: 'Payment for service'
    });
    return response;
  } catch (error) {
    console.error('Paystack transfer error:', error);
    throw error;
  }
};

// Get transaction timeline
export const getTransactionTimeline = async (reference) => {
  try {
    const response = await paystack.transaction.timeline(reference);
    return response;
  } catch (error) {
    console.error('Paystack timeline error:', error);
    throw error;
  }
};

export default {
  initializePayment,
  verifyPayment,
  createTransferRecipient,
  transferToWorker,
  getTransactionTimeline
};

