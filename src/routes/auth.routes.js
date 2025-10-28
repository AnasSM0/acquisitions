import express from 'express';

const router = express.Router();
router.post('/login', (req, res) => {
  // Handle login logic here
  res.status(200).send('Login successful');
});

router.post('/register', (req, res) => {
  // Handle registration logic here
  res.status(201).send('sucessful registration');
});

router.post('/logout', (req, res) => {
  // Handle logout logic here
  res.status(200).send('Logout successful');
});

export default router;