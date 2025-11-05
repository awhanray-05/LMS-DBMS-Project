// Razorpay payment integration service
export const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    initializeRazorpay().then(resolve);
  });
};

export const openRazorpayCheckout = (options) => {
  return new Promise((resolve, reject) => {
    loadRazorpay().then((loaded) => {
      if (!loaded) {
        reject(new Error('Failed to load Razorpay SDK'));
        return;
      }

      const razorpayOptions = {
        key: options.keyId,
        amount: options.amount,
        currency: options.currency || 'INR',
        name: options.name || 'Library Management System',
        description: options.description || 'Fine Payment',
        order_id: options.orderId,
        handler: function (response) {
          resolve(response);
        },
        prefill: {
          name: options.customerName || '',
          email: options.customerEmail || '',
          contact: options.customerContact || ''
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    });
  });
};

