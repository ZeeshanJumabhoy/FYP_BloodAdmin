import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/BloodRequest.css'; // Import your CSS file for styling
import {
    getInteresteddonordata,
    getUserDetails,
    updateUserByBloodBank,
    updateBloodRequestStatusHelper,
    updateMasterBloodDonationHelper
} from '../Helper/helper';

// Icons as SVG components for better performance
const DownArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const UpArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BloodRequestDonor = () => {
    const [requestData, setRequestData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDonor, setCurrentDonor] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        cnic: '',
        phoneNumber: '',
        email: '',
        bloodGroup: '',
    });
    const [statusValue, setStatusValue] = useState('Under Screening');

    // Fetch all blood request data on component mount
    useEffect(() => {
        fetchRequestData();
    }, []);

    const fetchRequestData = async () => {
        try {
            setLoading(true);
            const response = await getInteresteddonordata();
            setRequestData(response.data.data || []);
        } catch (error) {
            toast.error(error.error || 'Failed to fetch blood request data');
            console.error('Error fetching blood request data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (requestId) => {
        setExpandedRows(prev => ({
            ...prev,
            [requestId]: !prev[requestId]
        }));
    };

    const handleVerifyDetails = async (requestId, donorEmail) => {
        try {
            setLoading(true);
            const donorData = await getUserDetails({ email: donorEmail });

            if (donorData.error) {
                throw new Error(donorData.error);
            }

            setCurrentDonor(donorData);
            setSelectedRequestId(requestId);
            setFormData({
                firstName: donorData.firstName || '',
                lastName: donorData.lastName || '',
                age: donorData.age || '',
                cnic: donorData.cnic || '',
                phoneNumber: donorData.phoneNumber || '',
                email: donorData.email || '',
                bloodGroup: donorData.bloodGroup || '',
            });
            setIsModalOpen(true);
        } catch (error) {
            toast.error('Failed to fetch donor details');
            console.error('Error fetching donor details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleUpdateDetails = async () => {
        try {
            setLoading(true);

            // Prepare update data
            const updateData = {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                age: formData.age,
                newCnic: formData.cnic !== currentDonor.cnic ? formData.cnic : undefined,
                newPhoneNumber: formData.phoneNumber !== currentDonor.phoneNumber ? formData.phoneNumber : undefined
            };

            // Filter out undefined fields
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            const response = await updateUserByBloodBank(updateData);

            if (response.data) {
                toast.success('Donor details updated successfully');
                fetchRequestData(); // Refresh data
                setIsModalOpen(false);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update donor details');
            console.error('Error updating donor details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedRequestId || !currentDonor?.email || !statusValue) {
            toast.error('Missing required information');
            return;
        }

        try {
            setLoading(true);

            const updateData = {
                requestId: selectedRequestId,
                donorEmail: currentDonor.email,
                status: statusValue
            };

            const masterData = {
                email: currentDonor.email
            }

            const response = await updateBloodRequestStatusHelper(updateData);
            const response2 = await updateMasterBloodDonationHelper(masterData);

            if (response && response2) {
                toast.success(`Status updated to ${statusValue} successfully`);
                fetchRequestData(); // Refresh data
                setIsModalOpen(false);
            }
        } catch (error) {
            toast.error(error.error || 'Failed to update donor status');
            console.error('Error updating donor status:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderUrgencyBadge = (urgency) => {
        const className = `urgency-badge ${urgency.toLowerCase()}`;
        return <span className={className}>{urgency}</span>;
    };

    return (
        <div className="blood-request-container">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <header className="dashboard-header">
                <h1>Blood Requests Management</h1>
                <p>Track and manage incoming blood requests and interested donors</p>
            </header>

            <div className="filter-container">
                <button className="refresh-btn" onClick={fetchRequestData} disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15"
                            stroke="#4B5563"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round" />
                    </svg>
                    Refresh Data
                </button>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading data...</p>
                </div>
            )}

            {!loading && requestData.length === 0 && (
                <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h3>No Blood Requests</h3>
                    <p>There are currently no blood requests in the system.</p>
                </div>
            )}

            {!loading && requestData.length > 0 && (
                <div className="blood-request-table-container" >
                    <table className="blood-request-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Email</th>
                                <th>Blood Group</th>
                                <th>Hospital</th>
                                <th>Department</th>
                                <th>Patient ID</th>
                                <th>Urgency</th>
                                <th>Required Units</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requestData.map((request) => (
                                <React.Fragment key={request.requestId}>
                                    <tr className="main-row">
                                        <td>{request.requestId}</td>
                                        <td>{request.requestedUser.email}</td>
                                        <td className="blood-group-cell">{request.requestedUser.bloodGroup}</td>
                                        <td>{request.requestedUser.hospital?.hospitalname || 'N/A'}</td>
                                        <td>{request.requestedUser.hospital?.department || 'N/A'}</td>
                                        <td>{request.requestedUser.hospital?.patientId || 'N/A'}</td>
                                        <td>{renderUrgencyBadge(request.requestedUser.urgency)}</td>
                                        <td>{request.requestedUser.totalRequiredUnits}</td>
                                        <td className="actions-cell">
                                            <button
                                                className="toggle-btn"
                                                onClick={() => toggleRow(request.requestId)}
                                                aria-label="Toggle interested donors"
                                            >
                                                {expandedRows[request.requestId] ? <UpArrowIcon /> : <DownArrowIcon />}
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedRows[request.requestId] && (
                                        <tr className="expanded-row">
                                            <td colSpan="9">
                                                <div className="interested-donors-container">
                                                    <h4>Interested Donors</h4>
                                                    {request.interestedDonors.length === 0 ? (
                                                        <p className="no-donors-message">No interested donors available for this request.</p>
                                                    ) : (
                                                        <div className="donors-list">
                                                            {request.interestedDonors.map((donor, index) => (
                                                                <div className="donor-item" key={index}>
                                                                    <span className="donor-email">{donor.donorEmail}</span>
                                                                    <button
                                                                        className="verify-btn"
                                                                        onClick={() => handleVerifyDetails(request.requestId, donor.donorEmail)}
                                                                        disabled={loading}
                                                                    >
                                                                        Verify Details
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Donor Details Modal with pure white background for all elements */}
            {isModalOpen && currentDonor && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header" bis_skin_checked="1" style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px", paddingBottom: "20px" }}>
                            <h2>Donor Details</h2>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        <div className="modal-body" bis_skin_checked="1" style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px", paddingBottom: "20px" }}>             <div className="donor-profile-header">
                            <div className="donor-avatar">
                                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                            </div>
                            <div className="donor-blood-group">{formData.bloodGroup}</div>
                        </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="age">Age</label>
                                    <input
                                        type="text"
                                        id="age"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Phone Number</label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cnic">CNIC</label>
                                    <input
                                        type="text"
                                        id="cnic"
                                        name="cnic"
                                        value={formData.cnic}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row status-section">
                                <div className="form-group status-dropdown">
                                    <label htmlFor="status">Update Status</label>
                                    <select
                                        id="status"
                                        value={statusValue}
                                        onChange={(e) => setStatusValue(e.target.value)}
                                    >
                                        <option value="Under Screening">Under Screening</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="update-details-btn"
                                    onClick={handleUpdateDetails}
                                    disabled={loading}
                                >
                                    Update Details
                                </button>
                                <button
                                    className="update-status-btn"
                                    onClick={handleUpdateStatus}
                                    disabled={loading}
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>


                    </div>
                </div>
            )}
        </div>
    );
};

export default BloodRequestDonor;
