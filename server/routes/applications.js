const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// Submit an application
router.post('/', async (req, res) => {
  const { jobId, candidateId, candidateName, email, phone, qualification, experience, skills, resumeUrl, pitch } = req.body;
  const app = new Application({
    jobId,
    candidateId,
    candidateName,
    email,
    phone,
    qualification,
    experience,
    skills,
    resumeUrl,
    pitch
  });

  try {
    const newApp = await app.save();
    res.status(201).json(newApp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get applications by candidate
router.get('/candidate/:candidateId', async (req, res) => {
  try {
    const apps = await Application.find({ candidateId: req.params.candidateId })
      .populate('jobId')
      .sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get applications for a specific job
router.get('/job/:jobId', async (req, res) => {
  try {
    const apps = await Application.find({ jobId: req.params.jobId }).sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const nodemailer = require('nodemailer');

// Configure nodemailer for REAL email delivery via Gmail
// You must set EMAIL_USER and EMAIL_PASS in your server/.env file
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com', 
      pass: process.env.EMAIL_PASS || 'your-16-digit-app-password' 
  }
});

const User = require('../models/User');

// Update application status
router.put('/:id/status', async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate('jobId');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    
    app.status = req.body.status;
    const updatedApp = await app.save();

    // Send email notification
    if (app.status === 'shortlisted' || app.status === 'rejected') {
      const subject = app.status === 'shortlisted' ? 'Congratulations! You have been Shortlisted' : 'Update on your Application';
      const text = app.status === 'shortlisted' 
        ? `Dear ${app.candidateName},\n\nWe are pleased to inform you that you have been shortlisted for the position of ${app.jobId?.title || 'the applied role'}.\nWe will be in touch shortly with further details.\n\nBest regards,\nEmployer`
        : `Dear ${app.candidateName},\n\nThank you for applying for the position of ${app.jobId?.title || 'the applied role'}. Unfortunately, we have decided not to proceed with your application at this time.\nWe wish you the best in your future endeavors.\n\nBest regards,\nEmployer`;
      
      try {
        if (transporter) {
          // Fetch employer email for Reply-To
          let employerEmail = undefined;
          if (app.jobId && app.jobId.employerId) {
            const employer = await User.findById(app.jobId.employerId);
            if (employer) employerEmail = employer.email;
          }

          const info = await transporter.sendMail({
            from: `"NexHire Platform" <${process.env.EMAIL_USER}>`,
            replyTo: employerEmail || process.env.EMAIL_USER,
            to: app.email,
            subject: subject,
            text: text
          });
          console.log(`Status email sent to ${app.email}`);
        } else {
          console.log('Email transporter not ready, skipping email.');
        }
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
        // Continue even if email fails
      }
    }

    res.json(updatedApp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
