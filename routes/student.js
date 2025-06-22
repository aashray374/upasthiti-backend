const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// Student Signup
router.post('/signup', async (req, res) => {
  const { enrollment_no, name, password } = req.body;

  db.query('SELECT * FROM students WHERE enrollment_no = ?', [enrollment_no], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: 'Enrollment number already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO students (enrollment_no, name, password) VALUES (?, ?, ?)',
      [enrollment_no, name, hashedPassword],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Student registered successfully' });
      }
    );
  });
});

// Student Login
router.post('/login', (req, res) => {
  const { enrollment_no, password } = req.body;

  db.query('SELECT * FROM students WHERE enrollment_no = ?', [enrollment_no], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const student = results[0];
    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ enrollment_no: student.enrollment_no }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login successful', token });
  });
});

// Register Student in a Subject
router.post('/register-subject', (req, res) => {
  const { enrollment_no, subject_id } = req.body;

  db.query('SELECT * FROM student_subjects WHERE enrollment_no = ? AND subject_id = ?', [enrollment_no, subject_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: 'Already registered for this subject' });

    db.query(
      'INSERT INTO student_subjects (enrollment_no, subject_id) VALUES (?, ?)',
      [enrollment_no, subject_id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Subject registered successfully' });
      }
    );
  });
});

module.exports = router;
