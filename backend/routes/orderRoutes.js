import express from 'express';
import { createOrder, myOrders, getOrders, updateOrderStatus } from '../controllers/orderController.js';
import  protect  from '../middleware/authMiddleware.js';
import  admin  from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getOrders);
router.route('/myorders').get(protect, myOrders);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
