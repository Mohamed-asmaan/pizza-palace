// ============================================
// razorpay.js - RAZORPAY CHECKOUT POPUP (test mode)
// loadRazorpayScript = add Razorpay JS to page
// openRazorpayCheckout = show payment window
// ============================================

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = ({ keyId, amount, currency, orderId, user }) =>
  new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK failed to load'));
      return;
    }

    const options = {
      key: keyId,
      amount,
      currency,
      name: 'Pizza Palace',
      description: 'Pizza order payment',
      order_id: orderId,
      // Razorpay calls this when payment succeeds
      handler: (response) => {
        resolve(response);
      },
      prefill: {
        name: user ? user.name : '',
        email: user ? user.email : '',
      },
      theme: {
        color: '#E63946',
      },
      modal: {
        // user closed the popup without paying
        ondismiss: () => {
          reject(new Error('Payment cancelled'));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response) => {
      let message = 'Payment failed';
      if (response.error && response.error.description) {
        message = response.error.description;
      }
      reject(new Error(message));
    });
    razorpay.open();
  });
