import React from 'react';
import LockClosedIcon from './icons/LockClosedIcon';

const PermissionDenied: React.FC = () => {
    return (
        <div className="flex-grow flex flex-col justify-center items-center text-muted-foreground p-6">
            <LockClosedIcon className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-semibold text-foreground">Permission Denied</h2>
            <p className="mt-2 text-center">You do not have the necessary permissions to access this page.</p>
        </div>
    );
};

export default PermissionDenied;