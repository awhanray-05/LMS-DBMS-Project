const Razorpay = require('razorpay');
const crypto = require('crypto');
const { getConnection } = require('../config/database');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order for fine payment
const createRazorpayOrder = async (req, res) => {
  let connection;
  try {
    const { fine_id } = req.body;
    const memberId = req.member.id; // From authentication middleware

    if (!fine_id) {
      return res.status(400).json({
        success: false,
        message: 'Fine ID is required'
      });
    }

    connection = await getConnection();

    // Get fine details and verify ownership
    const fineResult = await connection.execute(
      `SELECT fine_id, fine_amount, status, member_id, fine_reason 
       FROM fine_history 
       WHERE fine_id = :fine_id AND member_id = :member_id`,
      { fine_id, member_id: memberId }
    );

    if (fineResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Fine not found or you do not have permission to pay this fine'
      });
    }

    const fine = fineResult.rows[0];

    if (fine.STATUS === 'PAID') {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Fine already paid'
      });
    }

    if (fine.STATUS === 'WAIVED') {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Fine has been waived'
      });
    }

    const fineAmount = parseFloat(fine.FINE_AMOUNT);
    
    if (fineAmount <= 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Invalid fine amount'
      });
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(fineAmount * 100);

    // Create Razorpay order
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `fine_${fine_id}_${Date.now()}`,
      notes: {
        fine_id: fine_id.toString(),
        member_id: memberId.toString(),
        fine_reason: fine.FINE_REASON || 'Library fine'
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Store order ID in database for tracking
    await connection.execute(
      `UPDATE fine_history 
       SET razorpay_order_id = :order_id 
       WHERE fine_id = :fine_id`,
      { 
        order_id: razorpayOrder.id,
        fine_id 
      }
    );

    await connection.close();

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: fineAmount, // Amount in INR
        amountInPaise: amountInPaise, // Amount in paise for Razorpay Checkout
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    if (connection) {
      await connection.close();
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify payment and update fine status
const verifyPayment = async (req, res) => {
  let connection;
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, fine_id } = req.body;
    const memberId = req.member.id; // From authentication middleware

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !fine_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment parameters'
      });
    }

    connection = await getConnection();

    // Get fine details and verify ownership
    const fineResult = await connection.execute(
      `SELECT fine_id, fine_amount, status, member_id, razorpay_order_id 
       FROM fine_history 
       WHERE fine_id = :fine_id AND member_id = :member_id`,
      { fine_id, member_id: memberId }
    );

    if (fineResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Fine not found or you do not have permission to pay this fine'
      });
    }

    const fine = fineResult.rows[0];

    if (fine.STATUS === 'PAID') {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Fine already paid'
      });
    }

    // Verify that the order ID matches
    if (fine.RAZORPAY_ORDER_ID !== razorpay_order_id) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Verify payment with Razorpay API
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        await connection.close();
        return res.status(400).json({
          success: false,
          message: `Payment not successful. Status: ${payment.status}`
        });
      }

      // Verify order ID matches
      if (payment.order_id !== razorpay_order_id) {
        await connection.close();
        return res.status(400).json({
          success: false,
          message: 'Order ID mismatch'
        });
      }

      // Verify amount matches
      const fineAmountInPaise = Math.round(parseFloat(fine.FINE_AMOUNT) * 100);
      if (payment.amount !== fineAmountInPaise) {
        await connection.close();
        return res.status(400).json({
          success: false,
          message: 'Amount mismatch'
        });
      }

      // Update fine status to PAID
      await connection.execute(
        `UPDATE fine_history 
         SET status = 'PAID',
             paid_date = SYSDATE,
             razorpay_payment_id = :payment_id,
             razorpay_signature = :signature,
             payment_date = CURRENT_TIMESTAMP
         WHERE fine_id = :fine_id`,
        {
          payment_id: razorpay_payment_id,
          signature: razorpay_signature,
          fine_id
        }
      );

      await connection.close();

      res.json({
        success: true,
        message: 'Payment verified and fine marked as paid successfully',
        data: {
          fineId: fine_id,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id
        }
      });
    } catch (razorpayError) {
      console.error('Razorpay API verification error:', razorpayError);
      await connection.close();
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment with Razorpay',
        error: razorpayError.message
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    if (connection) {
      await connection.close();
    }
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment
};

