import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (!this.socket || !this.socket.connected) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket connected:', this.socket.id);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ Socket disconnected:', reason);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('Socket disconnected manually');
        }
    }

    joinRide(rideId) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('join-ride', rideId);
            console.log(`🚗 Joined ride room: ${rideId}`);
        }
    }

    leaveRide(rideId) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('leave-ride', rideId);
            console.log(`🚪 Left ride room: ${rideId}`);
        }
    }

    updateDriverLocation(rideId, latitude, longitude) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('driver-location-update', { rideId, latitude, longitude });
            console.log(`📍 Location updated for ride ${rideId}`);
        }
    }

    onLocationUpdate(callback) {
        if (this.socket) {
            this.socket.on('location-updated', callback);
        }
    }

    onStatusUpdate(callback) {
        if (this.socket) {
            this.socket.on('status-updated', callback);
        }
    }

    onOTPVerified(callback) {
        if (this.socket) {
            this.socket.on('otp-verification-success', callback);
        }
    }

    notifyRideStatusChange(rideId, status) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('ride-status-changed', { rideId, status });
        }
    }

    notifyOTPVerified(rideId) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('otp-verified', { rideId });
        }
    }

    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }

    isConnected() {
        return this.socket && this.socket.connected;
    }
}

const socketService = new SocketService();
export default socketService;
