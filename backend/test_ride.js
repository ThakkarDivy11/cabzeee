const axios = require('axios');

async function testRideCreation() {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'modipriyanshi013@gmail.com',
            password: 'password123', // Assuming this is the password
            role: 'rider'
        });

        const token = loginRes.data.data.token;
        console.log('Logged in as rider');

        const rideData = {
            pickupLocation: {
                address: 'Test Pickup',
                coordinates: [72.5714, 23.0225]
            },
            dropLocation: {
                address: 'Test Drop',
                coordinates: [72.5850, 23.0333]
            },
            fare: 150,
            distance: 5,
            estimatedTime: 15,
            vehicleType: 'car',
            paymentMethod: 'cash'
        };

        const rideRes = await axios.post('http://localhost:5000/api/rides', rideData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Ride Creation Result:', rideRes.data);
    } catch (err) {
        console.error('Ride Creation Failed:', err.response?.data || err.message);
    }
}

testRideCreation();
