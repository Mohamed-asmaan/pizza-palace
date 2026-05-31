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

export const openRazorpayCheckout = ({
  keyId,
  amount,
  currency,
  orderId,
  user,
  onSuccess,
  onDismiss,
}) =>
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
      handler: (response) => {
        onSuccess(response);
        resolve(response);
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#E63946',
      },
      modal: {
        ondismiss: () => {
          onDismiss?.();
          reject(new Error('Payment cancelled'));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response) => {
      reject(new Error(response.error?.description || 'Payment failed'));
    });
    razorpay.open();
  });
