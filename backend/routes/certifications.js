const express = require('express');
const Certification = require('../models/Certification');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: compute status dynamically
const computeStatus = (cert) => {
  const obj = cert.toJSON ? cert.toJSON() : { ...cert };
  obj.status = new Date(obj.expiryDate) < new Date() ? 'expired' : 'active';
  return obj;
};

// GET /api/certifications
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'user') {
      // Regular users can only see their own certifications
      filter.userId = req.user.id;
    } else if (req.query.userId) {
      // Admin can filter by userId
      filter.userId = req.query.userId;
    }

    const certifications = await Certification.find(filter).sort({ createdAt: -1 });

    // Compute status dynamically for each certification
    const result = certifications.map((cert) => computeStatus(cert));

    res.status(200).json({ certifications: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/certifications
router.post('/', auth, async (req, res) => {
  try {
    const { certName, issuer, issueDate, expiryDate, certUrl, userId } = req.body;

    const certification = await Certification.create({
      certName,
      issuer,
      issueDate,
      expiryDate,
      certUrl: certUrl || '',
      userId: userId || req.user.id,
    });

    res.status(201).json({ certification: computeStatus(certification) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/certifications/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    // Regular users can only update their own certifications
    if (
      req.user.role !== 'admin' &&
      certification.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { certName, issuer, issueDate, expiryDate, certUrl } = req.body;

    if (certName !== undefined) certification.certName = certName;
    if (issuer !== undefined) certification.issuer = issuer;
    if (issueDate !== undefined) certification.issueDate = issueDate;
    if (expiryDate !== undefined) certification.expiryDate = expiryDate;
    if (certUrl !== undefined) certification.certUrl = certUrl;

    await certification.save(); // pre-save hook recalculates status

    res.status(200).json({ certification: computeStatus(certification) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/certifications/:id — Admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    await Certification.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Certification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
