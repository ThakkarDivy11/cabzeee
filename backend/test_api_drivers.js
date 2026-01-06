const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        // 1. Create a temp rider
        const email = `test_rider_${Date.now()}@test.com`;
        const password = 'password123';
        console.log(`Creating user: ${email}`);

        try {
            await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Rider',
                email,
                password,
                phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                role: 'rider'
            });
        } catch (e) {
            console.log('Registration error (might be okay if duplicate):', e.response?.data || e.message);
        }

        // 1.5 Verify user in DB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber-clone');
        await User.updateOne({ email }, { $set: { isVerified: true } });
        await mongoose.disconnect();

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        const token = loginRes.data.token;
        console.log('Got token.');

        // 3. Fetch drivers
        console.log('Fetching drivers...');
        const driversRes = await axios.get(`${API_URL}/users/drivers`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Drivers Response:', JSON.stringify(driversRes.data, null, 2));

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
};

runTest();
