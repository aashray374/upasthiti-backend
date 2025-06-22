const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/view-all/:enrollment_no', (req, res) => {
  const { enrollment_no } = req.params;

  const today = new Date().toISOString().slice(0, 10);

  const query = `
    SELECT 
      c.class_date,
      c.class_time,
      c.class_type,
      s.subject_id,
      s.subject_name,
      a.status,
      CASE 
        WHEN c.class_date > CURDATE() THEN 'upcoming'
        ELSE 'past'
      END AS timing
    FROM student_subjects ss
    JOIN subjects s ON ss.subject_id = s.subject_id
    JOIN classes c ON s.subject_id = c.subject_id
    LEFT JOIN attendance a ON 
      a.subject_id = s.subject_id AND 
      a.class_date = c.class_date AND
      a.class_time = c.class_time AND
      a.enrollment_no = ?
    WHERE ss.enrollment_no = ?
    ORDER BY c.class_date ASC, c.class_time ASC
  `;

  db.query(query, [enrollment_no, enrollment_no], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const upcoming = [];
    const past = [];

    results.forEach(row => {
      const entry = {
        class_date: row.class_date,
        class_time: row.class_time,
        class_type: row.class_type,
        subject_id: row.subject_id,
        subject_name: row.subject_name,
        status: row.timing === 'past' ? (row.status || 'not marked') : undefined,
      };

      if (row.timing === 'upcoming') {
        upcoming.push(entry);
      } else {
        past.push(entry);
      }
    });

    res.json({ upcoming, past });
  });
});

module.exports = router;
