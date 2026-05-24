const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/sprints', require('./routes/sprint.routes'));
app.use('/api/issues', require('./routes/issue.routes'));
app.use('/api/comments', require('./routes/comment.routes'));
app.use('/api/activities', require('./routes/activity.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgileForge API is running 🚀' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 AgileForge API running on port ${PORT}`);
});
