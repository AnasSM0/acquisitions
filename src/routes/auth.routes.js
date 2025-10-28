import express from 'express';
import { signup } from '../controllers/auth.controller.js';

const router = express.Router();
router.post('/sign-in', (req, res) => {
  // Handle login logic here
  res.status(200).send('Login successful');
});

router.post('/sign-up', signup);

router.post('/sign-out', (req, res) => {
  // Handle logout logic here
  res.status(200).send('Logout successful');
});

export default router;