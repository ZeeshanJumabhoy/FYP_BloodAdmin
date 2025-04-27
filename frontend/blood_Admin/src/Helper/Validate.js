import toast from 'react-hot-toast';


// Updated registerValidation function
export async function registerValidation(values) {
    const errors = {};
    firstNameVerify(errors, values);
    lastNameVerify(errors, values);
    phoneNumberVerify(errors, values);
    cnicVerify(errors, values);
    emailVerify(errors, values);
    ageVerify(errors, values);
    passwordVerify(errors, values, true); 
    bloodGroupVerify(errors, values);
    usernameVerif(errors, values);
    return errors;
}

function usernameVerif(error = {}, values) {
    const validRegex = /^[A-Za-z0-9_]+$/;

    if (!values.username) {
        error.username = toast.error('Username is required...!');
    } else if (!validRegex.test(values.username)) {
        toastWarn('Only alphanumeric characters and underscores are allowed in username');
        error.username = toast.error('Invalid Username...!');
    }
    return error;
}

// First Name Validation
function firstNameVerify(error = {}, values) {
    if (!values.firstName) {
        error.firstName = "First Name is required!";
        toast.error('First Name is required...!');
    }
    return error;
}
 
// Last Name Validation
function lastNameVerify(error = {}, values) {
    if (!values.lastName) {
        error.lastName = "Last Name is required!";
        toast.error('Last Name is required...!');
    }
    return error;
}

// Phone Number Validation
function phoneNumberVerify(error = {}, values) {  
    const phoneRegex = /^\+92 3\d{9}$/;
    if (!values.phoneNumber) {  
        error.phoneNumber = "Phone Number is required!";
        toast.error('Phone Number is required...!');  
    } else if (!phoneRegex.test(values.phoneNumber)) {  
        error.phoneNumber = "Invalid Phone Number!";
        toast.error('Invalid Phone Number...!');  
    }  
    return error;  
}

// Email Validation
function emailVerify(error = {}, values) {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (!values.email) {
        error.email = "Email is required!";
        toast.error('Email is Required...!');
    }
    return error;
}
// CNIC Validation
function cnicVerify(error = {}, values) {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!values.cnic) {
        error.cnic = "CNIC is required!";
        toast.error('CNIC is required...!');
    } else if (!cnicRegex.test(values.cnic)) {
        error.cnic = "Invalid CNIC format!";
        toast.error('Invalid CNIC format...!');
    }
    return error;
}

// Age Validation
function ageVerify(error = {}, values) {
    if (!values.age) {
        error.age = "Age is required!";
        toast.error('Age is required...!');
    } else if (isNaN(values.age) || values.age <= 0) {
        error.age = "Invalid Age!";
        toast.error('Invalid Age...!');
    }
    return error;
}

// Blood Group Validation
function bloodGroupVerify(error = {}, values) {
    const validBloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
    if (!values.bloodGroup) {
        error.bloodGroup = "Blood Group is required!";
        toast.error('Blood Group is required...!');
    } else if (!validBloodGroups.includes(values.bloodGroup)) {
        error.bloodGroup = "Invalid Blood Group!";
        toast.error('Invalid Blood Group...!');
    }
    return error;
}

export async function useremailValidate(values) {
    const errors = usernameVerify({}, values);
    return errors;
}

export async function passwordValidate(values) {
    const errors = passwordVerify({}, values);
    return errors;
}

export async function resetPasswordValidation(values) {
    const errors = passwordVerify({}, values, true);
    return errors;
}

// Username Validation
function usernameVerify(error = {}, values) {
    const validRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (!values.username) {
        error.username = "Email is required!";
        toast.error('Email is required...!');
    } else if (!validRegex.test(values.username)) {
        error.username = "Invalid Email!";
        toast.error('Invalid Email...!');
    }
    return error;
}

// Password Validation
function passwordVerify(errors = {}, values, confirm = false) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (!values.password) {
        errors.password = "Password is required!";
        toast.error('Password is Required...!');
    } else if (values.password.includes(' ')) {
        errors.password = "Password cannot contain white spaces.";
        toast.error('Password cannot contain white spaces.');
    } else if (values.password.length < 8) {
        errors.password = "Password must be more than 8 characters long.";
        toast.error('Password must be more than 8 characters long.');
    } else if (!specialChars.test(values.password)) {
        errors.password = "Password must have special character.";
        toast.error('Password must have special character.');
    } else if (confirm && values.password !== values.confirm_password) {
        errors.confirm_password = "Passwords do not match!";
        toast.error('Password does not match...!');
    }
    return errors;
} 

export async function requestBloodValidation(values) {
    const errors = {};

    patientNameVerify(errors, values);
    bloodGroupVerify(errors, values);
    unitsVerify(errors, values);
    weightVerify(errors, values);
    specialRequirementsVerify(errors, values);
    medicalReasonVerify(errors, values);
    urgencyVerify(errors, values);
    bloodComponentTypeVerify(errors, values);
    allergiesAndReactionsVerify(errors, values);
    transfusionDateTimeVerify(errors, values);

    return errors;
}

// Patient Name Validation
function patientNameVerify(error = {}, values) {
    if (!values.patientName) {
        error.patientName = "Patient Name is required!";
        toast.error('Patient Name is required...!');
    }
    return error;
}

// Units Validation
function unitsVerify(error = {}, values) {
    if (values.units === undefined || values.units < 1 || values.units > 10) {
        error.units = "Units must be between 1 and 10!";
        toast.error('Units must be between 1 and 10!');
    }
    return error;
}

// Weight Validation
function weightVerify(error = {}, values) {
    if (values.weight === undefined || values.weight <= 0) {
        error.weight = "Weight must be a positive number!";
        toast.error('Weight must be a positive number!');
    }
    return error;
}

// function antibodiesVerify(error = {}, values) {
//     const validBloodGroups = ['None','Anti-A', 'Anti-B', 'Anti-D', 'Anti-A and Anti-B', 'Anti-A, Anti-D', 'Anti-B, Anti-D', 'Anti-A and Anti-B, Anti-D'];
//      if (!validBloodGroups.includes(values.bloodGroup)) {
//         error.bloodGroup = "Invalid Antibodies!";
//         toast.error('Invalid Antibodies...!');
//     }
//     return error;
// }

// Special Requirements Validation
function specialRequirementsVerify(error = {}, values) {
    const validRequirements = [
        'None', 'Irradiated Blood', 'Leukocyte Reduced',
        'Washed Blood', 'CMV-Negative Blood',
        'HLA-Matched Platelets', 'Fresh Blood (<5 Days Old)'
    ];

    // Check if any special requirement is selected
    if (values.specialRequirements.length === 0) {
        error.specialRequirements = "At least one special requirement must be selected!";
        toast.error('At least one special requirement must be selected!');
    } else {
        // Validate selected requirements against valid requirements
        const invalidRequirements = values.specialRequirements.filter(req => !validRequirements.includes(req));
        if (invalidRequirements.length > 0) {
            error.specialRequirements = "Invalid special requirements selected!";
            toast.error('Invalid special requirements selected!');
        }
    }

    return error;
}



// Medical Reason Validation
function medicalReasonVerify(error = {}, values) {
    const validReasons = [
        'Anemia', 'Trauma/Emergency Surgery', 'Elective Surgery', 'Cancer Treatment',
        'Organ Transplant', 'Burn Treatment', 'Bleeding Disorder (e.g., Hemophilia)',
        'Pregnancy/Childbirth Complications', 'Heart Surgery', 'Liver Disease',
        'Kidney Disease', 'Neonatal Transfusion', 'Other'
    ];
    if (!values.medicalReason) {
        error.medicalReason = "Medical Reason is required!";
        toast.error('Medical Reason is required...!');
    } else if (!validReasons.includes(values.medicalReason)) {
        error.medicalReason = "Invalid Medical Reason!";
        toast.error('Invalid Medical Reason!');
    } else if (values.medicalReason === 'Other' && !values.otherMedicalReason) {
        error.otherMedicalReason = "Please specify the medical reason!";
        toast.error('Other Medical Reason is required!');
    }
    return error;
}

// Urgency Validation
function urgencyVerify(error = {}, values) {
    const validUrgency = ['Emergency', 'Urgent', 'Routine'];
    if (!values.urgency) {
        error.urgency = "Urgency is required!";
        toast.error('Urgency is required...!');
    } else if (!validUrgency.includes(values.urgency)) {
        error.urgency = "Invalid Urgency!";
        toast.error('Invalid Urgency!');
    }
    return error;
}

// Blood Component Type Validation
function bloodComponentTypeVerify(error = {}, values) {
    const validComponents = [
        'Whole Blood', 'Red Blood Cells (RBCs)', 'Platelets', 'Plasma',
        'Cryoprecipitate', 'Granulocytes'
    ];
    if (!values.bloodComponentType) {
        error.bloodComponentType = "Blood Component Type is required!";
        toast.error('Blood Component Type is required...!');
    } else if (!validComponents.includes(values.bloodComponentType)) {
        error.bloodComponentType = "Invalid Blood Component Type!";
        toast.error('Invalid Blood Component Type!');
    }
    return error;
}

// Allergies and Reactions Validation
function allergiesAndReactionsVerify(error = {}, values) {
    if (values.allergiesAndReactions && typeof values.allergiesAndReactions !== 'string') {
        error.allergiesAndReactions = "Allergies and Reactions must be a string!";
        toast.error('Invalid format for Allergies and Reactions!');
    }
    return error;
}

// // Hospital Information Validation
// function hospitalVerify(error = {}, values) {
//     if (!values.Hospital || !values.Hospital.patientId) {
//         error.patientId = "Patient ID is required!";
//         toast.error('Patient ID is required!');
//     }
//     return error;
// }

// Transfusion Date and Time Validation
function transfusionDateTimeVerify(error = {}, values) {
    const currentDate = new Date();
    if (!values.transfusionDateTime) {
        error.transfusionDateTime = "Transfusion date and time is required!";
        toast.error('Transfusion date and time is required!');
    } else if (new Date(values.transfusionDateTime) <= currentDate) {
        error.transfusionDateTime = "Transfusion date and time must be in the future!";
        toast.error('Invalid Transfusion date and time!');
    }
    return error;
}

export function checkEligibility(error = {}, values = {}) {
    // Ensure that `answers` exists and contains all required properties
    const answers = values || {};

    // Check General Health
    if (
        answers?.feelingToday === "Not feeling well" ||
        answers?.recentSymptoms !== "None of the above" ||
        answers?.pastMonth !== "None of the above"
    ) {
        error.generalHealth = "Ineligible due to general health issues.";
        return error;
    }

    // Check Medical History
    if (
        answers?.medication === "Yes" ||
        answers?.diagnosed !== "No" ||
        answers?.surgeries === "Yes" ||
        answers?.transplant === "Yes"
    ) {
        error.medicalHistory = "Ineligible due to medical history issues.";
        return error;
    }

    // Check Lifestyle and Risk Factors
    if (
        answers?.tattoo === "Yes" ||
        answers?.riskFactors !== "None of the above" ||
        answers?.travel === "Yes" ||
        answers?.smoke === "Yes, daily" ||
        answers?.alcohol === "5 or more drinks"
    ) {
        error.lifestyle = "Ineligible due to lifestyle risk factors.";
        return error;
    }

    // Check Eligibility Confirmation
    if (
        answers?.pregnant === "Yes" ||
        answers?.weight === "underweight" ||
        answers?.medicalExam === "No" ||
        answers?.confirmation === "No"
    ) {
        error.eligibilityConfirmation = "Ineligible due to eligibility confirmation issues.";
        return error;
    }

    return true; // Eligible
}

