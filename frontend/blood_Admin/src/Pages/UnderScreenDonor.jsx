import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import '../Styles/UnderScreenDonor.css'; // Import your CSS file for styling
import { 
  getUnderScreeningdonordata, 
  getUserDetails, 
  updateUserByBloodBank,
  AddUnderScreeningDonorData 
} from '../Helper/helper';

const UnderScreeningDonors = () => {
  const [donorRequests, setDonorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentDonor, setCurrentDonor] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState('userInfo'); // 'userInfo' or 'screening'
  const [screeningData, setScreeningData] = useState({
    email: '',
    weight: '',
    bloodPressure: '',
    temperature: '',
    eligibilityStatus: 'Eligible' // Default value
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await getUnderScreeningdonordata();
      setDonorRequests(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.error || 'Failed to fetch donor data');
      toast.error(err.error || 'Failed to fetch donor data');
      setLoading(false);
    }
  };

  const handleVerifyClick = async (email) => {
    try {
      setLoading(true);
      const userData = await getUserDetails({ email });
      
      if (userData.error) {
        toast.error(userData.error);
        setLoading(false);
        return;
      }
      
      setCurrentDonor(userData);
      setFormData({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        age: userData.age,
        newCnic: userData.cnic,
        newPhoneNumber: userData.phoneNumber
      });
      
      // Initialize screening data with the email
      setScreeningData({
        ...screeningData,
        email: userData.email
      });
      
      setShowModal(true);
      setActiveSection('userInfo'); // Default to user info section
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch donor details');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScreeningInputChange = (e) => {
    const { name, value } = e.target;
    setScreeningData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateDetails = async () => {
    try {
      setLoading(true);
      const response = await updateUserByBloodBank(formData);
      toast.success('Donor details updated successfully!');
      setLoading(false);
      
      // Stay on the same section after update
    } catch (err) {
      toast.error(err.message || 'Failed to update donor details');
      setLoading(false);
    }
  };

  const handleSubmitScreening = async () => {
    try {
      setLoading(true);
      
      // Validate screening data
      if (!screeningData.weight || !screeningData.bloodPressure || !screeningData.temperature) {
        toast.error('All screening fields are required');
        setLoading(false);
        return;
      }
      
      const response = await AddUnderScreeningDonorData(screeningData);
      toast.success('Donor screening recorded successfully!');
      setShowModal(false); // Close modal after successful submission
      setLoading(false);
      
      // Refresh the donor list after successful screening
      fetchDonors();
    } catch (err) {
      toast.error(err.error || 'Failed to record donor screening');
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setActiveSection(section);
  };

  // Function to render all donors from all requests in a flat list
  const renderAllDonors = () => {
    const allDonors = donorRequests.flatMap(request => 
      request.donors.map(donor => ({
        ...donor,
        requestId: request.requestId
      }))
    );

    return allDonors;
  };

  return (
    <div className="under-screening-container">
      <Toaster position="top-right" />
      
      <div className="page-header">
        <h1>Under Screening Donors</h1>
        <p>Verify and manage donors awaiting screening</p>
      </div>

      {loading && <div className="loading-spinner"><div className="spinner"></div></div>}
      
      {error && !loading && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchDonors} className="retry-btn">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="donor-table-container">
          <table className="donor-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Donor Email</th>
                <th>Added By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {renderAllDonors().map((donor) => (
                <tr key={donor._id}>
                  <td>{donor.requestId}</td>
                  <td>{donor.donorEmail}</td>
                  <td>{donor.bloodBankPerson}</td>
                  <td>
                    <span className="status-badge under-screening">
                      {donor.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="verify-btn"
                      onClick={() => handleVerifyClick(donor.donorEmail)}
                    >
                      Verify Details
                    </button>
                  </td>
                </tr>
              ))}
              {renderAllDonors().length === 0 && (
                <tr>
                  <td colSpan="5" className="no-data">
                    No under screening donors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && currentDonor && (
        <div className="modal-overlay">
          <div className="donor-details-modal">
            <div className="modal-header" style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px", paddingBottom: "20px" }}>
              <h2>Donor Management</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-sections">
              {/* Tabs for switching sections */}
              <div className="modal-tabs">
                <button 
                  className={`tab-btn ${activeSection === 'userInfo' ? 'active' : ''}`}
                  onClick={() => toggleSection('userInfo')}
                >
                  User Information
                </button>
                <button 
                  className={`tab-btn ${activeSection === 'screening' ? 'active' : ''}`}
                  onClick={() => toggleSection('screening')}
                >
                  Donor Screening
                </button>
              </div>
              
              <div className="modal-body" style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px", paddingBottom: "20px" }}>
                {/* Donor Profile Header (common to both sections) */}
                <div className="donor-profile-header">
                  <div className="donor-avatar">
                    {currentDonor.firstName?.charAt(0)}{currentDonor.lastName?.charAt(0)}
                  </div>
                  <div className="donor-info">
                    <h3>{currentDonor.firstName} {currentDonor.lastName}</h3>
                    <span className="blood-group">{currentDonor.bloodGroup}</span>
                    <p className="donor-email">{currentDonor.email}</p>
                  </div>
                </div>
                
                {/* User Information Section */}
                {activeSection === 'userInfo' && (
                  <div className="section-content">
                    <h4 className="section-title">Personal Information</h4>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName || ''}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName || ''}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="age">Age</label>
                        <input
                          type="text"
                          id="age"
                          name="age"
                          value={formData.age || ''}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="newCnic">CNIC</label>
                        <input
                          type="text"
                          id="newCnic"
                          name="newCnic"
                          value={formData.newCnic || ''}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="newPhoneNumber">Phone Number</label>
                        <input
                          type="text"
                          id="newPhoneNumber"
                          name="newPhoneNumber"
                          value={formData.newPhoneNumber || ''}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Blood Group</label>
                        <input
                          type="text"
                          value={currentDonor.bloodGroup || ''}
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label>Last Donation</label>
                        <input
                          type="text"
                          value={`${currentDonor.lastDonationMonth || ''} ${currentDonor.lastDonationYear || ''}`}
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label>Location</label>
                        <input
                          type="text"
                          value={`${currentDonor.city || ''}, ${currentDonor.province || ''}`}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Donor Screening Section */}
                {activeSection === 'screening' && (
                  <div className="section-content">
                    <h4 className="section-title">Health Assessment</h4>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="weight">Weight (kg)</label>
                        <input
                          type="text"
                          id="weight"
                          name="weight"
                          value={screeningData.weight}
                          onChange={handleScreeningInputChange}
                          placeholder="Enter weight in kg"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="bloodPressure">Blood Pressure</label>
                        <input
                          type="text"
                          id="bloodPressure"
                          name="bloodPressure"
                          value={screeningData.bloodPressure}
                          onChange={handleScreeningInputChange}
                          placeholder="e.g. 120/80"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="temperature">Temperature (°C)</label>
                        <input
                          type="text"
                          id="temperature"
                          name="temperature"
                          value={screeningData.temperature}
                          onChange={handleScreeningInputChange}
                          placeholder="e.g. 37.0"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="eligibilityStatus">Eligibility Status</label>
                        <select
                          id="eligibilityStatus"
                          name="eligibilityStatus"
                          value={screeningData.eligibilityStatus}
                          onChange={handleScreeningInputChange}
                        >
                          <option value="Eligible">Eligible</option>
                          <option value="Not Eligiblee">Ineligible</option>
                        </select>
                      </div>
                    </div>
                    
                  </div>
                )}
              </div>
              
              <div className="modal-footer" style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px", paddingBottom: "20px" }}>
                {activeSection === 'userInfo' ? (
                  <button 
                    className="update-btn"
                    onClick={handleUpdateDetails}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Details'}
                  </button>
                ) : (
                  <button 
                    className="screening-btn"
                    onClick={handleSubmitScreening}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Complete Screening'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnderScreeningDonors;
