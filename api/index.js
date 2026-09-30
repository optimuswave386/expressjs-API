//imports
require('dotenv').config(); // no-op on Vercel (env vars come from project settings), useful locally
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');


//Models for MongoDB/mongoose to interact with collections
const connectDB = require('../config/dbconnect.js'); // Import the database connection function
const errorHandler = require('../middleware/errorHandler.js'); // Import custom error handling middleware defined in beginning, used at end of file

// Middleware
const app = express();

//CORS and security middleware
app.use(cors());
app.use(express.json()); //app.use(bodyParser.json()); //deprecated with express.json()

// Serverless: make sure MongoDB is connected before any route runs.
// connectDB() caches the connection, so warm invocations reuse it.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
    console.log('MongoDB connection is done');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(503).json({ message: 'Database unavailable' });
  }
});




// PRODUCTION ISSUE
// This snippet has to stay above all routes
// Fix for live url on vercel hosting
app.use((req, res, next) => {
  if (req.query.path !== undefined) {
    req.url = '/api/' + req.query.path;
  }
  next();
});








// Routes

//Email template React component for Nodemailer
//const EmailTemplate = require('./emails/EmailTemplate.jsx'); // Adjust the path as necessary

// Subscribe with email route
app.post('/subscribe-with-email', async (req, res) => {
  
  try {

    console.log("Request body received at /subscribe-with-email:", req.body);
    const { SubscriberEmail } = req.body; //req.body.SubscriberEmail;  //'';
    console.log(`Received subscription request for email: ${SubscriberEmail}`);
    console.log("SubscriberEmail type:", typeof SubscriberEmail);
    if (!SubscriberEmail || typeof SubscriberEmail !== 'string') {
      console.error("Invalid email provided:", SubscriberEmail);
      return res.status(400).send('Invalid email');
    }

    /* Use Nodemailer to send subscription confirmation email */
    // 1. Extract data from the request body
    //const { name, message, userEmail } = req.body;
    const userEmail = SubscriberEmail; //'optimuswave386@gmail.com';//req.body.userEmail;
    console.log("Preparing to send email to:", userEmail);

    // 2. Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com' ${SMTP_HOST}
            port: 587, // 587 or 465 for secure
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_APP_PASSWORD
            }
        });
    
    // 2. Render the React component to an HTML string
    //const emailHtml = render(<EmailTemplate name={name} message={message} />);
    //const emailHtml = render(React.createElement(EmailTemplate, { name, message }));
    const emailHtml = "<p>Your Email Subscription is successful</p>"; // Placeholder since EmailTemplate is not defined here

    // 3. Define mail options
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: userEmail,
        subject: 'Subscribe Form - Confirmation Message',
        html: emailHtml, // Use the generated HTML string
    };

    // 4. Send the email
    // send response back to client at closing bracket
    try {
        await transporter.sendMail(mailOptions);
        //res.status(200).send('Email sent successfully!');
    } catch (error) {
        console.error(error);
    }

    /**/
    // Here you would typically add the email to your database or mailing list
    console.log(`Subscription successful for email: ${SubscriberEmail}`);
    res.status(200).send(`Subscription successful for email: ${SubscriberEmail}`);

  } catch (error) {
    
    console.error("Error in /subscribe-with-email:", error.message);   
    res.status(500).send('Subscription failed');

  }

});



// Database connection is handled per request by the middleware near the top of this file.




// Routes
// Log support request route
// Import the supportrequests model
// Create a new support request
const supportrequests = require('../models/supportrequests.js');
app.post('/log-support-request', async (req, res) => {
  //console.log("Request body received at /log-support-request:", req.body);
  const requests = new supportrequests({
    contactEmail: req.body.contactEmail,
    issueDescription: req.body.issueDescription
  });
  try {
    const newRequest = await requests.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});






// Routes
// Import quote routes, db connected in dbconnect.js
const quoteRouter = require('../routes/quoteRoutes.js');

// Mount the router on the /quote path. 
// All routes defined in quoteRouter will be prefixed with /quote.
app.use('/', quoteRouter);





// Routes
// Import user routes
const userRouter = require('../routes/userRoutes.js');

// Mount the router on the /user path. 
// All routes defined in userRouter will be prefixed with /user.
app.use('/user', userRouter); 





// Routes
// Import cart routes
const cartRouter = require('../routes/cartRoutes.js');

// Mount the router on the /cart path. 
// All routes defined in cartRouter will be prefixed with /cart.
app.use('/cart', cartRouter);





// Routes
// Import product routes
const productRouter = require('../routes/productRoutes.js');

// Mount the router on the /product path. 
// All routes defined in productRouter will be prefixed with /product.
app.use('/product', productRouter);

// Payment routes (Stripe)
const paymentRouter = require('../routes/paymentRoutes.js');
app.use('/payment', paymentRouter);






// Design Notes section
// pagination to be implemented
const dnRouter = require('../routes/designnotesRoutes.js');
app.use('/dn', dnRouter);





// CEP section
// CEP pagination to be implemented
// Get CEP projects from the database
const cepRouter = require('../routes/cepRoutes.js');
app.use('/cep', cepRouter);





// test route to serve HTML content for React app
// Route to serve HTML content for React app
app.get('/getProjects', (req, res) => {
    console.log('Incoming:', req.method, req.originalUrl);
    // This could be a static HTML file, or dynamically generated content
    const htmlContent = `
        <h2>Welcome to the dynamically loaded content!</h2>
        <p>This paragraph was fetched using Axios and injected into the page.</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
    `;
    res.send(htmlContent);
});










// Basic route
// Respond to GET request on the root route ('/')
app.get('/', (req, res) => {
  console.log('Incoming:', req.method, req.originalUrl);
  res.send('Hello World! This is the homepage.');
});

// Respond to POST request on the root route ('/')
app.post('/', (req, res) => {
  console.log('Incoming:', req.method, req.originalUrl);
  res.send('Hello World! This is the homepage. Got a POST request');
  console.log("POST request body:", req.body);
});





// test route to serve HTML content for React app
// Route to serve HTML content for React app
app.get('/api/get-html', (req, res) => {
    console.log('Incoming:', req.method, req.originalUrl);
    // This could be a static HTML file, or dynamically generated content
    const htmlContent = `
        <h2>Welcome to the dynamically loaded content!</h2>
        <p>This paragraph was fetched using Axios and injected into the page.</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
    `;
    res.send(htmlContent);
});





// IMPORTANT: Error handling middleware
// Error handling middleware must be registered after all routes
app.use(errorHandler);


// No app.listen() here: Vercel invokes the exported app as a serverless function.
// For local development run `npm run dev` (see server.js).
module.exports = app;