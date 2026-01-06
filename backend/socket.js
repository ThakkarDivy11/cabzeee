const socketIO = require('socket.io');
const Ride = require('./models/Ride');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('✅ New socket connection:', socket.id);

        // Join a ride room to receive updates
        socket.on('join-ride', (rideId) => {
            socket.join(`ride-${rideId}`);
            console.log(`🚗 Socket ${socket.id} joined ride room: ride-${rideId}`);
        });

        // Leave a ride room
        socket.on('leave-ride', (rideId) => {
            socket.leave(`ride-${rideId}`);
            console.log(`🚪 Socket ${socket.id} left ride room: ride-${rideId}`);
        });

        // Driver sends location update
        socket.on('driver-location-update', async (data) => {
            const { rideId, latitude, longitude } = data;

            try {
                const ride = await Ride.findById(rideId);
                if (ride) {
                    // Update current location
                    ride.currentDriverLocation = {
                        latitude,
                        longitude,
                        timestamp: new Date()
                    };

                    // Add to location history
                    ride.locationHistory.push({
                        latitude,
                        longitude,
                        timestamp: new Date()
                    });

                    await ride.save();

                    // Broadcast to all clients in the ride room
                    io.to(`ride-${rideId}`).emit('location-updated', {
                        latitude,
                        longitude,
                        timestamp: new Date()
                    });

                    console.log(`📍 Location updated for ride ${rideId}: [${latitude}, ${longitude}]`);
                }
            } catch (error) {
                console.error('Error updating driver location:', error);
            }
        });

        // Ride status changed
        socket.on('ride-status-changed', (data) => {
            const { rideId, status } = data;
            io.to(`ride-${rideId}`).emit('status-updated', { status });
            console.log(`📢 Ride ${rideId} status changed to: ${status}`);
        });

        // OTP verified
        socket.on('otp-verified', (data) => {
            const { rideId } = data;
            io.to(`ride-${rideId}`).emit('otp-verification-success', data);
            console.log(`✅ OTP verified for ride ${rideId}`);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initializeSocket, getIO };
