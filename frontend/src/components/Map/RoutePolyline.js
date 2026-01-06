import React from 'react';
import { Polyline } from 'react-leaflet';

const RoutePolyline = ({ positions, color = 'blue' }) => {
    if (!positions || positions.length < 2) return null;

    return (
        <Polyline
            positions={positions}
            color={color}
            weight={5}
            opacity={0.7}
            dashArray="10, 10"
            animate={true}
        />
    );
};

export default RoutePolyline;
