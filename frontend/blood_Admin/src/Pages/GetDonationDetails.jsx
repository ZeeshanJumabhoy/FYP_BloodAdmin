import React, { useState, useEffect } from 'react';
import { getDonationDetails } from '../Helper/helper';
import toast, { Toaster } from 'react-hot-toast';
import '../Styles/GetDonationDetails.css';

const GetDonationDetails = () => {
  const [donorRecords, setDonorRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  // Fetch donor records on component mount
  useEffect(() => {
    fetchDonationRecords();
  }, []);

  const fetchDonationRecords = async () => {
    setIsLoading(true);
    try {
      const response = await getDonationDetails();
      setDonorRecords(response.records || []);
    } catch (error) {
      console.error('Error fetching donation records:', error);
      toast.error(`Failed to load donation records: ${error.error || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRowExpansion = (recordId) => {
    setExpandedRows(prevState => ({
      ...prevState,
      [recordId]: !prevState[recordId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="donation-records-container">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="page-header">
        <div className="header-content">
          <h1>Donation Records</h1>
          <p>Complete records of all screened donors and their donation details</p>
        </div>
        <div className="header-actions">
          <button className="refresh-button" onClick={fetchDonationRecords}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.1667 3.33333V8.33333H14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M0.833374 16.6667V11.6667H5.83337" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2.95837 7.50001C3.3767 6.06251 4.17513 4.77274 5.2709 3.77697C6.36667 2.7812 7.71251 2.11036 9.16072 1.8385C10.6089 1.56664 12.1004 1.70615 13.4698 2.23752C14.8393 2.7689 16.0265 3.66773 16.8834 4.83334L19.1667 8.33334M0.833374 11.6667L3.11671 15.1667C3.9736 16.3323 5.16082 17.2311 6.53026 17.7625C7.8997 18.2939 9.39122 18.4334 10.8394 18.1615C12.2876 17.8897 13.6335 17.2188 14.7292 16.223C15.825 15.2273 16.6234 13.9375 17.0417 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading donation records...</p>
        </div>
      ) : donorRecords.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M53.3333 40L53.3333 60C53.3333 63.6819 53.3333 65.5228 52.0947 66.7614C50.8561 68 49.0152 68 45.3333 68L34.6667 68C30.9848 68 29.1439 68 27.9053 66.7614C26.6667 65.5228 26.6667 63.6819 26.6667 60L26.6667 40M40 52L40 28M40 28L50 38M40 28L30 38" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.6667 18.6667C18.6667 16.0893 20.7559 14 23.3333 14L56.6667 14C59.2441 14 61.3334 16.0893 61.3334 18.6667C61.3334 21.244 59.2441 23.3333 56.6667 23.3333L23.3333 23.3333C20.7559 23.3333 18.6667 21.244 18.6667 18.6667Z" stroke="#CBD5E1" strokeWidth="4"/>
            </svg>
          </div>
          <h2>No Donation Records</h2>
          <p>There are currently no donation records available.</p>
        </div>
      ) : (
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>Donor ID</th>
                <th>Name</th>
                <th>CNIC</th>
                <th>Contact</th>
                <th>Donation ID</th>
                <th>Donation Type</th>
                <th>Donation Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donorRecords.map((record, index) => (
                <React.Fragment key={record.screeningDetails?._id || index}>
                  <tr className={expandedRows[record.screeningDetails?._id] ? 'expanded' : ''}>
                    <td className="donor-id">{record.screeningDetails?.donorId || 'N/A'}</td>
                    <td>
                      {record.donorProfile ? 
                        `${record.donorProfile.firstName} ${record.donorProfile.lastName}` : 
                        'Unknown'}
                    </td>
                    <td>{record.donorProfile?.cnic || 'N/A'}</td>
                    <td>{record.donorProfile?.phoneNumber || 'N/A'}</td>
                    <td className="donation-id">{record.donationDetails?.donationId || 'Pending'}</td>
                    <td>
                      {record.donationDetails?.donationType ? (
                        <span className={`donation-type ${record.donationDetails.donationType.toLowerCase().replace(/\s+/g, '-')}`}>
                          {record.donationDetails.donationType}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td>{formatDate(record.donationDetails?.donationDate)}</td>
                    <td>
                      <button 
                        className={`expand-button ${expandedRows[record.screeningDetails?._id] ? 'expanded' : ''}`}
                        onClick={() => toggleRowExpansion(record.screeningDetails?._id)}
                        aria-label="Toggle details"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expandedRows[record.screeningDetails?._id] && (
                    <tr className="details-row">
                      <td colSpan="8">
                        <div className="details-container">
                          <div className="details-section screening-section">
                            <h3>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5 16.8749H4.375C3.87772 16.8749 3.40081 16.6774 3.04917 16.3258C2.69754 15.9742 2.5 15.4973 2.5 15V4.99992C2.5 4.50265 2.69754 4.02573 3.04917 3.6741C3.40081 3.32247 3.87772 3.12492 4.375 3.12492H7.5M13.125 13.7499L17.5 9.37492M17.5 9.37492L13.125 4.99992M17.5 9.37492H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Screening Details
                            </h3>
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{record.screeningDetails?.email || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Weight</span>
                                <span className="detail-value">{record.screeningDetails?.weight ? `${record.screeningDetails.weight} kg` : 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Blood Pressure</span>
                                <span className="detail-value">{record.screeningDetails?.bloodPressure ? `${record.screeningDetails.bloodPressure} mmHg` : 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Temperature</span>
                                <span className="detail-value">{record.screeningDetails?.temperature ? `${record.screeningDetails.temperature}°C` : 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Eligibility Status</span>
                                <span className={`status-badge ${record.screeningDetails?.eligibilityStatus?.toLowerCase() || ''}`}>
                                  {record.screeningDetails?.eligibilityStatus || 'Unknown'}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Screening Date</span>
                                <span className="detail-value">{formatDate(record.screeningDetails?.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="details-section donation-section">
                            <h3>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 3.33325V16.6666M10 3.33325L5.83333 7.49992M10 3.33325L14.1667 7.49992M17.5 16.6666H2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Donation Details
                            </h3>
                            {record.donationDetails ? (
                              <div className="details-grid">
                                <div className="detail-item">
                                  <span className="detail-label">Donation ID</span>
                                  <span className="detail-value donation-id">{record.donationDetails.donationId}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Volume</span>
                                  <span className="detail-value">{record.donationDetails.volume} ml</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Donation Type</span>
                                  <span className={`donation-type ${record.donationDetails.donationType.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {record.donationDetails.donationType}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Donation Date</span>
                                  <span className="detail-value">{formatDate(record.donationDetails.donationDate)}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Doctor</span>
                                  <span className="detail-value">{record.donationDetails.doctorName}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Blood Bank ID</span>
                                  <span className="detail-value">{record.donationDetails.bloodBankId}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="empty-details">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 9V12M12 16.01V16M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 10.8181 20.7672 9.64778 20.3149 8.55585C19.8626 7.46392 19.1997 6.47177 18.364 5.63604C17.5282 4.80031 16.5361 4.13738 15.4442 3.68508C14.3522 3.23279 13.1819 3 12 3C10.8181 3 9.64778 3.23279 8.55585 3.68508C7.46392 4.13738 6.47177 4.80031 5.63604 5.63604C4.80031 6.47177 4.13738 7.46392 3.68508 8.55585C3.23279 9.64778 3 10.8181 3 12Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <p>No donation details available for this donor.</p>
                              </div>
                            )}
                          </div>
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
    </div>
  );
};

export default GetDonationDetails;
