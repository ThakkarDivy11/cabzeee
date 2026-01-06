const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Ride = require('./models/Ride');

async function checkStatus() {
    try {
        const uris = ['mongodb://localhost:27017/uber-clone', 'mongodb://localhost:27017/uber'];

        for (const uri of uris) {
            console.log(`\nChecking database at: ${uri}`);
            try {
                await mongoose.connect(uri);
                console.log('Connected');

                const allRides = await Ride.find({}).populate('rider', 'name');
                console.log(`ALL RIDES in ${uri.split('/').pop()}: ${allRides.length}`);
                allRides.forEach(r => {
                    console.log(`  - Ride ${r._id}: Rider=${r.rider?.name || 'Unknown'}, Status=${r.status}`);
                });

                await mongoose.disconnect();
            } catch (err) {
                console.error(`Failed to connect to ${uri}:`, err.message);
            }
        }

        const drivers = await User.find({ role: 'driver' });
        console.log(`\n--- DRIVERS: ${drivers.length} ---`);
        drivers.forEach(d => {
            console.log(`Driver: ${d.name} (${d.email})`);
            console.log(`  Status: ${d.driverStatus}`);
            console.log(`  Vehicle Info: ${JSON.stringify(d.vehicleInfo)}`);
            console.log(`  Verified: ${d.isVerified}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkStatus();
