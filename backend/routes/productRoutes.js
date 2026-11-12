import express from "express";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js"
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

 const router = express.Router();

 //all products
router.route('/').get(getProducts).post(protect, admin, upload.single('image'), createProduct);
// specific products
router.route('/:id').get(getProductById).put(protect, admin, upload.single('image'), updateProduct).delete(protect, admin, deleteProduct);

export default router;