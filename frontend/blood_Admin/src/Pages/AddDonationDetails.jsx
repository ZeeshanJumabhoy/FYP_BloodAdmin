import React, { useState, useEffect } from 'react';
import { getUnderScreeningForDonationDetails, addDonationDetails, updateMasterBloodDonationHelper } from '../Helper/helper';
import toast, { Toaster } from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import '../Styles/DonationDetails.css'; // Import your CSS file for styling

const AddDonationDetails = () => {
  const [donorRecords, setDonorRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);

  // Validation schema for donation details form
  const validationSchema = Yup.object({
    donationDate: Yup.date()
      .required('Donation date is required')
      .max(new Date(), 'Donation date cannot be in the future'),
    volume: Yup.number()
      .required('Blood volume is required')
      .positive('Volume must be positive')
      .max(500, 'Volume cannot exceed 500ml'),
    donationType: Yup.string()
      .required('Donation type is required')
      .oneOf(['Whole Blood', 'Plasma', 'Platelets'], 'Invalid donation type'),
    doctorName: Yup.string()
      .required('Doctor name is required')
      .min(3, 'Doctor name must be at least 3 characters')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      donationDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      volume: '',
      donationType: '',
      doctorName: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!selectedDonor) return;

      const donationData = {
        donorId: selectedDonor.donorId, // Using custom donorId, not _id
        ...values
      };

      try {
        // Step 1: Add donation details
        const donationResponse = await addDonationDetails(donationData);
        
        // Step 2: Update master blood donation record
        if (donationResponse && donationResponse.donation) {
          await updateMasterBloodDonationHelper({
            email: selectedDonor.email,
            donorId: selectedDonor.donorId
          });
        }
        
        toast.success('Donation details added successfully!');
        setShowModal(false);
        // Refresh the donor list to remove the processed donor
        fetchDonorRecords();
      } catch (error) {
        console.error('Failed to process donation:', error);
        toast.error(`Error: ${error.error || 'Failed to add donation details'}`);
      }
    }
  });

  // Fetch donor records on component mount
  useEffect(() => {
    fetchDonorRecords();
  }, []);

  const fetchDonorRecords = async () => {
    setIsLoading(true);
    try {
      const response = await getUnderScreeningForDonationDetails();
      setDonorRecords(response.records || []);
    } catch (error) {
      console.error('Error fetching donor records:', error);
      toast.error(`Failed to load donors: ${error.error || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDonation = (donor) => {
    setSelectedDonor(donor);
    // Reset form values
    formik.resetForm();
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDonor(null);
  };

  return (
    <div className="donor-screening-container">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="page-header">
        <h1>Under Screening Donors</h1>
        <p>Manage donors who have been screened and are ready for donation</p>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading donor records...</p>
        </div>
      ) : donorRecords.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 5.33333L40 13.3333H53.3333V26.6667L61.3333 34.6667L53.3333 42.6667V56H40L32 64L24 56H10.6667V42.6667L2.66667 34.6667L10.6667 26.6667V13.3333H24L32 5.33333Z" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M32 45.3333V45.3467" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M32 37.3333V21.3333" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>No Donors Available</h2>
          <p>There are currently no donors under screening in your blood bank.</p>
        </div>
      ) : (
        <div className="donors-table-container">
          <table className="donors-table">
            <thead>
              <tr>
                <th>Donor ID</th>
                <th>Name</th>
                <th>CNIC</th>
                <th>Phone</th>
                <th>Screening Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donorRecords.map((donor) => (
                <tr key={donor._id}>
                  <td><span className="donor-id">{donor.donorId}</span></td>
                  <td>
                    {donor.donorDetails ? 
                      `${donor.donorDetails.firstName} ${donor.donorDetails.lastName}` : 
                      'Unknown'}
                  </td>
                  <td>{donor.donorDetails?.cnic || 'N/A'}</td>
                  <td>{donor.donorDetails?.phoneNumber || 'N/A'}</td>
                  <td>{formatDate(donor.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${donor.eligibilityStatus.toLowerCase()}`}>
                      {donor.eligibilityStatus}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-button"
                      onClick={() => handleAddDonation(donor)}
                      disabled={donor.eligibilityStatus !== 'Eligible'}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3.33337V12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.33334 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Add Donation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding donation details */}
      {showModal && selectedDonor && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header" style={{ padding: "20px" }}>
              <h2>Add Donation Details</h2>
              <button className="close-button" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-content" style={{ padding: "0 20px 20px 20px" }}>
              {/* Screening details section (read-only) */}
              <div className="screening-details">
                <h3>Screening Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Donor ID</span>
                    <span className="detail-value">{selectedDonor.donorId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">
                      {selectedDonor.donorDetails ? 
                        `${selectedDonor.donorDetails.firstName} ${selectedDonor.donorDetails.lastName}` : 
                        'Unknown'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">CNIC</span>
                    <span className="detail-value">{selectedDonor.donorDetails?.cnic || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{selectedDonor.donorDetails?.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedDonor.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Weight</span>
                    <span className="detail-value">{selectedDonor.weight} kg</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Blood Pressure</span>
                    <span className="detail-value">{selectedDonor.bloodPressure} mmHg</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Temperature</span>
                    <span className="detail-value">{selectedDonor.temperature}°C</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Screening Date</span>
                    <span className="detail-value">{formatDate(selectedDonor.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-value ${selectedDonor.eligibilityStatus.toLowerCase()}`}>
                      {selectedDonor.eligibilityStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Donation details section (form) */}
              <div className="donation-form">
                <h3>Donation Details</h3>
                <form onSubmit={formik.handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="donationDate">Donation Date</label>
                    <input
                      type="date"
                      id="donationDate"
                      name="donationDate"
                      value={formik.values.donationDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {formik.touched.donationDate && formik.errors.donationDate && (
                      <div className="error-message">{formik.errors.donationDate}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="volume">Volume (ml)</label>
                    <input
                      type="number"
                      id="volume"
                      name="volume"
                      value={formik.values.volume}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter blood volume"
                    />
                    {formik.touched.volume && formik.errors.volume && (
                      <div className="error-message">{formik.errors.volume}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="donationType">Donation Type</label>
                    <select
                      id="donationType"
                      name="donationType"
                      value={formik.values.donationType}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="" disabled>Select donation type</option>
                      <option value="Whole Blood">Whole Blood</option>
                      <option value="Plasma">Plasma</option>
                      <option value="Platelets">Platelets</option>
                    </select>
                    {formik.touched.donationType && formik.errors.donationType && (
                      <div className="error-message">{formik.errors.donationType}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="doctorName">Doctor Name</label>
                    <input
                      type="text"
                      id="doctorName"
                      name="doctorName"
                      value={formik.values.doctorName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter doctor's name"
                    />
                    {formik.touched.doctorName && formik.errors.doctorName && (
                      <div className="error-message">{formik.errors.doctorName}</div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-button" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-button" disabled={formik.isSubmitting}>
                      {formik.isSubmitting ? (
                        <>
                          <span className="button-spinner"></span>
                          Submitting...
                        </>
                      ) : (
                        'Submit Donation'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDonationDetails;
