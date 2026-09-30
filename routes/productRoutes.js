const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define routes and link them to controller functions

// This path is actually /product/
router.get('/', productController.getAllProducts);

// This path is actually /product/getallproductsfromdatabase
router.get('/getallproductsfromdatabase', productController.getProductsFromDB);
router.get('/getallproductsfromdatabase/:itemsperpage', productController.getProductsFromDB_withpagination);

// This path is actually /product/:id
router.get('/:id', productController.getProductById);

// Add new product
router.post('/', productController.addProduct);

// Update product
router.put('/:id', productController.updateProduct);

// Remove product
router.delete('/:id', productController.removeProduct);

// Additional routes for searching and filtering products
router.get('/search/:keyword', productController.searchProducts);
router.get('/category/:category', productController.getProductsByCategory);

// Export the router
module.exports = router;