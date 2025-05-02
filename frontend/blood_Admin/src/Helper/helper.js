import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import useFetch from '../hooks/fetch';
import { useAuthStore } from "../Helper/store";
axios.defaults.baseURL = import.meta.env.VITE_SERVER_DOMAIN;

const token = localStorage.getItem('token');

export async function getUsername() {
    const token = localStorage.getItem('token');
    if (!token) {
        return Promise.reject('Cannot find the Token...!');
    }
    const decodedToken = jwtDecode(token);
    return decodedToken; // Return the extracted email
}
// const role = useAuthStore.getState().auth.role;
export function getBloodBankInfoFromToken() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication token not found');
    const { bloodBankId, bloodBankName } = jwtDecode(token);
    return { bloodBankId, bloodBankName };
}

export async function authenticate(email) {
    try {
        const { status } = await axios.post('/api/authenticate', { email });
        if (status !== 200) {
            throw new Error({ message: 'Email not Found...!' });
        }
        return Promise.resolve({ message: 'Email found successfully.' });
    } catch (error) {
        return Promise.reject({ error });
    }
}

export async function login(credentials) {
    try {
        const { data } = await axios.post('http://localhost:8080/api/login-bloodbank', credentials);
        return Promise.resolve({ data });
    } catch (e) {
        return Promise.reject({ error: 'Login Failed...!', e });
    }
}

export async function registerverify(credentials) {
    try {
        const { status } = await axios.post('/api/registerCheck', credentials);
        // console.log(credentials)
        // redirects to OTP generation if corrects

        if (status === 201) {
            let message = 'Redirecting For Verification!';
            return Promise.resolve({ message });
        } else {
            throw new Error('Registration Failed...!');
        }
    } catch (err) {
        let message = err?.response?.data?.errors.join(', ') || "Something went wrong!";
        return Promise.reject({ err, message });
    }
}

export async function register(credentials) {
    try {
        const { status } = await axios.post('/api/register', credentials);
        // console.log(credentials)
        // Send Mail if user registered Successfully

        if (status === 201) {
            let message = 'Registered Successfully!';
            const mailData = {
                firstname: credentials.firstname,
                userEmail: credentials.email,
                subject: message,
                mailType: 'registerMail',
            };
            await axios.post('/api/send-mail', mailData);
            return Promise.resolve({ message });
        } else {
            throw new Error('Registration Failed...!');
        }
    } catch (err) {
        let message = err?.response?.data?.error;
        return Promise.reject({ err, message });
    }
}

export async function getUserDetails({ email }) {
    try {
        let { data } = await axios.get(`/api/user/${email}`);
        return data;
    } catch (e) {
        return { error: "Couldn't Fetch the user data...!", e };
    }
}

export async function updateUser(credentials) {
    try {
        const token = await localStorage.getItem('token');
        const { data } = await axios.put('api/update-user', credentials, { headers: { Authorization: `Bearer ${token}` } });
        return Promise.resolve({ data });
    } catch (err) {
        let message = err?.response?.data?.error;
        return Promise.reject({ err, message });
    }
}

export async function updateUserByBloodBank(credentials) {
    try {
        const { data } = await axios.put('/api/update-user-by-bloodbank', credentials);
        return Promise.resolve({ data });
    } catch (err) {
        let message = err?.response?.data?.error;
        return Promise.reject({ err, message });
    }
}
//change in this
export async function generateOTP(username) {
    let email = username;
    try {
        let { data, status } = await axios.get(`/api/generate-otp`, { params: { email } });
        // Send OTP mail
        if (status === 201) {
            //let { email } = await getUser({ username });
            let username = "Blood Savior";
            const mailData = {
                username: username,
                userEmail: email,
                subject: 'Password Recovery OTP',
                mailType: 'otpMail',
                otp: data?.OTP,
            };
            await axios.post('/api/send-mail', mailData);
        }

        return Promise.resolve(data?.OTP);
    } catch (e) {
        return Promise.reject({ error: "Couldn't genreate the OTP...!", e });
    }
}

export async function verifyOTP(credentials) {
    try {
        const { data, status } = await axios.get(`/api/verify-otp`, { params: credentials });
        return { data, status };
    } catch (e) {
        return Promise.reject({ error: 'OTP Verification Failed...!', e });
    }
}

export async function resetPassword(credentials) {
    try {
        const { data, status } = await axios.put('/api/reset-password', credentials);
        return Promise.resolve({ data, status });
    } catch (e) {
        // Capture the error message from the response
        const errorMessage = e.response?.data?.error || 'Password reset failed...!';
        return Promise.reject({ error: errorMessage });
    }
}

export async function requestblood(credentials) {
    try {
        const token = await localStorage.getItem('token');

        // Exclude firstName from credentials
        const { firstName, ...filteredCredentials } = credentials;

        const { status, data } = await axios.post('api/requestblood', filteredCredentials, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (status === 201) {
            let message = 'Your Blood Request is Underway – We are Here to Help';
            const mailData = {
                username: credentials.firstName, // Use firstName here if needed
                userEmail: credentials.email,
                subject: message,
                mailType: 'bloodrequest',
            };
            await axios.post('/api/send-mail', mailData);
            return Promise.resolve({ status });
        } else {
            throw new Error('Registration Failed...!');
        }

    } catch (err) {
        let message = err?.response?.data?.error;
        return Promise.reject({ err, message });
    }
}

export async function sendBloodRequestEmails(credentials) {
    try {
        // Fetch all user emails and first names
        const response = await axios.get(`/api/getAllUserEmails/${credentials.email}`);
        const users = response.data.users;

        // Iterate over each user and send the email
        const {
            bloodGroup,
            units,
            urgency,
            specialRequirements,
            medicalReason,
            transfusionDateTime,
            hospital
        } = credentials;

        const hospitalName = hospital[0]?.hospitalName || '';
        const emailDetails = {
            bloodGroup,
            units,
            urgency,
            specialRequirements: specialRequirements.length > 0 ? specialRequirements : ['None'],
            medicalReason,
            transfusionDateTime,
            hospitalName,// Get first hospital object if available
        };

        for (const user of users) {
            const mailData = {
                username: user.firstName, // Use the first name from the response
                userEmail: user.email,     // Use the email from the response
                subject: 'Urgent Blood Donation Request',
                mailType: 'interestbloodgiving',
                ...emailDetails,
            };

            // Send email to each user
            await axios.post('/api/send-mail', mailData);
        }

        console.log('Emails sent to all users successfully.');
    } catch (error) {
        console.error('Error sending emails:', error);
    }
}

export async function getBloodRequestById(id) {
    try {
        const { data } = await axios.get(`/api/getsinglebloodrequestinfo/${id}`);
        return Promise.resolve({ data });
    } catch (error) {
        return Promise.reject({ error: 'Failed to fetch blood request details!', details: error });
    }
}

export async function updateBloodRequest(id, updatedFields) {
    try {
        // Get the JWT token from localStorage
        const token = await localStorage.getItem('token');

        // Send the PUT request to update the blood request
        const { data } = await axios.put(
            `api/updatebloodrequest/${id}`,
            updatedFields,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Resolve the promise with the API response
        return Promise.resolve({ data });
    } catch (err) {
        // Extract the error message if available
        let message = err?.response?.data?.error;
        return Promise.reject({ err, message });
    }
}

export async function getBloodBank() {
    try {
        const { data } = await axios.get(`/api/getbloodbank`);
        return Promise.resolve({ data });
    } catch (error) {
        return Promise.reject({ error: 'Failed to fetch blood request details!', details: error });
    }
}

export async function appointmentavailability(credentials) {
    try {

        // Make the API call to save the appointment availability
        const { status, data } = await axios.post("api/setBloodBankAppointmentSchedule", credentials, { headers: { Authorization: `Bearer ${token}` } });
        console.log(token);
        if (status === 200 || status === 201) {
            console.log("Availability successfully registered:", data);

            return Promise.resolve({ status, message: "Schedule successfully submitted." });
        } else {
            throw new Error("Failed to submit schedule.");
        }
    } catch (err) {
        console.error("Error while submitting schedule:", err.message);

        // Extract a meaningful error message if available
        let message = err?.response?.data?.message || "An error occurred while submitting schedule.";
        return Promise.reject({ err, message });
    }
}

export async function getAllAppointmentSchedules() {
    try {
        const { data } = await axios.get(`/api/getallappointmentschedule`, { headers: { Authorization: `Bearer ${token}` } });
        return Promise.resolve({ data });
    } catch (error) {
        return Promise.reject({
            error: 'Failed to fetch appointment schedules!',
            details: error?.response?.data || error.message,
        });
    }
}

export async function bookappointment(credentials) {
    try {
        // Get token from local storage for authorization
        const token = await localStorage.getItem('token');

        // Send the POST request to the backend API for booking the appointment
        const response = await axios.post('/api/bookappointment', credentials, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Extract status and data from the response
        const { status, data } = response;

        const {
            bloodBankName,
            timeslot, // Ensure this is accessed correctly
            date,
            day,
        } = credentials;

        const emailDetails = {
            bloodBankName,
            timeslot,
            date,
            day,
        };

        // Handle the response if the booking is successful
        if (status === 201) {
            let message = 'Your appointment is successfully booked!';
            const mailData = {
                username: credentials.firstName, // First name for email (if needed)
                userEmail: credentials.email,
                subject: message,
                mailType: 'appointmentconfirmation',
                ...emailDetails,
            };

            // Send a confirmation email (assuming you have an email API set up)
            await axios.post('/api/send-mail', mailData);

            // Resolve the promise with status and data
            return Promise.resolve({ status, data });
        } else {
            throw new Error('Booking failed. Please try again.');
        }
    } catch (err) {
        // Handle any errors from the API request
        const message = err?.response?.data?.error || err.message;
        return Promise.reject({ error: err, message });
    }
}

export async function getappointmentdetails(email) {
    try {
        // Make the API request to fetch appointment details by email
        const { data } = await axios.get(`/api/getappointmentdetails/${email}`);
        console.log(data);
        // Return the data if the request is successful
        return Promise.resolve({ data });

    } catch (error) {
        // Return an error message if the request fails
        return Promise.reject({ error: 'Failed to fetch appointment details!', details: error });
    }
}

export async function getAppointmentDetailsByBloodBank(bloodBankId) {
    try {
        // Make the API request to fetch appointments by blood bank ID
        const { data } = await axios.get(`/api/getappointmentdetailsbybloodbank/${bloodBankId}`);
        // Return the data if the request is successful
        return Promise.resolve(data);
    } catch (error) {
        console.error('Error fetching appointments by Blood Bank ID:', error);
        // Return an error message if the request fails
        return Promise.reject({ error: 'Failed to fetch appointment details!', details: error });
    }
}

export async function updateAppointmentStatus(email, status) {
    try {
        // Make the API request to update the appointment status
        const { data } = await axios.put('/api/updateAppointmentStatus', { email, status });
        console.log('Updated Appointment:', data);
        // Return the data if the request is successful
        return Promise.resolve(data);
    } catch (error) {
        console.error('Error updating appointment status:', error);
        // Return an error message if the request fails
        return Promise.reject({ error: 'Failed to update appointment status!', details: error });
    }
}

export async function addCampaign(credentials) {
    try {
        // Fetch blood bank info from token
        const { bloodBankId, bloodBankName } = getBloodBankInfoFromToken();


        // Merge blood bank info into campaign credentials
        const campaignData = {
            ...credentials,
            bloodBankId,
            bloodBankName,
        };

        // Send the request to the API
        const { data } = await axios.post('/api/addcampaign', campaignData, { headers: { Authorization: `Bearer ${token}` } });
        return data.message;

    } catch (error) {
        console.error('Error adding campaign:', error);
        return { message: error.message || 'Error occurred' };
    }
}

export async function updateCampaign(campaignId, credentials) {
    try {
        const { bloodBankId, bloodBankName } = getBloodBankInfoFromToken();

        // Ensure the required fields are provided
        const { startDateTime, endDateTime, venue, contactDetails } = credentials;
        if (!startDateTime || !endDateTime || !venue || !contactDetails ||
            !venue.name || !venue.street || !venue.city || !venue.state ||
            !contactDetails.contactPerson || !contactDetails.phone) {
            return { message: 'Invalid input data. Please provide all required fields.' };
        }

        // Prepare the data to be updated
        const updatedData = {
            ...credentials,
            bloodBankId,
            bloodBankName,
        };

        // Send the update request to the API
        const { data } = await axios.put(`/api/updatecampaign/${campaignId}`, updatedData, { headers: { Authorization: `Bearer ${token}` } });
        return data.message;

    } catch (error) {
        console.error('Error updating campaign:', error);
        return { message: error.message || 'Error occurred' };
    }
}

export async function deleteCampaign(campaignId) {
    try {
        const { bloodBankId } = getBloodBankInfoFromToken();

        // Ensure campaignId and bloodBankId are available
        if (!campaignId || !bloodBankId) {
            return { message: 'Missing required fields: campaignId or bloodBankId.' };
        }

        // Send the request to the API to delete the campaign
        const { data } = await axios.delete(`/api/deleteCampaign/${campaignId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data.message;

    } catch (error) {
        console.error('Error deleting campaign:', error);
        return { message: error.message || 'Error occurred' };
    }
}

export async function getCampaignByBloodBank() {
    try {
        const { bloodBankId } = getBloodBankInfoFromToken();

        if (!bloodBankId) {
            throw new Error("Blood Bank ID is required.");
        }

        const { data } = await axios.get(`/api/getcampaignByBloodBank/${bloodBankId}`, { headers: { Authorization: `Bearer ${token}` } });
        return { data };

    } catch (error) {
        return { error: "Failed to fetch Campaign Details!", details: error?.response?.data || error.message };
    }
}

export async function getOldCampaignsByBloodBank() {
    try {
        const { bloodBankId } = getBloodBankInfoFromToken();

        if (!bloodBankId) {
            throw new Error("Blood Bank ID is required.");
        }

        const { data } = await axios.get(`/api/getOldCampaignsByBloodBank/${bloodBankId}`, { headers: { Authorization: `Bearer ${token}` } });
        return { data };

    } catch (error) {
        return { error: "Failed to fetch old campaigns!", details: error?.response?.data || error.message };
    }
}

export async function getcampaign() {
    try {
        const { data } = await axios.get(`/api/getcampaign`);
        return Promise.resolve({ data });
    } catch (error) {
        return Promise.reject({
            error: "Failed to fetch Campagign Details!",
            details: error?.response?.data || error.message,
        });
    }
}

export async function addinventory(credentials) {
    try {
        // Destructuring the necessary fields from the credentials object
        const { inventory } = credentials;

        // Validate the data
        if (!Array.isArray(inventory) || inventory.length === 0) {
            return { message: 'Invalid input data' };
        }

        const { data } = await axios.post('/api/addinventory', credentials, { headers: { Authorization: `Bearer ${token}` } });
        return Promise.resolve({ data });

    } catch (error) {
        console.error('Error adding inventory:', error);
        return { message: error.message || 'Error occurred' }; // Return error message
    }
}

export async function getinventory() {
    try {
        // Fetch blood bank info from token
        const { bloodBankId } = getBloodBankInfoFromToken();
        // Ensure bloodBankId is available
        if (!bloodBankId) {
            throw new Error("Blood Bank ID is required.");
        }
        const bloodBankCode = bloodBankId;
        if (!bloodBankCode) {
            throw new Error("BloodBankCode and day are required.");
        }
        const { data } = await axios.get(`/api/getinventory/${bloodBankId}`);
        return Promise.resolve({ data });
    } catch (error) {
        return Promise.reject({
            error: "Failed to fetch Blood Bank Inventory!",
            details: error?.response?.data || error.message,
        });
    }
}

export async function getInteresteddonordata() {
    try {
        const { data } = await axios.get(`/api/getInterestedDonorData`);
        return Promise.resolve({ data });
    } catch (error) {
        return Promise.reject({
            error: "Failed to fetch Interested Donor Data!",
            details: error?.response?.data || error.message,
        });
    }
}

export async function getUnderScreeningdonordata() {
    try {
        const { data } = await axios.get(`/api/getunderscreeningdonordata`, { headers: { Authorization: `Bearer ${token}` } });
        return Promise.resolve({ data });
    } catch (error) {
        return Promise.reject({
            error: "Failed to fetch Interested Donor Data!",
            details: error?.response?.data || error.message,
        });
    }
}

export async function AddUnderScreeningDonorData(credentials) {
    try {
        if (!token) {
            throw new Error('Authentication token is missing.');
        }

        const {
            email,
            weight,
            bloodPressure,
            temperature,
            eligibilityStatus,
        } = credentials;

        // Validate required fields
        if (!email || !weight || !bloodPressure || !temperature || !eligibilityStatus) {
            throw new Error('All fields are required.');
        }

        const { data } = await axios.post(
            '/api/donorscreening',
            {
                email,
                weight,
                bloodPressure,
                temperature,
                eligibilityStatus,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Return the response data
        return Promise.resolve(data);
    } catch (error) {
        console.error('Error recording donor screening:', error);

        // Extract a meaningful error message if available
        const message = error?.response?.data?.error || error.message;
        return Promise.reject({ error: message });
    }
}

export async function getUnderScreeningForDonationDetails() {
    try {
        if (!token) {
            throw new Error('Authentication token is missing.');
        }

        const { data } = await axios.get('/api/under-screening', {
            headers: { Authorization: `Bearer ${token}` },
        });

        return Promise.resolve(data);
    } catch (error) {
        console.error('Error fetching under-screening donation details:', error);
        const message = error?.response?.data?.error || error.message;
        return Promise.reject({ error: message });
    }
}

export async function addDonationDetails(credentials) {
    try {
        if (!token) {
            throw new Error('Authentication token is missing.');
        }

        const { donorId, donationDate, volume, donationType, doctorName } = credentials;

        // Validate required fields
        if (!donorId || !donationDate || !volume || !donationType || !doctorName) {
            throw new Error('All fields are required.');
        }

        const { data } = await axios.post('/api/addDonationDetails', credentials, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return Promise.resolve(data);
    } catch (error) {
        console.error('Error adding donation details:', error);
        const message = error?.response?.data?.error || error.message;
        return Promise.reject({ error: message });
    }
}

export async function getDonationDetails() {
    try {
        const { data } = await axios.get('/api/get-donation-details', {
            headers: { Authorization: `Bearer ${token}` },
        });

        return Promise.resolve(data);
    } catch (error) {
        console.error('Error fetching donation details:', error);
        const message = error?.response?.data?.error || error.message;
        return Promise.reject({ error: message });
    }
}

export async function updateBloodRequestStatusHelper(credentials) {
    try {
        const { requestId, donorEmail, status } = credentials;

        if (!requestId || !donorEmail || !status) {
            throw new Error('Request ID, donor email, and status are required.');
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token is missing.');
        }

        const { data } = await axios.post(
            '/api/updatebloodrequeststatus',
            { requestId, donorEmail, status },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Return the response data
        return Promise.resolve(data);
    } catch (error) {
        console.error('Error updating blood request status:', error);

        // Extract a meaningful error message if available
        const message = error?.response?.data?.error || error.message;
        return Promise.reject({ error: message });
    }
}

export async function updateMasterBloodDonationHelper(credentials) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token is missing.');
        }

        const {
            email,
            donorId,
            donationId,
        } = credentials;

        if (!email) {
            throw new Error('Email and bloodBankId are required.');
        }

        const { data } = await axios.post(
            '/api/updatemasterblood',
            {
                email,
                donorId,
                donationId
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Return the response data
        return Promise.resolve(data);
    } catch (error) {
        console.error('Error updating MasterBloodDonation record:', error);

        // Extract a meaningful error message if available
        const message = error?.response?.data?.error || error.message;
        return Promise.reject({ error: message });
    }
}