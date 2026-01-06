const express = require('express');
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

router.post('/', [
  body('pickupLocation.address').exists().withMessage('Pickup address is required'),
  body('dropLocation.address').exists().withMessage('Drop address is required'),
  body('fare').isNumeric().withMessage('Fare must be a number')
], protect, validateRequest, async (req, res) => {
  console.log(`🚀 RIDE CREATION ATTEMPTED by ${req.user.name} (${req.user.role})`);
  console.log('Ride Data:', JSON.stringify(req.body, null, 2));
  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({
        success: false,
        message: 'Only riders can create ride requests'
      });
    }

    const ride = new Ride({
      rider: req.user._id,
      pickupLocation: req.body.pickupLocation,
      dropLocation: req.body.dropLocation,
      fare: req.body.fare,
      distance: req.body.distance || 0,
      estimatedTime: req.body.estimatedTime || 0,
      vehicleType: req.body.vehicleType || 'car',
      paymentMethod: req.body.paymentMethod || 'cash',
      specialInstructions: req.body.specialInstructions || '',
      status: 'pending'
    });

    await ride.save();
    console.log(`✅ RIDE SAVED: ${ride._id}`);
    await ride.populate('rider', 'name email phone rating');

    res.status(201).json({
      success: true,
      message: 'Ride request created successfully',
      data: ride
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during ride creation'
    });
  }
});

router.get('/pending', protect, async (req, res) => {
  console.log(`🔍 PENDING RIDES FETCHED by ${req.user.name} (Status: ${req.user.driverStatus})`);
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can view pending rides'
      });
    }

    if (req.user.driverStatus !== 'online') {
      return res.json({
        success: true,
        message: 'Driver must be online to receive ride requests',
        data: []
      });
    }

    const query = {
      status: 'pending'
    };

    if (req.user.vehicleInfo?.vehicleType) {
      query.vehicleType = req.user.vehicleInfo.vehicleType;
    }

    const rides = await Ride.find(query)
      .populate('rider', 'name email phone rating')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: rides
    });
  } catch (error) {
    console.error('Get pending rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/:rideId/accept', protect, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can accept rides'
      });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Ride is no longer available'
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    ride.driver = req.user._id;
    ride.status = 'accepted';
    ride.acceptedAt = new Date();
    ride.pickupOTP = otp;
    ride.otpVerified = false;
    await ride.save();

    req.user.driverStatus = 'busy';
    await req.user.save();

    await ride.populate('rider', 'name email phone rating');
    await ride.populate('driver', 'name phone rating vehicleInfo');

    res.json({
      success: true,
      message: 'Ride accepted successfully',
      data: ride
    });
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/:rideId/reject', protect, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can reject rides'
      });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Ride is no longer available'
      });
    }

    ride.status = 'rejected';
    await ride.save();

    res.json({
      success: true,
      message: 'Ride rejected'
    });
  } catch (error) {
    console.error('Reject ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/:rideId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['started', 'picked-up', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    const isDriver = req.user.role === 'driver' && ride.driver?.toString() === req.user._id.toString();
    const isRider = req.user.role === 'rider' && ride.rider?.toString() === req.user._id.toString();

    if (!isDriver && !isRider) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    ride.status = status;
    if (status === 'started') ride.startedAt = new Date();
    if (status === 'picked-up') ride.pickedUpAt = new Date();
    if (status === 'completed') {
      ride.completedAt = new Date();
      if (isDriver) {
        req.user.totalRides = (req.user.totalRides || 0) + 1;
        await req.user.save();
      }
    }
    if (status === 'cancelled') {
      ride.cancelledAt = new Date();
      ride.cancelledBy = req.user.role;
      if (isDriver) {
        req.user.driverStatus = 'online';
        await req.user.save();
      }
    }

    await ride.save();
    await ride.populate('rider', 'name email phone rating');
    await ride.populate('driver', 'name phone rating vehicleInfo');

    res.json({
      success: true,
      message: 'Ride status updated',
      data: ride
    });
  } catch (error) {
    console.error('Update ride status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/my-rides', protect, async (req, res) => {
  try {
    const rides = await Ride.find({
      $or: [
        { rider: req.user._id },
        { driver: req.user._id }
      ]
    })
      .populate('rider', 'name email phone rating')
      .populate('driver', 'name phone rating vehicleInfo')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: rides
    });
  } catch (error) {
    console.error('Get my rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/driver-rides', protect, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can view driver rides'
      });
    }

    const rides = await Ride.find({
      driver: req.user._id,
      status: 'completed'
    })
      .populate('rider', 'name email phone rating')
      .sort({ completedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: rides
    });
  } catch (error) {
    console.error('Get driver rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/earnings', protect, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can view earnings'
      });
    }

    const { period = 'today' } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const rides = await Ride.find({
      driver: req.user._id,
      status: 'completed',
      completedAt: { $gte: startDate }
    });

    const earnings = {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    };

    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - 7));
    const monthStart = new Date(now.setMonth(now.getMonth() - 1));

    rides.forEach(ride => {
      earnings.total += ride.fare;
      if (ride.completedAt >= todayStart) earnings.today += ride.fare;
      if (ride.completedAt >= weekStart) earnings.week += ride.fare;
      if (ride.completedAt >= monthStart) earnings.month += ride.fare;
    });

    const recentRides = rides.slice(0, 10).map(ride => ({
      fare: ride.fare,
      date: ride.completedAt,
      rider: ride.rider?.name || 'Unknown'
    }));

    res.json({
      success: true,
      data: {
        earnings,
        recentRides
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single ride by ID
router.get('/:rideId', protect, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('rider', 'name email phone rating profilePicture')
      .populate('driver', 'name phone rating vehicleInfo profilePicture');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user is authorized to view this ride
    const isRider = ride.rider?._id.toString() === req.user._id.toString();
    const isDriver = ride.driver?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRider && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this ride'
      });
    }

    // Only show OTP to rider and driver
    const rideData = ride.toObject();
    if (!isRider && !isDriver && !isAdmin) {
      delete rideData.pickupOTP;
    }

    res.json({
      success: true,
      data: rideData
    });
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update driver location
router.put('/:rideId/location', protect, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can update location'
      });
    }

    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    ride.currentDriverLocation = {
      latitude,
      longitude,
      timestamp: new Date()
    };

    ride.locationHistory.push({
      latitude,
      longitude,
      timestamp: new Date()
    });

    await ride.save();

    res.json({
      success: true,
      message: 'Location updated',
      data: {
        latitude,
        longitude,
        timestamp: ride.currentDriverLocation.timestamp
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Verify OTP
router.post('/:rideId/verify-otp', protect, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can verify OTP'
      });
    }

    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (ride.otpVerified) {
      return res.json({
        success: true,
        message: 'OTP already verified'
      });
    }

    if (ride.pickupOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    ride.otpVerified = true;
    await ride.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: { otpVerified: true }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

