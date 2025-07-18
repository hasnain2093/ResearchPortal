require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const submitRoutes = require('./routes/submitRoute');
app.use('/submit', submitRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mongo: !!process.env.MONGODB_URI });
});

app.get('/', (req, res) => {
  res.send('🎓 Research Portal Backend Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
