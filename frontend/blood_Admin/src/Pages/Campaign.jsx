import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import {
  addCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignByBloodBank,
  getOldCampaignsByBloodBank
} from '../Helper/helper';

// Import icons
import { FiSave, FiEdit2, FiTrash2, FiX, FiCalendar, FiUser, FiPhone } from 'react-icons/fi';
import { HiSave } from 'react-icons/hi';
import { BsPlusLg } from 'react-icons/bs';

import '../Styles/Campaign.css'; // Import your CSS file for styling

const Campaign = () => {
  // State variables
  const [activeTab, setActiveTab] = useState('current');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [previousCampaigns, setPreviousCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  // Form state for add/edit campaign
  const [formData, setFormData] = useState({
    startDateTime: '',
    endDateTime: '',
    venue: {
      name: '',
      street: '',
      city: '',
      state: ''
    },
    contactDetails: {
      contactPerson: '',
      phone: ''
    }
  });

  // Load campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Fetch both current and previous campaigns
  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      // Fetch current campaigns
      const currentResult = await getCampaignByBloodBank();
      if (currentResult.data && currentResult.data.success) {
        // Filter campaigns based on date to separate active/upcoming from past ones
        const now = new Date();
        const active = currentResult.data.campaigns.filter(campaign => 
          new Date(campaign.endDateTime) >= now
        );
        setActiveCampaigns(active);
      }
      
      // Fetch previous campaigns
      const previousResult = await getOldCampaignsByBloodBank();
      if (previousResult.data && previousResult.data.success) {
        setPreviousCampaigns(previousResult.data.oldCampaigns);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      // Handle nested objects (venue, contactDetails)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format date for input field
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Open edit modal with campaign data
  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      startDateTime: formatDateForInput(campaign.startDateTime),
      endDateTime: formatDateForInput(campaign.endDateTime),
      venue: {
        name: campaign.venue.name,
        street: campaign.venue.street,
        city: campaign.venue.city,
        state: campaign.venue.state
      },
      contactDetails: {
        contactPerson: campaign.contactDetails.contactPerson,
        phone: campaign.contactDetails.phone
      }
    });
    setShowEditModal(true);
  };

  // Handle campaign submission (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let response;
      
      if (showAddModal) {
        // Add new campaign
        response = await addCampaign(formData);
        toast.success("Campaign added successfully!");
        setShowAddModal(false);
      } else {
        // Update existing campaign
        response = await updateCampaign(selectedCampaign._id, formData);
        toast.success("Campaign updated successfully!");
        setShowEditModal(false);
      }
      
      // Refresh campaign data
      fetchCampaigns();
      
      // Reset form data
      resetFormData();
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast.error(error.message || "Failed to save campaign");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle campaign deletion
  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      setIsLoading(true);
      try {
        await deleteCampaign(campaignId);
        toast.success("Campaign deleted successfully!");
        fetchCampaigns();
      } catch (error) {
        console.error("Error deleting campaign:", error);
        toast.error("Failed to delete campaign");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      startDateTime: '',
      endDateTime: '',
      venue: {
        name: '',
        street: '',
        city: '',
        state: ''
      },
      contactDetails: {
        contactPerson: '',
        phone: ''
      }
    });
    setSelectedCampaign(null);
  };

  // Open add modal with empty form
  const handleAddCampaign = () => {
    resetFormData();
    setShowAddModal(true);
  };

  return (
    <div className="campaign-container">
      <Toaster position="top-center" />
      
      {/* Tab Navigation */}
      <div className="campaign-tabs">
        <button 
          className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current & Upcoming
        </button>
        <button 
          className={`tab-button ${activeTab === 'previous' ? 'active' : ''}`}
          onClick={() => setActiveTab('previous')}
        >
          Previous Campaigns
        </button>
        <button className="add-campaign-button" onClick={handleAddCampaign}>
          <BsPlusLg className="plus-icon" /> Add Campaign
        </button>
      </div>
      
      {/* Campaign Listings */}
      <div className="campaign-content">
        {activeTab === 'current' ? (
          <div className="campaign-section">
            <h2>Active & Upcoming Campaigns</h2>
            {isLoading ? (
              <div className="loading">Loading campaigns...</div>
            ) : activeCampaigns.length === 0 ? (
              <div className="no-campaigns">No active or upcoming campaigns found</div>
            ) : (
              <div className="campaign-table-container">
                <table className="campaign-table">
                  <thead>
                    <tr>
                      <th>Blood Bank</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Venue</th>
                      <th>Contact</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCampaigns.map((campaign) => (
                      <tr key={campaign._id}>
                        <td>
                          <div className="blood-bank-cell">
                            <strong>{campaign.bloodBankName}</strong>
                            <span className="blood-bank-id">{campaign.bloodBankId}</span>
                          </div>
                        </td>
                        <td>{formatDate(campaign.startDateTime)}</td>
                        <td>{formatDate(campaign.endDateTime)}</td>
                        <td>
                          <div className="venue-cell">
                            <strong>{campaign.venue.name}</strong>
                            <span>{campaign.venue.street}, {campaign.venue.city}, {campaign.venue.state}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-cell">
                            <div className="contact-person">
                              <FiUser className="contact-icon" /> {campaign.contactDetails.contactPerson}
                            </div>
                            <div className="contact-phone">
                              <FiPhone className="phone-icon" /> {campaign.contactDetails.phone}
                            </div>
                          </div>
                        </td>
                        <td className="action-cell">
                          <button 
                            className="edit-button" 
                            onClick={() => handleEditCampaign(campaign)}
                            aria-label="Edit campaign"
                          >
                            <FiEdit2 className="edit-icon" />
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteCampaign(campaign._id)}
                            aria-label="Delete campaign"
                          >
                            <FiTrash2 className="delete-icon" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="campaign-section">
            <h2>Previous Campaigns</h2>
            {isLoading ? (
              <div className="loading">Loading campaigns...</div>
            ) : previousCampaigns.length === 0 ? (
              <div className="no-campaigns">No previous campaigns found</div>
            ) : (
              <div className="campaign-table-container">
                <table className="campaign-table">
                  <thead>
                    <tr>
                      <th>Blood Bank</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Venue</th>
                      <th>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previousCampaigns.map((campaign) => (
                      <tr key={campaign._id}>
                        <td>
                          <div className="blood-bank-cell">
                            <strong>{campaign.bloodBankName}</strong>
                            <span className="blood-bank-id">{campaign.bloodBankId}</span>
                          </div>
                        </td>
                        <td>{formatDate(campaign.startDateTime)}</td>
                        <td>{formatDate(campaign.endDateTime)}</td>
                        <td>
                          <div className="venue-cell">
                            <strong>{campaign.venue.name}</strong>
                            <span>{campaign.venue.street}, {campaign.venue.city}, {campaign.venue.state}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-cell">
                            <div className="contact-person">
                              <FiUser className="contact-icon" /> {campaign.contactDetails.contactPerson}
                            </div>
                            <div className="contact-phone">
                              <FiPhone className="phone-icon" /> {campaign.contactDetails.phone}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="campaign-modal">
            <div className="modal-header">
              <h2>Add Campaign</h2>
              <button className="close-button" onClick={() => setShowAddModal(false)} aria-label="Close">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date & Time</label>
                    <div className="date-input-wrapper">
                      <input
                        type="datetime-local"
                        name="startDateTime"
                        value={formData.startDateTime}
                        onChange={handleInputChange}
                        required
                        className="date-input"
                      />
                      <FiCalendar className="date-icon" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>End Date & Time</label>
                    <div className="date-input-wrapper">
                      <input
                        type="datetime-local"
                        name="endDateTime"
                        value={formData.endDateTime}
                        onChange={handleInputChange}
                        required
                        className="date-input"
                      />
                      <FiCalendar className="date-icon" />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Venue Name</label>
                  <input
                    type="text"
                    name="venue.name"
                    value={formData.venue.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter venue name"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Street</label>
                    <input
                      type="text"
                      name="venue.street"
                      value={formData.venue.street}
                      onChange={handleInputChange}
                      required
                      placeholder="Street address"
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="venue.city"
                      value={formData.venue.city}
                      onChange={handleInputChange}
                      required
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="venue.state"
                      value={formData.venue.state}
                      onChange={handleInputChange}
                      required
                      placeholder="State"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Person</label>
                    <div className="input-with-icon">
                      <FiUser className="input-icon" />
                      <input
                        type="text"
                        name="contactDetails.contactPerson"
                        value={formData.contactDetails.contactPerson}
                        onChange={handleInputChange}
                        required
                        placeholder="Contact person name"
                        className="input-with-left-icon"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <div className="input-with-icon">
                      <FiPhone className="input-icon" />
                      <input
                        type="text"
                        name="contactDetails.phone"
                        value={formData.contactDetails.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Phone number"
                        className="input-with-left-icon"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-button" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <>
                      <HiSave className="save-icon" /> Save Campaign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Campaign Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="campaign-modal">
            <div className="modal-header">
              <h2>Edit Campaign</h2>
              <button className="close-button" onClick={() => setShowEditModal(false)} aria-label="Close">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date & Time</label>
                    <div className="date-input-wrapper">
                      <input
                        type="datetime-local"
                        name="startDateTime"
                        value={formData.startDateTime}
                        onChange={handleInputChange}
                        required
                        className="date-input"
                      />
                      <FiCalendar className="date-icon" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>End Date & Time</label>
                    <div className="date-input-wrapper">
                      <input
                        type="datetime-local"
                        name="endDateTime"
                        value={formData.endDateTime}
                        onChange={handleInputChange}
                        required
                        className="date-input"
                      />
                      <FiCalendar className="date-icon" />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Venue Name</label>
                  <input
                    type="text"
                    name="venue.name"
                    value={formData.venue.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter venue name"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Street</label>
                    <input
                      type="text"
                      name="venue.street"
                      value={formData.venue.street}
                      onChange={handleInputChange}
                      required
                      placeholder="Street address"
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="venue.city"
                      value={formData.venue.city}
                      onChange={handleInputChange}
                      required
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="venue.state"
                      value={formData.venue.state}
                      onChange={handleInputChange}
                      required
                      placeholder="State"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Person</label>
                    <div className="input-with-icon">
                      <FiUser className="input-icon" />
                      <input
                        type="text"
                        name="contactDetails.contactPerson"
                        value={formData.contactDetails.contactPerson}
                        onChange={handleInputChange}
                        required
                        placeholder="Contact person name"
                        className="input-with-left-icon"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <div className="input-with-icon">
                      <FiPhone className="input-icon" />
                      <input
                        type="text"
                        name="contactDetails.phone"
                        value={formData.contactDetails.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Phone number"
                        className="input-with-left-icon"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-button" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    <>
                      <HiSave className="save-icon" /> Save Campaign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaign;
