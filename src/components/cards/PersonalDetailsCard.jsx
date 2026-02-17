import React from 'react';
import useAuth from '../../hooks/useAuth';

export default function PersonalDetailsCard() {
    const { auth } = useAuth();
    
    if (!auth) {
        return (
            <div className='p-4 bg-neutral-50 rounded-lg w-full'>
                <h3 className='font-medium mb-2'>Personal Information</h3>
                <p className='text-sm text-red-600'>You need to be logged in to view your details</p>
            </div>
        );
    }
    
    return (
        <div className='p-4 bg-neutral-50 rounded-lg w-full'>
            <div className="space-y-3 sm:p-8">
                <p><span className="font-medium">Name:</span> {auth?.lastname} {auth?.firstname}</p>
                <p><span className="font-medium">Email:</span> {auth?.email}</p>
            </div>
        </div>
    );
} 