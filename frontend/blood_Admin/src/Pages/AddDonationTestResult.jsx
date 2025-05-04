import React, { useState, useEffect } from 'react';
import { getDonationDetails, addBloodTestResultHelper, updateBloodRequestStatusHelper, updateMasterBloodDonationHelper } from '../Helper/helper';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast, { Toaster } from 'react-hot-toast';
import '../Styles/AddDonationTestResult.css';
import { format } from 'date-fns';
import { FaVial, FaSearch, FaFileMedical } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { MdOutlineBloodtype } from 'react-icons/md';

const AddDonationTestResult = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch donation details on component mount
    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await getDonationDetails();
                if (response && response.records) {
                    setRecords(response.records);
                }
                setIsLoading(false);
            } catch (error) {
                toast.error(error.error || 'Failed to fetch donation records');
                setIsLoading(false);
            }
        };

        fetchDonations();
    }, []);

    // Filter records based on search term and status
    const filteredRecords = records.filter(record => {
        const donorName = `${record.donorProfile?.firstName || ''} ${record.donorProfile?.lastName || ''}`.toLowerCase();
        const donorId = record.screeningDetails?.donorId?.toLowerCase() || '';
        const donationId = record.donationDetails?.donationId?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = donorName.includes(searchLower) ||
            donorId.includes(searchLower) ||
            donationId.includes(searchLower);

        if (filterStatus === 'all') return matchesSearch;
        if (filterStatus === 'eligible') return matchesSearch && record.screeningDetails?.eligibilityStatus === 'Eligible';
        if (filterStatus === 'ineligible') return matchesSearch && record.screeningDetails?.eligibilityStatus !== 'Eligible';

        return matchesSearch;
    });

    // Handle opening the modal with selected donation data
    const handleAddResultClick = (record) => {
        setSelectedDonation(record);
        setShowModal(true);
    };

    // Form validation schema
    const validationSchema = Yup.object({
        bloodType: Yup.string().required('Blood type is required'),
        hemoglobinLevel: Yup.number()
            .required('Hemoglobin level is required')
            .min(7, 'Hemoglobin level must be at least 7 g/dL')
            .max(20, 'Hemoglobin level must be less than 20 g/dL'),
        hiv: Yup.string().oneOf(['Positive', 'Negative'], 'Select HIV status').required('HIV status is required'),
        hepatitisB: Yup.string().oneOf(['Positive', 'Negative'], 'Select Hepatitis B status').required('Hepatitis B status is required'),
        hepatitisC: Yup.string().oneOf(['Positive', 'Negative'], 'Select Hepatitis C status').required('Hepatitis C status is required'),
        syphilis: Yup.string().oneOf(['Positive', 'Negative'], 'Select Syphilis status').required('Syphilis status is required'),
        labDoctor: Yup.string().required('Lab doctor name is required'),
        doctorRemarks: Yup.string(),
        suggestedNextDonationDate: Yup.date().min(new Date(), 'Date must be in the future'),
        platletsfreezer: Yup.string().required('Platelets storage location is required'),
        RBCfreezer: Yup.string().required('RBC storage location is required'),
        plasmafreezer: Yup.string().required('Plasma storage location is required')
    });

    // Initialize formik
    const formik = useFormik({
        initialValues: {
            bloodType: '',
            hemoglobinLevel: '',
            hiv: '',
            hepatitisB: '',
            hepatitisC: '',
            syphilis: '',
            labDoctor: '',
            doctorRemarks: '',
            suggestedNextDonationDate: '',
            platletsfreezer: '',
            RBCfreezer: '',
            plasmafreezer: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            if (!selectedDonation) return;

            setIsSubmitting(true); // Set submitting state
            const loadingToast = toast.loading('Processing test results...');

            try {
                // Step 1: Add Blood Test Results
                const testData = {
                    donorId: selectedDonation.screeningDetails.donorId,
                    donationId: selectedDonation.donationDetails?.donationId,
                    donorEmail: selectedDonation.screeningDetails.email,
                    ...values
                };

                const response = await addBloodTestResultHelper(testData);
                const testId = response.testResult.testId;
                console.log('Blood test results added successfully');

                // Step 2: Update Blood Request Status for each requestId
                if (selectedDonation.requestIds && selectedDonation.requestIds.length > 0) {
                    for (const requestId of selectedDonation.requestIds) {
                        await updateBloodRequestStatusHelper({
                            requestId,
                            donorEmail: selectedDonation.screeningDetails.email,
                            status: 'Completed'
                        });
                        console.log(`Updated request status for requestId: ${requestId}`);
                    }
                }

                // Step 3: Update Master Blood Donation record
                await updateMasterBloodDonationHelper({
                    email: selectedDonation.screeningDetails.email,
                    donationId: selectedDonation.donationDetails?.donationId,
                    testId: testId,
                });
                console.log('Updated master blood donation record');

                // All steps successful
                toast.dismiss(loadingToast);
                toast.success('Blood test results and related records updated successfully');

                // Check if any test was positive and show appropriate message
                if (response.isReactive) {
                    toast.error('Warning: Reactive test detected. Components marked for discard.');
                }

                setShowModal(false);
                formik.resetForm();

                // Refresh donation details
                try {
                    const updatedRecords = await getDonationDetails();
                    if (updatedRecords && updatedRecords.records) {
                        setRecords(updatedRecords.records);
                    }
                } catch (refreshError) {
                    console.error('Error refreshing records:', refreshError);
                    toast.error('Records updated but failed to refresh the display. Please reload the page.');
                }
            } catch (error) {
                console.error('Error in test result submission process:', error);
                toast.dismiss(loadingToast);
                toast.error(error.error || 'Failed to complete the process. Please try again.');
            } finally {
                setIsSubmitting(false); // Reset submitting state
            }
        }
    });

    // Handle changes for test fields - when a test is marked positive, update component storages
    const handleTestChange = (e) => {
        const { name, value } = e.target;
        formik.setFieldValue(name, value);

        // If any test is positive, automatically update freezers to "discard"
        if ((name === 'hiv' || name === 'hepatitisB' || name === 'hepatitisC' || name === 'syphilis') && value === 'Positive') {
            formik.setFieldValue('platletsfreezer', 'discard');
            formik.setFieldValue('RBCfreezer', 'discard');
            formik.setFieldValue('plasmafreezer', 'discard');
        }
    };

    return (
        <div className="donation-records-container">
            <Toaster position="top-right" />

            {/* Header Section */}
            <div className="records-header">
                <div className="header-title">
                    <MdOutlineBloodtype className="header-icon" />
                    <h1>Donation Records & Test Management</h1>
                </div>

                <div className="filter-controls">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name, donor ID or donation ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="status-filter">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="eligible">Eligible</option>
                            <option value="ineligible">Ineligible</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Records Table */}
            <div className="records-table-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading donation records...</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="empty-state">
                        <FaFileMedical className="empty-icon" />
                        <h3>No donation records found</h3>
                        <p>No donor records are available for your blood bank at this time.</p>
                    </div>
                ) : (
                    <table className="records-table">
                        <thead>
                            <tr>
                                <th>Donor Name</th>
                                <th>Donor ID</th>
                                <th>CNIC</th>
                                <th>Contact</th>
                                <th>Donation ID</th>
                                <th>Date</th>
                                <th>Volume</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record, index) => (
                                <tr key={index}>
                                    <td className="donor-name">
                                        {record.donorProfile?.firstName} {record.donorProfile?.lastName}
                                    </td>
                                    <td>{record.screeningDetails?.donorId || 'N/A'}</td>
                                    <td>{record.donorProfile?.cnic || 'N/A'}</td>
                                    <td>{record.donorProfile?.phoneNumber || 'N/A'}</td>
                                    <td>{record.donationDetails?.donationId || 'Pending'}</td>
                                    <td>
                                        {record.donationDetails?.donationDate
                                            ? format(new Date(record.donationDetails.donationDate), 'MMM dd, yyyy')
                                            : 'N/A'}
                                    </td>
                                    <td>{record.donationDetails?.volume || 'N/A'} ml</td>
                                    <td>{record.donationDetails?.donationType || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${record.screeningDetails?.eligibilityStatus === 'Eligible' ? 'eligible' : 'ineligible'}`}>
                                            {record.screeningDetails?.eligibilityStatus || 'Unknown'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="add-result-btn"
                                            onClick={() => handleAddResultClick(record)}
                                            disabled={!record.donationDetails?.donationId || record.screeningDetails?.eligibilityStatus !== 'Eligible'}
                                        >
                                            <FaVial />
                                            <span>Add Test Result</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Test Results Modal */}
            {showModal && selectedDonation && (
                <div className="modal-overlay">
                    <div className="test-results-modal">
                        <div className="modal-header">
                            <h2>Add Blood Test Results</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <IoClose />
                            </button>
                        </div>

                        <div className="modal-content">
                            {/* Donor Information Section */}
                            <div className="donor-info-section">
                                <h3>Donor Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Donor Name:</span>
                                        <span className="info-value">
                                            {selectedDonation.donorProfile?.firstName} {selectedDonation.donorProfile?.lastName}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Donor ID:</span>
                                        <span className="info-value">{selectedDonation.screeningDetails?.donorId}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Donation ID:</span>
                                        <span className="info-value">{selectedDonation.donationDetails?.donationId}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Donation Type:</span>
                                        <span className="info-value">{selectedDonation.donationDetails?.donationType}</span>
                                    </div>
                                </div>

                                {/* Screening Details */}
                                <div className="screening-details">
                                    <h4>Screening Details</h4>
                                    <div className="screening-grid">
                                        <div className="screening-item">
                                            <span className="screening-label">Weight:</span>
                                            <span className="screening-value">{selectedDonation.screeningDetails?.weight} kg</span>
                                        </div>
                                        <div className="screening-item">
                                            <span className="screening-label">Blood Pressure:</span>
                                            <span className="screening-value">{selectedDonation.screeningDetails?.bloodPressure}</span>
                                        </div>
                                        <div className="screening-item">
                                            <span className="screening-label">Temperature:</span>
                                            <span className="screening-value">{selectedDonation.screeningDetails?.temperature} °C</span>
                                        </div>
                                        <div className="screening-item">
                                            <span className="screening-label">Status:</span>
                                            <span className={`screening-value status-${selectedDonation.screeningDetails?.eligibilityStatus?.toLowerCase()}`}>
                                                {selectedDonation.screeningDetails?.eligibilityStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Test Results Form */}
                            <form onSubmit={formik.handleSubmit} className="test-results-form">
                                <div className="form-sections">
                                    {/* Test Results Section */}
                                    <div className="form-section">
                                        <h3>Blood Test Results</h3>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label htmlFor="bloodType">Blood Type</label>
                                                <select
                                                    id="bloodType"
                                                    name="bloodType"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.bloodType}
                                                    className={formik.touched.bloodType && formik.errors.bloodType ? 'error' : ''}
                                                >
                                                    <option value="">Select Blood Type</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                </select>
                                                {formik.touched.bloodType && formik.errors.bloodType ? (
                                                    <div className="error-message">{formik.errors.bloodType}</div>
                                                ) : null}
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="hemoglobinLevel">Hemoglobin Level (g/dL)</label>
                                                <input
                                                    type="number"
                                                    id="hemoglobinLevel"
                                                    name="hemoglobinLevel"
                                                    step="0.1"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.hemoglobinLevel}
                                                    className={formik.touched.hemoglobinLevel && formik.errors.hemoglobinLevel ? 'error' : ''}
                                                />
                                                {formik.touched.hemoglobinLevel && formik.errors.hemoglobinLevel ? (
                                                    <div className="error-message">{formik.errors.hemoglobinLevel}</div>
                                                ) : null}
                                            </div>

                                            <div className="form-group">
                                                <label>HIV</label>
                                                <div className="radio-group">
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="hiv"
                                                            value="Negative"
                                                            checked={formik.values.hiv === 'Negative'}
                                                            onChange={handleTestChange}
                                                        />
                                                        Negative
                                                    </label>
                                                    <label className="positive">
                                                        <input
                                                            type="radio"
                                                            name="hiv"
                                                            value="Positive"
                                                            checked={formik.values.hiv === 'Positive'}
                                                            onChange={handleTestChange}
                                                        />
                                                        Positive
                                                    </label>
                                                </div>
                                                {formik.touched.hiv && formik.errors.hiv ? (
                                                    <div className="error-message">{formik.errors.hiv}</div>
                                                ) : null}
                                            </div>

                                            <div className="form-group">
                                                <label>Hepatitis B</label>
                                                <div className="radio-group">
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="hepatitisB"
                                                            value="Negative"
                                                            checked={formik.values.hepatitisB === 'Negative'}
                                                            onChange={handleTestChange}
                                                        />
                                                        Negative
                                                    </label>
                                                    <label className="positive">
                                                        <input
                                                            type="radio"
                                                            name="hepatitisB"
                                                            value="Positive"
                                                            checked={formik.values.hepatitisB === 'Positive'}
                                                            onChange={handleTestChange}
                                                        />
                                                        Positive
                                                    </label>
                                                </div>
                                                {formik.touched.hepatitisB && formik.errors.hepatitisB ? (
                                                    <div className="error-message">{formik.errors.hepatitisB}</div>
                                                ) : null}
                                            </div>

                                            <div className="form-group">
                                                <label>Hepatitis C</label>
                                                <div className="radio-group">
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="hepatitisC"
                                                            value="Negative"
                                                            checked={formik.values.hepatitisC === 'Negative'}
                                                            onChange={handleTestChange}
                                                        />
                                                        Negative
                                                    </label>
                                                    <label className="positive">
                                                        <input
                                                            type="radio"
                                                            name="hepatitisC"
                                                            value="Positive"
                                                            checked={formik.values.hepatitisC === 'Positive'}
                                                            onChange={handleTestChange}
                                                        />
                                                        Positive
                                                    </label>
                                                </div>
                                                {formik.touched.hepatitisC && formik.errors.hepatitisC ? (
                                                    <div className="error-message">{formik.errors.hepatitisC}</div>
                                                ) : null}
                                            </div>

                                            <div className="form-group">
                                                <label>Syphilis</label>
                                                <div className="radio-group">
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="syphilis"
                                                            value="Negative"
                                                            checked={formik.values.syphilis === 'Negative'}
                                                            onChange={handleTestChange}
                                                        />
                                                        Negative
                                                    </label>
                                                    <label className="positive">
                                                        <input
                                                            type="radio"
                                                            name="syphilis"
                                                            value="Positive"
                                                            checked={formik.values.syphilis === 'Positive'}
                                                            onChange={handleTestChange}
                                                        />
                                                        Positive
                                                    </label>
                                                </div>
                                                {formik.touched.syphilis && formik.errors.syphilis ? (
                                                    <div className="error-message">{formik.errors.syphilis}</div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Component Storage Section */}
                                    <div className="form-section">
                                        <h3>Component Storage</h3>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label htmlFor="platletsfreezer">Platelets Storage</label>
                                                <input
                                                    type="text"
                                                    id="platletsfreezer"
                                                    name="platletsfreezer"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.platletsfreezer}
                                                    className={formik.touched.platletsfreezer && formik.errors.platletsfreezer ? 'error' : ''}
                                                    placeholder="e.g., Freezer 1"
                                                />
                                                {formik.touched.platletsfreezer && formik.errors.platletsfreezer ? (
                                                    <div className="error-message">{formik.errors.platletsfreezer}</div>
                                                ) : null}
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="RBCfreezer">RBC Storage</label>
                                                <input
                                                    type="text"
                                                    id="RBCfreezer"
                                                    name="RBCfreezer"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.RBCfreezer}
                                                    className={formik.touched.RBCfreezer && formik.errors.RBCfreezer ? 'error' : ''}
                                                    placeholder="e.g., Freezer 2"
                                                />
                                                {formik.touched.RBCfreezer && formik.errors.RBCfreezer ? (
                                                    <div className="error-message">{formik.errors.RBCfreezer}</div>
                                                ) : null}
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="plasmafreezer">Plasma Storage</label>
                                                <input
                                                    type="text"
                                                    id="plasmafreezer"
                                                    name="plasmafreezer"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.plasmafreezer}
                                                    className={formik.touched.plasmafreezer && formik.errors.plasmafreezer ? 'error' : ''}
                                                    placeholder="e.g., Freezer 3"
                                                />
                                                {formik.touched.plasmafreezer && formik.errors.plasmafreezer ? (
                                                    <div className="error-message">{formik.errors.plasmafreezer}</div>
                                                ) : null}
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="labDoctor">Lab Doctor</label>
                                                <input
                                                    type="text"
                                                    id="labDoctor"
                                                    name="labDoctor"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.labDoctor}
                                                    className={formik.touched.labDoctor && formik.errors.labDoctor ? 'error' : ''}
                                                    placeholder="e.g., Dr. Khan"
                                                />
                                                {formik.touched.labDoctor && formik.errors.labDoctor ? (
                                                    <div className="error-message">{formik.errors.labDoctor}</div>
                                                ) : null}
                                            </div>

                                            <div className="form-group full-width">
                                                <label htmlFor="doctorRemarks">Doctor's Remarks</label>
                                                <textarea
                                                    id="doctorRemarks"
                                                    name="doctorRemarks"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.doctorRemarks}
                                                    className={formik.touched.doctorRemarks && formik.errors.doctorRemarks ? 'error' : ''}
                                                    rows="3"
                                                    placeholder="Any important notes about the test results..."
                                                ></textarea>
                                                {formik.touched.doctorRemarks && formik.errors.doctorRemarks ? (
                                                    <div className="error-message">{formik.errors.doctorRemarks}</div>
                                                ) : null}
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="suggestedNextDonationDate">Suggested Next Donation</label>
                                                <input
                                                    type="date"
                                                    id="suggestedNextDonationDate"
                                                    name="suggestedNextDonationDate"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.suggestedNextDonationDate}
                                                    className={formik.touched.suggestedNextDonationDate && formik.errors.suggestedNextDonationDate ? 'error' : ''}
                                                />
                                                {formik.touched.suggestedNextDonationDate && formik.errors.suggestedNextDonationDate ? (
                                                    <div className="error-message">{formik.errors.suggestedNextDonationDate}</div>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Warning Message for Positive Tests */}
                                        {(formik.values.hiv === 'Positive' ||
                                            formik.values.hepatitisB === 'Positive' ||
                                            formik.values.hepatitisC === 'Positive' ||
                                            formik.values.syphilis === 'Positive') && (
                                                <div className="warning-message">
                                                    <p>⚠️ Warning: Positive test detected. All components will be marked for discard.</p>
                                                </div>
                                            )}
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={formik.isSubmitting}
                                    >
                                        {formik.isSubmitting ? 'Processing...' : 'Submit Test Results'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddDonationTestResult;
