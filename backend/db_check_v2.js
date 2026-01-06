const mongoose = require('mongoose');
require('dotenv').config();

const RideSchema = new mongoose.Schema({}, { strict: false });
const UserSchema = new mongoose.Schema({}, { strict: false });

async function checkAll() {
    const uris = ['mongodb://localhost:27017/uber-clone', 'mongodb://localhost:27017/uber'];

    for (const uri of uris) {
        console.log(`\n--- Checking: ${uri} ---`);
        const conn = await mongoose.createConnection(uri).asPromise();
        console.log('Connected');

        const Ride = conn.model('Ride', RideSchema);
        const User = conn.model('User', UserSchema);

        const rides = await Ride.find({});
        console.log(`Total Rides: ${rides.length}`);
        rides.forEach(r => console.log(`  - Ride ${r._id}: Status=${r.status}, RiderID=${r.rider}`));

        const drivers = await User.find({ role: 'driver' });
        console.log(`Drivers: ${drivers.length}`);
        drivers.forEach(d => console.log(`  - Driver ${d.name}: Status=${d.driverStatus}, Type=${d.vehicleInfo?.vehicleType}`));

        await conn.close();
    }
    process.exit(0);
}

checkAll().catch(console.error);
