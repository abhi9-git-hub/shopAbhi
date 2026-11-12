import Razorpay from 'razorpay';
import crypto from'crypto';
import dotenv from 'dotenv';
dotenv.config();

const createOrder = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(503).json({ message: 'Razorpay is not configured on the server' });
    }

    const amount = Number(req.body.amount);
    const amountInPaise = Math.round(amount * 100);
    if (!Number.isFinite(amount) || !Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({ message: 'A valid payment amount is required' });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };
    
    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");
    res.json({ ...order, keyId });
  } catch (error) {
    const razorpayError = error?.error;
    const message = razorpayError?.description
      || razorpayError?.reason
      || (typeof razorpayError === 'string' ? razorpayError : null)
      || error?.message
      || 'Unable to create a Razorpay order';
    const statusCode = Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 500;

    console.error('Razorpay order creation failed:', message);
    res.status(statusCode).json({ message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");
    

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

export { createOrder, verifyPayment };
