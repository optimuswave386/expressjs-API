const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authHandler = require('../middleware/authHandler.js'); // Import the auth middleware

// Define routes and link them to controller functions

// route is /user/login
// authenticate user with email and password
router.post('/login', userController.loginUser);

// route is /user/register
// register a new user
router.post('/register', userController.registerUser);

// route is /user/forgot-password
// email a password reset link
router.post('/forgot-password', userController.forgotPassword);

// route is /user/reset-password
// set a new password using the emailed token
router.post('/reset-password', userController.resetPassword);

// verify user authorization token
// This path is actually /user/auth/<email> for zero trust authorization
router.post('/auth/:email', userController.verifyUserAuthorizationToken);

// Is the logged-in user an admin? Must sit above the '/:id' route below.
// This path is actually /user/is-admin
router.get('/is-admin', authHandler, userController.checkAdmin);

// Authenticated based on authorization token issued after login
// get user profile on protected route with auth middleware
// This path is actually /user/profile
router.post('/profile/:email', authHandler, userController.getUserProfile);


// Basic route services HTML page
// Respond to GET request on the root route ('/')
router.get('/', userController.getUser);

// create a new user
// Respond to POST request on the root route ('/')
router.post('/', userController.createUser);

// This path is actually /user/:id 
router.get('/:id', userController.getUserById);

// update user info
// Respond to a PUT request to the '/user' route
router.put('/:id', userController.updateUser);

// Respond to a DELETE request to the '/user' route
router.delete('/:id', userController.deleteUser);

module.exports = router;