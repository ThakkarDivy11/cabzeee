import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar, user, title }) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b h-16 fixed top-0 left-0 right-0 z-30 lg:pl-64 transition-all duration-300">
            <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <div className="flex items-center">
                    {/* Mobile menu button */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black mr-4"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <h1 className="text-xl font-bold text-gray-900 hidden sm:block">{title || 'Uber Clone'}</h1>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-3 focus:outline-none"
                        >
                            <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
                            <div className="h-9 w-9 bg-black rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </button>

                        {dropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10 cursor-default"
                                    onClick={() => setDropdownOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
