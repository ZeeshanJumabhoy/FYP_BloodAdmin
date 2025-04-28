import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { appointmentavailability, getAllAppointmentSchedules } from '../Helper/helper';
import { FiSave, FiPlusCircle, FiTrash2, FiClock, FiCalendar, FiUsers, FiRefreshCw } from 'react-icons/fi';
import '../Styles/AppointmentScheduler.css';

const AppointmentScheduler = () => {
  // Days of the week
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Available time slots (24-hour format)
  const availableTimes = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 9; // Starting from 9 AM (9) to 9 PM (21)
    return {
      value: `${String(hour).padStart(2, '0')}:00`,
      label: `${hour <= 12 ? hour : hour - 12}:00 ${hour < 12 ? 'AM' : 'PM'}`
    };
  });

  // State for the schedule
  const [schedule, setSchedule] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing schedule on component mount
  useEffect(() => {
    fetchAppointmentSchedule();
  }, []);

  // Fetch appointment schedule from the server
  const fetchAppointmentSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await getAllAppointmentSchedules();
      
      if (response?.data?.schedule && response.data.schedule.length > 0) {
        // Map the received schedule to our state format
        const receivedSchedule = response.data.schedule;
        
        // Initialize all days first
        const initialSchedule = daysOfWeek.map(day => {
          // Find this day in the received schedule
          const daySchedule = receivedSchedule.find(item => item.day === day);
          
          if (daySchedule) {
            // Day exists in the received schedule
            return {
              day,
              timeSlots: daySchedule.timeSlots.map(slot => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
                maxAppointments: slot.maxAppointments,
                bookedAppointments: slot.bookedAppointments || 0
              })),
              isActive: true
            };
          } else {
            // Day does not exist in received schedule
            return {
              day,
              timeSlots: [],
              isActive: false
            };
          }
        });
        
        setSchedule(initialSchedule);
        toast.success("Appointment schedule loaded successfully");
      } else {
        // If no schedule data, initialize with empty days
        const initialSchedule = daysOfWeek.map(day => ({
          day,
          timeSlots: [],
          isActive: false
        }));
        setSchedule(initialSchedule);
      }
    } catch (error) {
      console.error("Error fetching appointment schedule:", error);
      toast.error("Failed to load appointment schedule");
      
      // Initialize with empty days on error
      const initialSchedule = daysOfWeek.map(day => ({
        day,
        timeSlots: [],
        isActive: false
      }));
      setSchedule(initialSchedule);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle day selection
  const handleDayToggle = (index) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index].isActive = !updatedSchedule[index].isActive;
    
    // If deactivating and there were time slots, remove them
    if (!updatedSchedule[index].isActive) {
      updatedSchedule[index].timeSlots = [];
    } else if (updatedSchedule[index].timeSlots.length === 0) {
      // If activating and no time slots, add a default one
      updatedSchedule[index].timeSlots = [{
        startTime: "09:00",
        endTime: "17:00",
        maxAppointments: 10,
        bookedAppointments: 0
      }];
    }
    
    setSchedule(updatedSchedule);
  };

  // Add a new time slot to a day
  const addTimeSlot = (dayIndex) => {
    const updatedSchedule = [...schedule];
    
    // Find the latest end time to use as new start time
    const timeSlots = updatedSchedule[dayIndex].timeSlots;
    let startTime = "09:00";
    let endTime = "10:00";
    
    if (timeSlots.length > 0) {
      const lastSlot = timeSlots[timeSlots.length - 1];
      startTime = lastSlot.endTime;
      
      // Calculate end time (add 1 hour)
      const hour = parseInt(startTime.split(':')[0]);
      endTime = hour < 21 ? `${String(hour + 1).padStart(2, '0')}:00` : "21:00";
    }
    
    updatedSchedule[dayIndex].timeSlots.push({
      startTime,
      endTime,
      maxAppointments: 10,
      bookedAppointments: 0
    });
    
    setSchedule(updatedSchedule);
  };

  // Remove a time slot from a day
  const removeTimeSlot = (dayIndex, slotIndex) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].timeSlots.splice(slotIndex, 1);
    
    // If removing the last time slot, deactivate the day
    if (updatedSchedule[dayIndex].timeSlots.length === 0) {
      updatedSchedule[dayIndex].isActive = false;
    }
    
    setSchedule(updatedSchedule);
  };

  // Update time slot fields
  const updateTimeSlot = (dayIndex, slotIndex, field, value) => {
    const updatedSchedule = [...schedule];
    
    if (field === 'startTime' || field === 'endTime') {
      updatedSchedule[dayIndex].timeSlots[slotIndex][field] = value;
      
      // Ensure end time is after start time
      const { startTime, endTime } = updatedSchedule[dayIndex].timeSlots[slotIndex];
      if (startTime >= endTime) {
        // Calculate new end time (start time + 1 hour)
        const hour = parseInt(startTime.split(':')[0]);
        const newEndTime = hour < 21 ? `${String(hour + 1).padStart(2, '0')}:00` : "21:00";
        updatedSchedule[dayIndex].timeSlots[slotIndex].endTime = newEndTime;
      }
    } else {
      updatedSchedule[dayIndex].timeSlots[slotIndex][field] = parseInt(value);
    }
    
    setSchedule(updatedSchedule);
  };

  // Prepare and submit the schedule
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Filter active days and format data according to API requirements
      const filteredSchedule = schedule
        .filter(day => day.isActive && day.timeSlots.length > 0)
        .map(({ day, timeSlots }) => ({
          day,
          timeSlots: timeSlots.map(({ startTime, endTime, maxAppointments, bookedAppointments }) => ({
            startTime,
            endTime,
            maxAppointments,
            bookedAppointments: bookedAppointments || 0
          }))
        }));
      
      if (filteredSchedule.length === 0) {
        toast.error("Please set up at least one day with time slots");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare request payload
      const payload = { schedule: filteredSchedule };
      
      // Submit schedule via helper function
      const response = await appointmentavailability(payload);
      
      toast.success("Appointment schedule saved successfully");
      
    } catch (error) {
      toast.error(error.message || "Failed to save appointment schedule");
      console.error("Error submitting schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total appointments for the entire week
  const calculateTotalAppointments = () => {
    return schedule.reduce((total, day) => {
      return total + day.timeSlots.reduce((dayTotal, slot) => {
        return dayTotal + (slot.maxAppointments || 0);
      }, 0);
    }, 0);
  };

  // Calculate total booked appointments for the entire week
  const calculateTotalBookedAppointments = () => {
    return schedule.reduce((total, day) => {
      return total + day.timeSlots.reduce((dayTotal, slot) => {
        return dayTotal + (slot.bookedAppointments || 0);
      }, 0);
    }, 0);
  };

  // Format time value for display (12-hour format)
  const formatTimeForDisplay = (time24h) => {
    const [hours] = time24h.split(':');
    const hour = parseInt(hours);
    return `${hour <= 12 ? hour : hour - 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
  };

  return (
    <div className="appointment-scheduler-container">
      <Toaster position="top-right" />
      
      <div className="scheduler-header">
        <div className="header-top">
          <h1>Appointment Schedule Management</h1>
          <button 
            className="refresh-button"
            onClick={fetchAppointmentSchedule}
            disabled={isLoading}
            title="Refresh schedule data"
          >
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
        <p className="subtitle">Configure your blood donation appointment availability</p>
        
        <div className="schedule-summary">
          <div className="summary-item">
            <FiCalendar className="summary-icon" />
            <div className="summary-content">
              <span className="summary-label">Active Days</span>
              <span className="summary-value">{schedule.filter(day => day.isActive).length}</span>
            </div>
          </div>
          
          <div className="summary-item">
            <FiClock className="summary-icon" />
            <div className="summary-content">
              <span className="summary-label">Time Slots</span>
              <span className="summary-value">
                {schedule.reduce((total, day) => total + day.timeSlots.length, 0)}
              </span>
            </div>
          </div>
          
          <div className="summary-item">
            <FiUsers className="summary-icon" />
            <div className="summary-content">
              <span className="summary-label">Available/Total</span>
              <span className="summary-value">
                {calculateTotalBookedAppointments()}/{calculateTotalAppointments()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="schedule-instructions">
        <h2>How to Set Your Schedule</h2>
        <ol>
          <li>Select the days your blood bank will be available for appointments</li>
          <li>For each day, specify time slots and the maximum number of appointments</li>
          <li>Review your schedule and click Save Changes when done</li>
        </ol>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading appointment schedule...</p>
        </div>
      ) : (
        <div className="schedule-container">
          {schedule.map((day, dayIndex) => (
            <div key={day.day} className={`day-schedule ${day.isActive ? 'active' : 'inactive'}`}>
              <div 
                className="day-header" 
                onClick={() => handleDayToggle(dayIndex)}
              >
                <h3>{day.day}</h3>
                <div className="day-toggle">
                  <span className="toggle-label">{day.isActive ? 'Active' : 'Inactive'}</span>
                  <div className={`toggle-switch ${day.isActive ? 'on' : 'off'}`}>
                    <div className="toggle-handle"></div>
                  </div>
                </div>
              </div>
              
              {day.isActive && (
                <>
                  <div className="time-slots">
                    <div className="time-slots-header">
                      <span className="slot-label">Time Range</span>
                      <span className="slot-label">Max. Appointments</span>
                      <span className="slot-label">Booked</span>
                      <span className="slot-action">Actions</span>
                    </div>
                    
                    {day.timeSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="time-slot">
                        <div className="slot-times">
                          <select
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'startTime', e.target.value)}
                            className="time-select"
                          >
                            {availableTimes.slice(0, -1).map(time => (
                              <option key={`start-${time.value}`} value={time.value}>
                                {time.label}
                              </option>
                            ))}
                          </select>
                          <span className="time-separator">to</span>
                          <select
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'endTime', e.target.value)}
                            className="time-select"
                          >
                            {availableTimes.slice(1).filter(time => time.value > slot.startTime).map(time => (
                              <option key={`end-${time.value}`} value={time.value}>
                                {time.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="slot-appointments">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={slot.maxAppointments}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'maxAppointments', e.target.value)}
                            className="appointments-input"
                          />
                        </div>
                        
                        <div className="slot-booked">
                          <span className="booked-value">{slot.bookedAppointments || 0}</span>
                        </div>
                        
                        <div className="slot-actions">
                          <button 
                            className="remove-slot-button"
                            onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="add-slot-container">
                    <button 
                      className="add-slot-button"
                      onClick={() => addTimeSlot(dayIndex)}
                    >
                      <FiPlusCircle className="add-icon" />
                      Add Time Slot
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="schedule-actions">
        <button 
          className="cancel-button"
          onClick={() => window.location.reload()}
        >
          Reset
        </button>
        <button 
          className="save-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="button-spinner"></span>
          ) : (
            <>
              <FiSave className="save-icon" />
              Save Schedule
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
