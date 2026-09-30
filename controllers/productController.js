//controller/productController.js

const asyncHandler = require('express-async-handler');
const products = require('../models/products.js'); // Import the Products model

// Example data source (replace with actual database logic)
let productsList = [
    {
      id: 1,
      name: 'The Flightless Birds of New Hope',
      category: 'Books',
      price: 29.99,
      image: './src/assets/images/Book1.jpg',
      description: 'This is a great product.',
    },
    {
      id: 2,
      name: 'Bluetooth Wireless Speaker',
      category: 'Electronics',
      price: 49.99,
      image: './src/assets/images/Electronics1.jpg',
      description: 'This is a great product.',
    },
    {
      id: 3,
      name: 'A Thousand Splendid Suns',
      category: 'Books',
      price: 39.99,
      image: './src/assets/images/Book2.jpg',
      description: 'This is another product.',
    },
    {
      id: 4,
      name: 'Wireless Gaming Controller',
      category: 'Electronics',
      price: 59.99,
      image: './src/assets/images/Electronics2.jpg',
      description: 'This product is also great.',
    },
    {
      id: 5,
      name: 'Essentia Ionized Alkaline Water Bottle',
      category: 'Foodstuff',
      price: 19.99,
      image: './src/assets/images/Food1.jpg',
      description: 'You will love this product.',
    },
];

// route is /product/
// Controller to get all products
exports.getAllProducts = asyncHandler( async (req, res) => {
  res.status(200).json(productsList);
});

// route is /product/getallproductsfromdatabase
// Controller to get products from MongoDB
exports.getProductsFromDB = asyncHandler( async (req, res) => {
  const productsFromDB = await products.find({});
  res.status(200).json(productsFromDB);
});

// route is /product/getallproductsfromdatabase/:itemsperpage
// Controller to get products from MongoDB with pagination
exports.getProductsFromDB_withpagination = asyncHandler( async (req, res) => {
  const itemsPerPage = parseInt(req.params.itemsperpage);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
    return res.status(400).send('Invalid items per page parameter');
  }
  const productsFromDB = await products.find({}).limit(itemsPerPage);
  res.status(200).json(productsFromDB);
});


// route is /product/:id
// Controller to get a single product by ID
exports.getProductById = (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);

  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404).send('Product not found');
  }
};

// POST
// Controller to add a new product
exports.addProduct = (req, res) => {
  const newProduct = req.body; // Assuming middleware like express.json() is used
  products.push(newProduct);
  res.status(201).json(newProduct);
};

// PUT
// Controller to update a product
exports.updateProduct = (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body; // Assuming middleware like express.json() is used
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex !== -1) {
    products[productIndex] = updatedProduct;
    res.status(200).json(updatedProduct);
  } else {
    res.status(404).send('Product not found');
  }
};

// DELETE
// Controller to remove a product
exports.removeProduct = (req, res) => {
  const productId = parseInt(req.params.id);   
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex !== -1) {
    products.splice(productIndex, 1);
    res.status(200).send('Product removed');
  } else {
    res.status(404).send('Product not found');
  }
};


// SEARCH BY KEYWORD
//route is /product/search/:keyword
// Controller to search products by keyword
exports.searchProducts = (req, res) => {
  const keyword = req.params.keyword.toLowerCase();
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(keyword) || 
    p.description.toLowerCase().includes(keyword)
  );

  res.status(200).json(filteredProducts);
}

// SEARCH BY CATEGORY
// route is /product/category/:category
// Controller to get products by category
exports.getProductsByCategory = (req, res) => {
  const category = req.params.category;
  const filteredProducts = products.filter(p => p.category.toLowerCase() === category.toLowerCase());

  res.status(200).json(filteredProducts);
};
