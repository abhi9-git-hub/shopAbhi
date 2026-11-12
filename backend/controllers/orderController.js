import mongoose from 'mongoose';
import Order from '../models/Order.js';
import sendEmail from '../utils/sendEmails.js';

const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentId } = req.body;
    if (!items || items.length === 0 || !totalAmount || !address) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const order = new Order({
      userId: req.user._id,
      items,
      totalAmount,
      address,
      paymentId
    });
    const createdOrder = await order.save();

    let emailSent = true;
    const message = [
      `Hello ${req.user.name},`,
      '',
      `Your order has been confirmed. Order ID: ${createdOrder._id}`,
      `Total paid: ₹${createdOrder.totalAmount.toFixed(2)}`,
      `Shipping address: ${address.fullName}, ${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`,
      '',
      'Thank you for shopping with ShopNest!'
    ].join('\n');

    try {
      await sendEmail(req.user.email, 'ShopNest - Order Confirmation', message);
    } catch (error) {
      emailSent = false;
      console.error('Order confirmation email failed:', error);
    }

    res.status(201).json({ ...createdOrder.toObject(), emailSent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate('items.productId', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
  
   

    const { status } = req.body;
    const order = await Order.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
  
    
  
    if (order) {
    //   order.status = req.body.status || order.status;
      order.status = status;
      await order.save();
      res.json({ message: 'Order status updated', order })
    //   const updatedOrder = await order.save();
      // res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
   
  }
};




export { createOrder, myOrders, getOrders, updateOrderStatus };
