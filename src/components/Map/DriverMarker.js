import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Car icon for driver
const carIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png', // Using black marker to represent car/driver
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const DriverMarker = ({ position, driverName, vehicleInfo }) => {
    if (!position) return null;

    return (
        <Marker position={position} icon={carIcon}>
            <Popup>
                <div className="text-sm">
                    <p className="font-bold">{driverName}</p>
                    <p>{vehicleInfo?.brand} {vehicleInfo?.model}</p>
                    <p className="text-gray-500">{vehicleInfo?.licensePlate}</p>
                </div>
            </Popup>
        </Marker>
    );
};

export default DriverMarker;
