import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AdminDashboard from './layout';
import useAxiosPrivate from '../api/useAxiosPrivate';

/**
 * KYC Verification Management Component for Admins
 * Allows administrators to review and approve/reject KYC submissions
 */
const KycVerification = () => {
  const [activeTab, setActiveTab] = useState('sellers');
  const { auth } = useAuth();
  const navigate = useNavigate();
  
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    fetchKycRecords();
  }, [filterStatus]);

  const fetchKycRecords = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get(`/api/kyc?status=${filterStatus}`);
      
      if (response.status === 200) {
        setKycRecords(response.data);
      } else if (response.status === 403) {
        toast.error('You do not have permission to access KYC records');
        navigate('/dashboard');
      } else {
        toast.error(response.data.message || 'Failed to fetch KYC records');
      }
    } catch (error) {
      console.error('Error fetching KYC records:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to fetch KYC records');
      } else if (error.request) {
        toast.error('No response from server. Please try again later.');
      } else {
        toast.error('Error setting up request. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (kyc) => {
    setSelectedKyc(kyc);
    setReviewNotes('');
    setIsReviewing(true);
  };

  const closeReviewModal = () => {
    setSelectedKyc(null);
    setReviewNotes('');
    setIsReviewing(false);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedKyc) return;
    
    setUpdatingStatus(true);
    try {
      const response = await axiosPrivate.put(`/api/kyc/${selectedKyc.id}/status`, {
        status: newStatus,
        notes: reviewNotes,
        adminId: auth.id
      });
      
      if (response.status === 200) {
        toast.success(`KYC verification ${newStatus === 'verified' ? 'approved' : 'rejected'} successfully`);
        closeReviewModal();
        fetchKycRecords();
      } else if (response.status === 403) {
        toast.error('You do not have permission to update KYC status');
      } else {
        toast.error(response.data.message || 'Failed to update KYC status');
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to update KYC status');
      } else if (error.request) {
        toast.error('No response from server. Please try again later.');
      } else {
        toast.error('Error setting up request. Please try again later.');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">KYC Verification Management</h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilterStatus('pending')} 
              className={`px-4 py-2 rounded-md ${filterStatus === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilterStatus('verified')} 
              className={`px-4 py-2 rounded-md ${filterStatus === 'verified' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Verified
            </button>
            <button 
              onClick={() => setFilterStatus('rejected')} 
              className={`px-4 py-2 rounded-md ${filterStatus === 'rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Rejected
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : kycRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-lg text-gray-600">No KYC records found with status: {filterStatus}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KRA PIN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kycRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.kraPin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.registrationDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openReviewModal(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KYC Review Modal */}
      {isReviewing && selectedKyc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Review KYC Submission</h2>
                <button
                  onClick={closeReviewModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Full Name:</span> {selectedKyc.fullName}</p>
                    <p><span className="font-medium">KRA PIN:</span> {selectedKyc.kraPin}</p>
                    <p><span className="font-medium">Registration Date:</span> {selectedKyc.registrationDate}</p>
                    <p><span className="font-medium">Permit Number:</span> {selectedKyc.permitNumber}</p>
                    <p><span className="font-medium">Address:</span> {selectedKyc.address}</p>
                    <p><span className="font-medium">Status:</span> {renderStatusBadge(selectedKyc.status)}</p>
                    <p><span className="font-medium">Submitted:</span> {new Date(selectedKyc.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">ID Document</h3>
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <img 
                      src={selectedKyc.idDocumentUrl} 
                      title={selectedKyc.fullName || 'ID Document'}
                      alt="ID Document" 
                      className="w-full h-auto object-contain max-h-48"
                    />
                  </div>

                  <h3 className="font-medium text-gray-700 mb-2">Selfie</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={selectedKyc.selfieUrl} 
                      title={selectedKyc.fullName || 'Selfie'}
                      alt="Selfie" 
                      className="w-full h-auto object-contain max-h-48"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Review Notes
                </label>
                <textarea
                  id="notes"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your review notes here..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
                >
                  {updatingStatus ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleUpdateStatus('verified')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  {updatingStatus ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminDashboard>
  );
};

export default KycVerification; 