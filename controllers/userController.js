// controllers/userController.js
const dotenv = require('dotenv').config();
const asyncHandler = require('express-async-handler');
const users = require('../models/user.js'); // Import the User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Where the React app lives (the emailed reset link points here). Optional env var;
// defaults to the Vite dev server. The app uses HashRouter, hence the /#/ in the link.
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

// Example data source (replace with actual database logic)
const usersList = [
  { id: 1, name: 'users 1', email: 'user1@example.com', password: 'hashedPassword1' , age: 30 },
  { id: 2, name: 'users 2', email: 'user2@example.com', password: 'hashedPassword2' , age: 25 },
  { id: 3, name: 'users 3', email: 'user3@example.com', password: 'hashedPassword3' , age: 25 },
];

// route is /user/login
// Controller to handle user login
exports.loginUser = async (req, res) => {
   const { email, password } = req.body;
   const userfound = await users.findOne({ email: email }).exec();
   if (!userfound) {
     return res.status(404).send('User not found');
   }
   const emailFound = userfound.email;
   const storedHashedPassword = userfound.password;
   const passwordMatch = await bcrypt.compare(password, storedHashedPassword);
   if (passwordMatch) {
      //issue or send token with user info as needed
     const jwtToken = jwt.sign({ id: userfound._id, name: userfound.name, email: userfound.email, age: userfound.age }, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
       if (err) {
         console.error('Error generating token', err);
         res.status(500).send('Error generating token');
        } else {
         //console.log('token', token);
         //res.status(200).json({ token: token, user: { id: userfound._id, name: userfound.name, email: userfound.email, age: userfound.age } });//send selected user info along with token
         res.status(200).json({ token: token });
         return({ token });
        }
     });
     //res.status(200).send('Login successful');
   } else {
     res.status(401).send('Authentication failed');
   }
}

// route is /user/register
// Controller to handle user registration
exports.registerUser = async (req, res) => {
   const { name, email, password, age } = req.body;
   const existingUser = await users.findOne({ email: email }).exec();
   if (existingUser) {
     return res.status(409).send('User already exists');
   }
   const hashedPassword = await bcrypt.hash(password, 10);
   const newUser = new users({
     name: name,
     email: email,
     password: hashedPassword,
     age: age
   });
   await newUser.save();
   res.status(201).send('User registered successfully');
};

// route is /user/forgot-password
// Emails a one-hour password reset link. Always answers the same way, so the
// endpoint can't be used to discover which emails have accounts.
exports.forgotPassword = async (req, res) => {
   const { email } = req.body;
   if (!email || typeof email !== 'string') {
     return res.status(400).json({ message: 'Email is required' });
   }
   const reply = { message: 'If an account exists for that email, a reset link has been sent.' };

   try {
     const user = await users.findOne({ email: email }).exec();
     if (!user) return res.status(200).json(reply);

     const token = crypto.randomBytes(32).toString('hex');
     user.resetPasswordToken = sha256(token); // store the hash, email the raw token
     user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
     await user.save();

     const resetLink = `${CLIENT_URL}/#/reset-password?token=${token}`;

     if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_APP_PASSWORD) {
       // SMTP not configured (local dev): print the link instead of emailing it
       console.log(`SMTP not configured. Password reset link for ${email}: ${resetLink}`);
       return res.status(200).json(reply);
     }

     const transporter = nodemailer.createTransport({
       host: process.env.SMTP_HOST,
       port: Number(process.env.SMTP_PORT) || 587,
       secure: process.env.SMTP_SECURE === 'true',
       auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_APP_PASSWORD }
     });
     await transporter.sendMail({
       from: process.env.SMTP_EMAIL,
       to: user.email,
       subject: 'Reset your password',
       text: `Use this link to choose a new password (valid for 1 hour):\n\n${resetLink}\n\nIf you didn't ask for this, you can ignore this email.`,
       html: `<p>Use this link to choose a new password (valid for 1 hour):</p><p><a href="${resetLink}">Reset your password</a></p><p>If you didn't ask for this, you can ignore this email.</p>`
     });
   } catch (error) {
     // Log it, but still send the generic reply so failures don't reveal anything
     console.error('Error in forgotPassword:', error.message);
   }
   res.status(200).json(reply);
};

// route is /user/reset-password
// Sets a new password when given a valid, unexpired token from the emailed link.
exports.resetPassword = async (req, res) => {
   const { token, password } = req.body;
   if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
     return res.status(400).json({ message: 'Token and new password are required' });
   }
   if (password.length < 8) {
     return res.status(400).json({ message: 'Password must be at least 8 characters.' });
   }

   const user = await users.findOne({
     resetPasswordToken: sha256(token),
     resetPasswordExpires: { $gt: new Date() }
   }).exec();
   if (!user) {
     return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
   }

   user.password = await bcrypt.hash(password, 10);
   user.resetPasswordToken = undefined; // single use
   user.resetPasswordExpires = undefined;
   await user.save();
   res.status(200).json({ message: 'Password updated successfully.' });
};

// the email is passed as a parameter for email address
// route is /user/auth/:email
// Controller to verify user authorization token
exports.verifyUserAuthorizationToken = async (req, res) => {
   const email = req.params.email;
   const token = req.headers['authorization'] || req.headers['Authorization'];
   const bearertoken = req.headers['authorization'].split(' ')[1];

   //console.log('Verifying token:', token);
   //console.log('Verifying token:', bearertoken);
   
   if (!bearertoken) {
     return res.status(401).send('Authorization token missing');
   }

   try {
      jwt.verify(bearertoken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send('Invalid token');
        }
        if (decoded.email !== email) {
          return res.status(403).send('User not authorized');
        }
        //res.status(200).send('User authorized successfully');
        res.status(200).json({ valid: true });
      });
    } catch (error) {
      console.error('Error verifying token', error);
      res.status(500).send('Error verifying token');
    }

};

// route is /user/is-admin
// Controller to tell the client whether the token's user is an admin.
// Looks at the database (not the token) so a role change applies immediately.
exports.checkAdmin = async (req, res) => {
   const userfound = await users.findOne({ email: req.user.email }).select('is_admin').exec();
   res.status(200).json({ is_admin: Boolean(userfound && userfound.is_admin) });
};

// route is /user/profile/:email
// controller to get user profile based on global permissions
exports.getUserProfile = (req, res) => {
   const email = req.params.email;
   // Here you would typically fetch user profile from a database using the email as username
  res.send('User profile page');
};


// GET
// Controller to get user authorization page (example)
exports.getUser = (req, res) => {
  res.send('User Authorization Page serve HTML page, GET request');
};

// POST
// Controller to create a new user (example)
// example { "newUser": { "id":3, "name":"Fred" }, "password": "Flintstone", "username": "ffuser" }
exports.createUser = (req, res) => {
  const { newUser, password, username } = req.body; // Assuming middleware like express.json() is used
  users.push(newUser);
  console.log(`Created user: ${username} with password: ${password}`);
  res.status(201).json(newUser);
};

// route is /user/:id
// Controller to get a single user by ID
exports.getUserById = (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (user) {
    res.status(200).json(user);
    //res.send(`User ID: ${req.params.id}`);
  } else {
    res.status(404).send('User not found');
  }
};

// PUT
// Controller to update a user (example)
exports.updateUser = (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedData = req.body;
  let user = users.find(u => u.id === userId);

  if (user) {
    user = { ...user, ...updatedData };
    res.status(200).json(user);
  } else {
    res.status(404).send('User not found');
  }
}

// DELETE
// Controller to delete a user (example)
exports.deleteUser = (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    res.status(200).send('User deleted successfully');
  } else {
    res.status(404).send('User not found');
  }
}