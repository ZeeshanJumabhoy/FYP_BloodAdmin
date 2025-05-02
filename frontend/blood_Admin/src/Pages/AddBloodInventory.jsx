import React, { useState, useEffect } from 'react';
import { getinventory, addinventory } from '../Helper/helper';
import { toast, Toaster } from 'react-hot-toast';
import { FiEdit2, FiSave, FiPlus, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { BsDroplet } from 'react-icons/bs';
import '../Styles/AddBloodInventory.css';

const AddBloodInventory = () => {
  // State variables
  const [inventory, setInventory] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBloodGroup, setNewBloodGroup] = useState({
    bloodGroup: '',
    wholeBlood: 0,
    packedCellVolume: 0,
    freshFrozenPlasma: 0
  });
  const [bloodBankInfo, setBloodBankInfo] = useState({
    name: '',
    id: ''
  });

  // Standard blood groups
  const standardBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Calculate inventory statistics
  const calculateStats = () => {
    let totalComponents = 0;
    let criticalGroups = 0;
    let totalWholeBlood = 0;
    let totalPCV = 0;
    let totalFFP = 0;

    inventory.forEach(item => {
      totalWholeBlood += item.wholeBlood;
      totalPCV += item.packedCellVolume;
      totalFFP += item.freshFrozenPlasma;

      // Consider critical if any component is less than 5 units
      if (item.wholeBlood < 5 || item.packedCellVolume < 5 || item.freshFrozenPlasma < 5) {
        criticalGroups++;
      }
    });

    totalComponents = totalWholeBlood + totalPCV + totalFFP;

    return {
      totalComponents,
      criticalGroups,
      totalWholeBlood,
      totalPCV,
      totalFFP
    };
  };

  const stats = calculateStats();

  // Fetch inventory data on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Fetch inventory data from API
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await getinventory();

      if (response?.data?.data) {
        setInventory(response.data.data.inventory || []);
        setBloodBankInfo({
          name: response.data.data.bloodBankName,
          id: response.data.data.bloodBankId
        });
      } else {
        // If no inventory data is found, initialize with empty array
        setInventory([]);
        toast.error("No inventory data found. Please add your blood inventory.");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle edit mode for a specific blood group
  const toggleEditMode = (bloodGroup) => {
    setEditMode(prev => ({
      ...prev,
      [bloodGroup]: !prev[bloodGroup]
    }));
  };

  // Handle input change for editable fields
  const handleInputChange = (bloodGroup, field, value) => {
    // Ensure value is a number and not negative
    const numericValue = value === '' ? 0 : Math.max(0, parseInt(value, 10));

    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.bloodGroup === bloodGroup
          ? { ...item, [field]: numericValue }
          : item
      )
    );
  };

  // Handle input change for new blood group form
  const handleNewBloodGroupChange = (field, value) => {
    // Ensure value is a number and not negative for numeric fields
    const processedValue = ['wholeBlood', 'packedCellVolume', 'freshFrozenPlasma'].includes(field)
      ? (value === '' ? 0 : Math.max(0, parseInt(value, 10)))
      : value;

    setNewBloodGroup(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  // Add new blood group to inventory
  const addNewBloodGroup = () => {
    // Validate blood group
    if (!newBloodGroup.bloodGroup) {
      toast.error("Please select a blood group");
      return;
    }

    // Check if blood group already exists
    if (inventory.some(item => item.bloodGroup === newBloodGroup.bloodGroup)) {
      toast.error(`Blood group ${newBloodGroup.bloodGroup} already exists`);
      return;
    }

    // Add new blood group to inventory
    setInventory(prev => [...prev, { ...newBloodGroup }]);

    // Reset form
    setNewBloodGroup({
      bloodGroup: '',
      wholeBlood: 0,
      packedCellVolume: 0,
      freshFrozenPlasma: 0
    });

    setShowAddForm(false);
    toast.success(`Added ${newBloodGroup.bloodGroup} to inventory`);
  };

  // Remove blood group from inventory
  const removeBloodGroup = (bloodGroup) => {
    setInventory(prev => prev.filter(item => item.bloodGroup !== bloodGroup));
    toast.success(`Removed ${bloodGroup} from inventory`);
  };

  // Handle form submission to update/add inventory
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Validate inventory data
      if (inventory.length === 0) {
        toast.error("Please add at least one blood group to your inventory");
        setIsSubmitting(false);
        return;
      }

      // Prepare payload
      const payload = {
        inventory: inventory
      };

      // Call API to update inventory
      await addinventory(payload);

      toast.success("Inventory updated successfully");

      // Reset edit mode
      setEditMode({});
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error(error.message || "Failed to update inventory");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get CSS class for inventory level
  const getInventoryLevelClass = (level) => {
    if (level <= 5) return 'critical';
    if (level <= 10) return 'warning';
    return 'healthy';
  };

  return (
    <div className="blood-inventory-container">
      <Toaster position="top-center" />

      <div className="inventory-header">
        <div className="header-content">
          <h1>Blood Inventory</h1>
        </div>
        <button
          className="refresh-button"
          onClick={fetchInventory}
          disabled={isLoading}
          title="Refresh inventory data"
        >
          <svg className={isLoading ? "spinning" : ""} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 1-9 9c-4.97 0-9-4.03-9-9s4.03-9 9-9h3"></path>
            <path d="M15 3l3 3-3 3"></path>
          </svg>
        </button>
      </div>

      <div className="inventory-dashboard">
        <div className="dashboard-card total-components">
          <div className="card-icon">
            <BsDroplet />
          </div>
          <div className="card-content">
            <h3>Total Components</h3>
            <p className="card-value">{stats.totalComponents}</p>
          </div>
        </div>

        <div className="dashboard-card blood-types">
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
            </svg>
          </div>
          <div className="card-content">
            <h3>Blood Types</h3>
            <p className="card-value">{inventory.length}</p>
          </div>
        </div>

        <div className="dashboard-card critical-inventory">
          <div className="card-icon">
            <FiAlertCircle />
          </div>
          <div className="card-content">
            <h3>Critical Groups</h3>
            <p className="card-value">{stats.criticalGroups}</p>
          </div>
        </div>

        <div className="dashboard-card whole-blood">
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 11h4"></path>
              <path d="M14 15h4"></path>
              <path d="M9 18h6"></path>
              <path d="M10 22h4"></path>
              <path d="M12 6v8"></path>
              <path d="M8 14h8"></path>
              <path d="M7.11 12.18A6 6 0 0 1 12 6a6 6 0 0 1 4.88 6.18"></path>
            </svg>
          </div>
          <div className="card-content">
            <h3>Whole Blood</h3>
            <p className="card-value">{stats.totalWholeBlood}</p>
          </div>
        </div>
      </div>

      <div className="inventory-container">
        <div className="inventory-header-actions">
          <h2>Blood Component Inventory</h2>
          <button
            className="add-group-button"
            onClick={() => setShowAddForm(true)}
          >
            <FiPlus /> Add Blood Group
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading inventory data...</p>
          </div>
        ) : (
          <>
            {inventory.length === 0 ? (
              <div className="empty-inventory">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"></path>
                  <path d="M12 12h.01"></path>
                </svg>
                <p>No inventory data found</p>
                <button
                  className="add-group-button-large"
                  onClick={() => setShowAddForm(true)}
                >
                  <FiPlus /> Add Your First Blood Group
                </button>
              </div>
            ) : (
              <div className="inventory-table-container">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Whole Blood</th>
                      <th>Packed Cell Volume</th>
                      <th>Fresh Frozen Plasma</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.bloodGroup}>
                        <td className="blood-group-cell">
                          <div className={`blood-group-badge ${item.bloodGroup.includes('-') ? 'negative' : 'positive'}`}>
                            {item.bloodGroup}
                          </div>
                        </td>
                        <td>
                          {editMode[item.bloodGroup] ? (
                            <input
                              type="number"
                              min="0"
                              value={item.wholeBlood}
                              onChange={(e) => handleInputChange(item.bloodGroup, 'wholeBlood', e.target.value)}
                              className="inventory-input"
                            />
                          ) : (
                            <div className={`inventory-value ${getInventoryLevelClass(item.wholeBlood)}`}>
                              {item.wholeBlood} units
                            </div>
                          )}
                        </td>
                        <td>
                          {editMode[item.bloodGroup] ? (
                            <input
                              type="number"
                              min="0"
                              value={item.packedCellVolume}
                              onChange={(e) => handleInputChange(item.bloodGroup, 'packedCellVolume', e.target.value)}
                              className="inventory-input"
                            />
                          ) : (
                            <div className={`inventory-value ${getInventoryLevelClass(item.packedCellVolume)}`}>
                              {item.packedCellVolume} units
                            </div>
                          )}
                        </td>
                        <td>
                          {editMode[item.bloodGroup] ? (
                            <input
                              type="number"
                              min="0"
                              value={item.freshFrozenPlasma}
                              onChange={(e) => handleInputChange(item.bloodGroup, 'freshFrozenPlasma', e.target.value)}
                              className="inventory-input"
                            />
                          ) : (
                            <div className={`inventory-value ${getInventoryLevelClass(item.freshFrozenPlasma)}`}>
                              {item.freshFrozenPlasma} units
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {editMode[item.bloodGroup] ? (
                              <button
                                className="save-button"
                                onClick={() => toggleEditMode(item.bloodGroup)}
                                title="Save changes"
                              >
                                <FiSave />
                              </button>
                            ) : (
                              <button
                                className="edit-button"
                                onClick={() => toggleEditMode(item.bloodGroup)}
                                title="Edit inventory"
                              >
                                <FiEdit2 />
                              </button>
                            )}
                            <button
                              className="delete-button"
                              onClick={() => removeBloodGroup(item.bloodGroup)}
                              title="Remove blood group"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {inventory.length > 0 && (
              <div className="inventory-actions">
                <button
                  className="submit-button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="button-spinner"></span>
                      Updating Inventory...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Update Inventory
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-blood-group-modal">
            <div className="modal-header" style={{ paddingLeft: '12px' }} bis_skin_checked="1">
              <h2>Add New Blood Group</h2>
              <button
                className="close-button"
                onClick={() => setShowAddForm(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ paddingLeft: '12px', paddingRight: "12px" }} bis_skin_checked="1">
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  value={newBloodGroup.bloodGroup}
                  onChange={(e) => handleNewBloodGroupChange('bloodGroup', e.target.value)}
                  className="blood-group-select"
                >
                  <option value="">Select Blood Group</option>
                  {standardBloodGroups
                    .filter(group => !inventory.some(item => item.bloodGroup === group))
                    .map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))
                  }
                </select>
              </div>

              <div className="form-group">
                <label>Whole Blood (units)</label>
                <input
                  type="number"
                  min="0"
                  value={newBloodGroup.wholeBlood}
                  onChange={(e) => handleNewBloodGroupChange('wholeBlood', e.target.value)}
                  className="inventory-input"
                />
              </div>

              <div className="form-group">
                <label>Packed Cell Volume (units)</label>
                <input
                  type="number"
                  min="0"
                  value={newBloodGroup.packedCellVolume}
                  onChange={(e) => handleNewBloodGroupChange('packedCellVolume', e.target.value)}
                  className="inventory-input"
                />
              </div>

              <div className="form-group">
                <label>Fresh Frozen Plasma (units)</label>
                <input
                  type="number"
                  min="0"
                  value={newBloodGroup.freshFrozenPlasma}
                  onChange={(e) => handleNewBloodGroupChange('freshFrozenPlasma', e.target.value)}
                  className="inventory-input"
                />
              </div>
            </div>

            <div className="modal-footer" style={{ paddingRight: '12px', paddingBottom: "12px" }} bis_skin_checked="1">
              <button
                className="cancel-button"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                className="add-button"
                onClick={addNewBloodGroup}
              >
                Add Blood Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBloodInventory;
