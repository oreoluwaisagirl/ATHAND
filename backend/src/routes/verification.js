import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Worker from '../models/Worker.js';
import Notification from '../models/Notification.js';
import { upload, setUploadType } from '../utils/upload.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Upload verification documents
router.post('/documents', authenticate, upload.fields([
  { name: 'ninImage', maxCount: 1 },
  { name: 'idImage', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), async (req, res, next) => {
  try {
    // Find or create worker profile
    let worker = await Worker.findOne({ userId: req.user._id });
    
    if (!worker) {
      worker = await Worker.create({ userId: req.user._id });
    }

    const files = req.files;
    
    // Store document URLs
    if (files.ninImage) {
      worker.ninImageUrl = `/uploads/nin/${files.ninImage[0].filename}`;
    }
    if (files.idImage) {
      worker.idImageUrl = `/uploads/id/${files.idImage[0].filename}`;
    }
    if (files.selfie) {
      worker.selfieUrl = `/uploads/selfie/${files.selfie[0].filename}`;
    }

    worker.verificationStatus = 'pending';
    await worker.save();

    // Notify admin
    await Notification.create({
      userId: req.user._id, // Will be overridden by admin notification system
      type: 'verification',
      title: 'Verification Documents Submitted',
      message: `Worker ${req.user.fullName} has submitted verification documents`,
      data: { workerId: worker._id }
    });

    res.json({
      success: true,
      message: 'Documents uploaded successfully. Verification pending.',
      worker
    });
  } catch (error) {
    next(error);
  }
});

// Submit NIN number for verification
router.post('/nin', authenticate, async (req, res, next) => {
  try {
    const { ninNumber, firstName, lastName, dob } = req.body;

    let worker = await Worker.findOne({ userId: req.user._id });
    
    if (!worker) {
      worker = await Worker.create({ userId: req.user._id });
    }

    // Store NIN details
    worker.ninNumber = ninNumber;
    worker.ninFirstName = firstName;
    worker.ninLastName = lastName;
    worker.ninDob = dob;
    worker.verificationStatus = 'pending';
    
    await worker.save();

    // Trigger NIN verification (KYC API)
    const verificationResult = await verifyNIN(ninNumber, firstName, lastName, dob);

    if (verificationResult.success) {
      worker.ninVerified = true;
      worker.verificationStatus = 'verified';
      worker.badges.push('NIN Verified');
      await worker.save();

      // Notify worker
      await Notification.create({
        userId: req.user._id,
        type: 'verification',
        title: 'NIN Verification Successful',
        message: 'Your NIN has been verified successfully!'
      });
    } else {
      worker.ninVerified = false;
      worker.verificationStatus = 'rejected';
      worker.rejectionReason = verificationResult.message;
      await worker.save();

      await Notification.create({
        userId: req.user._id,
        type: 'verification',
        title: 'NIN Verification Failed',
        message: verificationResult.message || 'NIN verification failed. Please check your details.'
      });
    }

    res.json({
      success: true,
      verified: verificationResult.success,
      message: verificationResult.message,
      worker
    });
  } catch (error) {
    next(error);
  }
});

// Submit government ID for verification  
router.post('/id', authenticate, upload.single('idImage'), async (req, res, next) => {
  try {
    const { idType, idNumber } = req.body;

    let worker = await Worker.findOne({ userId: req.user._id });
    
    if (!worker) {
      worker = await Worker.create({ userId: req.user._id });
    }

    if (req.file) {
      worker.idImageUrl = `/uploads/id/${req.file.filename}`;
    }
    
    worker.idType = idType;
    worker.idNumber = idNumber;
    worker.verificationStatus = 'pending';
    await worker.save();

    // Trigger ID verification (KYC API)
    const verificationResult = await verifyGovernmentID(idType, idNumber);

    if (verificationResult.success) {
      worker.idVerified = true;
      worker.badges.push(`${idType} Verified`);
      await worker.save();
    }

    res.json({
      success: true,
      message: 'ID verification submitted',
      worker
    });
  } catch (error) {
    next(error);
  }
});

// Submit selfie for face match
router.post('/face-match', authenticate, upload.single('selfie'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Selfie image is required', 400);
    }

    let worker = await Worker.findOne({ userId: req.user._id });
    
    if (!worker) {
      worker = await Worker.create({ userId: req.user._id });
    }

    worker.selfieUrl = `/uploads/selfie/${req.file.filename}`;
    worker.verificationStatus = 'pending';
    await worker.save();

    // If we have NIN data, perform face match
    if (worker.ninVerified && worker.ninImageUrl) {
      const faceMatchResult = await verifyFaceMatch(worker.selfieUrl, worker.ninImageUrl);
      
      if (faceMatchResult.success) {
        worker.faceMatchVerified = true;
        worker.badges.push('Face Verified');
        await worker.save();
      }
    }

    res.json({
      success: true,
      message: 'Face verification submitted',
      worker
    });
  } catch (error) {
    next(error);
  }
});

// Get verification status
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    
    if (!worker) {
      return res.json({
        verificationStatus: 'not_started',
        badges: []
      });
    }

    res.json({
      verificationStatus: worker.verificationStatus,
      ninVerified: worker.ninVerified,
      idVerified: worker.idVerified,
      faceMatchVerified: worker.faceMatchVerified,
      backgroundCheckPassed: worker.backgroundCheckPassed,
      badges: worker.badges,
      rejectionReason: worker.rejectionReason,
      submittedAt: worker.ninNumber ? worker.updatedAt : null
    });
  } catch (error) {
    next(error);
  }
});

// KYC Service Functions (Placeholder for actual KYC API integration)
// In production, integrate with YouVerify, IdentityPass, or Smile Identity
async function verifyNIN(ninNumber, firstName, lastName, dob) {
  // Placeholder: Replace with actual KYC API call
  // Example with YouVerify:
  /*
  const response = await fetch('https://api.youverify.com.ng/v1/verification/nin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.YOUVERIFY_API_KEY}`
    },
    body: JSON.stringify({
      nin: ninNumber,
      firstname: firstName,
      lastname: lastName,
      dob: dob
    })
  });
  return response.json();
  */
  
  // Mock response for development
  console.log(`Verifying NIN: ${ninNumber} for ${firstName} ${lastName}`);
  return {
    success: true,
    message: 'NIN verified successfully'
  };
}

async function verifyGovernmentID(idType, idNumber) {
  // Placeholder for ID verification API
  console.log(`Verifying ${idType}: ${idNumber}`);
  return {
    success: true,
    message: `${idType} verified successfully`
  };
}

async function verifyFaceMatch(selfieUrl, idImageUrl) {
  // Placeholder for face match API
  console.log(`Verifying face match`);
  return {
    success: true,
    message: 'Face match verified'
  };
}

export default router;
