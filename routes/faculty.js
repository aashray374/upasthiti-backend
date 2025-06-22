const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { faculty_id, name, email, password, department } = req.body;

  db.query('SELECT * FROM faculties WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO faculties (faculty_id, name, email, password, department) VALUES (?, ?, ?, ?, ?)',
      [faculty_id, name, email, hashedPassword, department],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Signup successful' });
      }
    );
  });
});


router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM faculties WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ faculty_id: user.faculty_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login successful', token });
  });
});

module.exports = router;
