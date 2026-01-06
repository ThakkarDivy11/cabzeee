import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, closeSidebar, user }) => {
    const location = useLocation();

    const riderLinks = [
        { name: 'Dashboard', path: '/rider', icon: 'home' },
        { name: 'Book a Ride', path: '/ride-request', icon: 'map' },
        { name: 'My Trips', path: '/ride-history', icon: 'clock' },
        { name: 'Payment Methods', path: '/payment-methods', icon: 'credit-card' },
        { name: 'Profile', path: '/user-profile', icon: 'user' },
    ];

    const driverLinks = [
        { name: 'Dashboard', path: '/driver', icon: 'home' },
        { name: 'Incoming Requests', path: '/incoming-ride-request', icon: 'bell' },
        { name: 'My Trips', path: '/driver-ride-history', icon: 'clock' },
        { name: 'Earnings', path: '/driver-earnings', icon: 'currency-rupee' },
        { name: 'Vehicle Details', path: '/vehicle-details', icon: 'truck' },
        { name: 'Documents', path: '/driver-documents', icon: 'document' },
        { name: 'Profile', path: '/driver-profile', icon: 'user' },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/admin', icon: 'home' },
        { name: 'All Users', path: '/admin/users', icon: 'users' },
        { name: 'Driver Verification', path: '/admin/verification', icon: 'shield' },
    ];

    const links = user?.role === 'driver' ? driverLinks : user?.role === 'admin' ? adminLinks : riderLinks;

    const getIcon = (name) => {
        switch (name) {
            case 'home': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
            case 'map': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />;
            case 'clock': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
            case 'credit-card': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />;
            case 'user': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
            case 'bell': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />;
            case 'currency-rupee': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />;
            case 'truck': return (
                <>
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </>
            );
            case 'users': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />;
            case 'document': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
            case 'shield': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;
            default: return null;
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar component */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-black text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-16 border-b border-gray-800">
                    <h1 className="text-2xl font-bold tracking-wider">CabZee</h1>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    {links.map((link) => (
                        <div key={link.path} className={(link.name !== 'Dashboard' && link.name !== 'Profile' && link.name !== 'Payment Methods' && link.name !== 'Earnings') ? 'opacity-50 cursor-not-allowed' : ''}>
                            <NavLink
                                to={(link.name === 'Dashboard' || link.name === 'Profile' || link.name === 'Payment Methods' || link.name === 'Earnings') ? link.path : '#'}
                                onClick={(e) => {
                                    if (link.name !== 'Dashboard' && link.name !== 'Profile' && link.name !== 'Payment Methods' && link.name !== 'Earnings') {
                                        e.preventDefault();
                                        return;
                                    }
                                    if (window.innerWidth < 1024) closeSidebar();
                                }}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive && (link.name === 'Dashboard' || link.name === 'Profile' || link.name === 'Payment Methods' || link.name === 'Earnings')
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                            >
                                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {getIcon(link.icon)}
                                </svg>
                                {link.name} {(link.name !== 'Dashboard' && link.name !== 'Profile' && link.name !== 'Payment Methods' && link.name !== 'Earnings') && <span className="ml-2 text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">Soon</span>}
                            </NavLink>
                        </div>
                    ))}
                </nav>

                {/* User Info at Bottom */}
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-bold">{user?.name?.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
