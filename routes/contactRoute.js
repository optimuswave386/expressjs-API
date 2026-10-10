/* 
    
    // Express route that receives the Angular contact form and emails it to you.
    //
    // Install:  npm i nodemailer express-rate-limit
    // Mount:    app.use(express.json({ limit: '10kb' }));
    //           app.use('/api/contact', require('./contact-route'));
    // CORS:     if the Angular site is on another domain (e.g. Vercel), allow that origin.
    // Env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO
    //
    // Converting to ES modules? Swap require/module.exports for import/export default.

    // This contact route is for the website
    // This is the website with youtube/github APIs
    // The contact form uses this route to send email using nodemailer

 */

const express = require('express');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const TOPICS = ['Project inquiry', 'Job opportunity', 'QA / testing work', 'Just saying hi'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 5 messages per IP per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === '465',
  auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_APP_PASSWORD },
});

// Strip line breaks so user input can never inject extra mail headers.
const oneLine = (s) => String(s).replace(/[\r\n]+/g, ' ').trim();

router.post('/', limiter, async (req, res) => {
  const { name, email, topic, message, website } = req.body || {};

  // Honeypot: bots fill it in. Answer "success" and do nothing.
  if (website) return res.status(204).end();

  const valid =
    typeof name === 'string' && name.trim().length >= 2 && name.length <= 100 &&
    typeof email === 'string' && EMAIL_RE.test(email) && email.length <= 200 &&
    TOPICS.includes(topic) &&
    typeof message === 'string' && message.trim().length >= 20 && message.length <= 2000;

  if (!valid) return res.status(400).json({ error: 'invalid_input' });

  try {
    await transporter.sendMail({
      from: `"Site contact form" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      replyTo: oneLine(email),            // hitting Reply answers the visitor
      subject: `[${topic}] ${oneLine(name)}`,
      text: `Name: ${oneLine(name)}\nEmail: ${oneLine(email)}\nTopic: ${topic}\n\n${message}`,
    });
    return res.status(204).end();
  } catch (err) {
    console.error('Contact mail failed:', err);
    return res.status(500).json({ error: 'send_failed' });
  }
});

module.exports = router;