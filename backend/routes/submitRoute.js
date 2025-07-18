const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const ResearchPaper = require('../models/ResearchPaper');
const { ObjectId } = require('mongodb');

// Use multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /submit (store PDF in GridFS)
router.post('/', upload.single('paper'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required and must be a valid PDF.' });
    }
    // Check for required fields
    const requiredFields = [
      'studentName', 'studentId', 'email', 'department', 'universityName', 'paperTitle', 'abstract', 'keywords'
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    // Store file in GridFS
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'papers' });
    const uploadStream = bucket.openUploadStream(Date.now() + '-' + req.file.originalname, {
      contentType: req.file.mimetype,
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on('error', (err) => {
      console.error('Error uploading to GridFS:', err);
      return res.status(500).json({ error: 'Error uploading file to database.' });
    });
    uploadStream.on('finish', async () => {
      try {
        const newPaper = new ResearchPaper({
          studentName: req.body.studentName,
          studentId: req.body.studentId,
          email: req.body.email,
          department: req.body.department,
          universityName: req.body.universityName,
          paperTitle: req.body.paperTitle,
          abstract: req.body.abstract,
          keywords: req.body.keywords,
          paperFile: uploadStream.id, // Use the id from the upload stream
        });
        const savedPaper = await newPaper.save();
        res.status(201).json({ message: 'Paper submitted successfully', submissionId: savedPaper._id });
      } catch (error) {
        console.error('Error saving paper:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
      }
    });
  } catch (error) {
    console.error('Error in /submit:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// GET /submit/paper/:id (download/view PDF from GridFS)
router.get('/paper/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'papers' });
    let fileId;
    try {
      fileId = new ObjectId(req.params.id);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }
    const files = await db.collection('papers.files').find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.set('Content-Type', files[0].contentType || 'application/pdf');
    bucket.openDownloadStream(fileId).pipe(res);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;
