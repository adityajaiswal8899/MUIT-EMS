const express = require('express');
const router = express.Router();
const {
  generateCertificate,
  batchGenerateCertificates,
  getMyCertificates,
  verifyCertificate
} = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('organizer', 'admin'), generateCertificate);
router.post('/batch/:eventId', protect, authorize('organizer', 'admin'), batchGenerateCertificates);
router.get('/my', protect, getMyCertificates);
router.get('/verify/:certificateId', verifyCertificate);

module.exports = router;
