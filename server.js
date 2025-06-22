const express = require('express');
const authRoutes = require('./routes/faculty');
const subjectRoutes = require('./routes/subjects');
const studentAuthRoutes = require('./routes/studentAuth');
const attendanceRoutes = require('./routes/attendance');
const app = express();
require('./db/connect');
require('dotenv').config();



app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/student', studentAuthRoutes);  
app.use('/api/attendance', attendanceRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
