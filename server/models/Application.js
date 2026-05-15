const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: String, required: true },
  candidateName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: String, required: true },
  skills: { type: [String], required: true },
  resumeUrl: { type: String },
  pitch: { type: String, required: true },
  status: { type: String, enum: ['applied', 'reviewing', 'shortlisted', 'rejected'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);
