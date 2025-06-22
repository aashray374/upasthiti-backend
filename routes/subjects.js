const express = require('express');
const router = express.Router();

router.post('/add', (req, res) => {
  const { subject_id, name, faculty_id } = req.body;
  const query = `INSERT INTO subjects (subject_id, name, faculty_id) VALUES (?, ?, ?)`;
  db.query(query, [subject_id, name, faculty_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Subject added successfully' });
  });
});


router.post('/add-class', (req, res) => {
    const {
      subject_id,
      type,
      class_type,      
      class_date,      
      day_of_week,     
      end_date,        
      class_time,
      location,
    } = req.body;
  
    if (class_type === 'fixed') {
      const query = `
        INSERT INTO classes (subject_id, class_type, type, class_date, class_time, location)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(query, [subject_id, class_type, type, class_date, class_time, location], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Fixed class added successfully' });
      });
  
    } else if (class_type === 'repeating') {
      const query = `
        INSERT INTO classes (subject_id, class_type, type, day_of_week, class_time, location, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(query, [subject_id, class_type, type, day_of_week, class_time, location, end_date], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Repeating class added successfully' });
      });
  
    } else {
      return res.status(400).json({ error: 'Invalid class_type: must be "fixed" or "repeating"' });
    }
  });
  


router.post('/add-announcement', (req, res) => {
  const { subject_id, message } = req.body;
  const query = `
    INSERT INTO announcements (subject_id, message)
    VALUES (?, ?)
  `;
  db.query(query, [subject_id, message], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Announcement added' });
  });
});


router.post('/add-resource', (req, res) => {
  const { subject_id, title, url } = req.body;
  const query = `
    INSERT INTO resources (subject_id, title, url)
    VALUES (?, ?, ?)
  `;
  db.query(query, [subject_id, title, url], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Resource uploaded' });
  });
});

// GET all subjects
router.get('/all', (req, res) => {
    const query = `SELECT * FROM subjects`;
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  
  // GET subject by ID (with faculty info)
  router.get('/:subject_id', (req, res) => {
    const { subject_id } = req.params;
    const query = `
      SELECT s.*, f.name AS faculty_name, f.email AS faculty_email, f.department
      FROM subjects s
      JOIN faculties f ON s.faculty_id = f.faculty_id
      WHERE s.subject_id = ?
    `;
    db.query(query, [subject_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Subject not found' });
      res.json(results[0]);
    });
  });
  
  // GET all classes for a subject
  router.get('/:subject_id/classes', (req, res) => {
    const { subject_id } = req.params;
    const query = `SELECT * FROM classes WHERE subject_id = ? ORDER BY class_type DESC, class_date ASC`;
    db.query(query, [subject_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  
  // GET only fixed classes
  router.get('/:subject_id/classes/fixed', (req, res) => {
    const { subject_id } = req.params;
    const query = `SELECT * FROM classes WHERE subject_id = ? AND class_type = 'fixed' ORDER BY class_date ASC`;
    db.query(query, [subject_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  
  // GET only repeating classes
  router.get('/:subject_id/classes/repeating', (req, res) => {
    const { subject_id } = req.params;
    const query = `SELECT * FROM classes WHERE subject_id = ? AND class_type = 'repeating' ORDER BY day_of_week ASC`;
    db.query(query, [subject_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  
  // GET announcements for a subject
  router.get('/:subject_id/announcements', (req, res) => {
    const { subject_id } = req.params;
    const query = `SELECT * FROM announcements WHERE subject_id = ? ORDER BY posted_on DESC`;
    db.query(query, [subject_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  
  // GET resources for a subject
  router.get('/:subject_id/resources', (req, res) => {
    const { subject_id } = req.params;
    const query = `SELECT * FROM resources WHERE subject_id = ? ORDER BY uploaded_on DESC`;
    db.query(query, [subject_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  

module.exports = router;
