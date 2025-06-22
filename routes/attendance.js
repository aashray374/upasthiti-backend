const express = require('express');
const router = express.Router();

// Mark attendance
router.post('/mark', (req, res) => {
  const { enrollment_no, subject_id, class_date, class_time, status, class_type } = req.body;

  const query = `
    INSERT INTO attendance (enrollment_no, subject_id, class_date, class_time, status, class_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [enrollment_no, subject_id, class_date, class_time, status, class_type], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Attendance marked' });
  });
});

// Get attendance summary by student & subject
router.get('/summary/:enrollment_no/:subject_id', (req, res) => {
    const { enrollment_no, subject_id } = req.params;
  
    const query = `
      SELECT 
        class_type,
        status,
        COUNT(*) as count
      FROM attendance
      WHERE enrollment_no = ? AND subject_id = ?
      GROUP BY class_type, status
    `;
  
    db.query(query, [enrollment_no, subject_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
  
      const summary = {};
  
      results.forEach(row => {
        const { class_type, status, count } = row;
        if (!summary[class_type]) {
          summary[class_type] = { present: 0, absent: 0, cancelled: 0 };
        }
        summary[class_type][status] = count;
      });
  
      res.json(summary);
    });
  });
  
