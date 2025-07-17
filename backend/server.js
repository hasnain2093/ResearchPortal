// backend/server.js
const express = require('express');
const connectDB = require('./config/db'); // ✅ No curly braces!

const app = express();

connectDB(); // ✅ Call the DB connection

app.use(express.json());

app.get('/', (req, res) => {
  res.send('🎓 Research Portal Backend Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
