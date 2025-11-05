-- Migration script to add Razorpay payment tracking columns to fine_history table
-- Run this script if the table already exists without the payment columns

-- Add Razorpay payment tracking columns
ALTER TABLE fine_history ADD (
    razorpay_order_id VARCHAR2(100),
    razorpay_payment_id VARCHAR2(100),
    razorpay_signature VARCHAR2(255),
    payment_date TIMESTAMP
);

COMMIT;

