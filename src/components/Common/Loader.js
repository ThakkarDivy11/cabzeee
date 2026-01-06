import React from 'react';

const Loader = ({ fullScreen = true, size = 'medium', text = 'Loading...' }) => {
    const sizeClasses = {
        small: 'w-5 h-5 border-2',
        medium: 'w-10 h-10 border-3',
        large: 'w-16 h-16 border-4'
    };

    const loaderContent = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`${sizeClasses[size] || sizeClasses.medium} animate-spin rounded-full border-gray-200 border-t-black ease-linear`}></div>
            {text && <p className="text-gray-500 font-medium text-sm animate-pulse">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {loaderContent}
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            {loaderContent}
        </div>
    );
};

export default Loader;
