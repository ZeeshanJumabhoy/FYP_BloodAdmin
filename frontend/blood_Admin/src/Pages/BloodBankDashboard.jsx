import React, { useEffect, useState, useRef } from 'react';
import '../Styles/Dashboard.css'; // Import your CSS file for styling

// This would be replaced with actual data from your API in the future
const dashboardData = {
  totalDonations: {
    count: 1278,
    period: 'This Month'
  },
  activeDonors: {
    count: 286,
    period: 'All-Time'
  },
  scheduledAppointments: {
    count: 76,
    period: 'Today'
  },
  bloodUnitsAvailable: {
    count: 192,
    period: 'Inventory'
  },
  recentActivities: [
    { 
      date: '2024-06-09', 
      activity: 'Donation', 
      donor: 'Sarah Deepak', 
      status: 'Completed', 
      statusType: 'success',
      details: 'Whole Blood, O+' 
    },
    { 
      date: '2024-06-08', 
      activity: 'Appointment Scheduled', 
      donor: 'Agil Hassan', 
      status: 'Booked', 
      statusType: 'success',
      details: 'DD-124, 09:00AM' 
    },
    { 
      date: '2024-06-06', 
      activity: 'Campaign Created', 
      donor: 'Admin', 
      status: 'Upcoming', 
      statusType: 'warning',
      details: 'City Mall' 
    },
    { 
      date: '2024-06-05', 
      activity: 'Transfusion', 
      donor: 'Patient #112', 
      status: 'Critical', 
      statusType: 'danger',
      details: 'RBC - Emergency' 
    }
  ]
};

// Sample data for charts - would come from API
const donationTrends = [
  { month: 'Jan', count: 110 },
  { month: 'Feb', count: 180 },
  { month: 'Mar', count: 170 },
  { month: 'Apr', count: 150 },
  { month: 'May', count: 200 },
  { month: 'Jun', count: 195 }
];

const bloodGroupInventory = [
  { group: 'A+', value: 30, color: '#e63946' },
  { group: 'B-', value: 10, color: '#457b9d' },
  { group: 'O-', value: 5, color: '#2a9d8f' },
  { group: 'AB+', value: 15, color: '#e9c46a' },
  { group: 'B+', value: 40, color: '#3d5a80' }
];

const BloodBankDashboard = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [activeDonutSegment, setActiveDonutSegment] = useState(null);
  const trendsCanvasRef = useRef(null);
  const donutCanvasRef = useRef(null);
  const trendsContainerRef = useRef(null);
  const donutContainerRef = useRef(null);

  // Function to handle window resize for responsive charts
  useEffect(() => {
    const handleResize = () => {
      drawDonationTrendsChart();
      drawBloodGroupChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to draw the line chart for donations trend
  const drawDonationTrendsChart = () => {
    const canvas = trendsCanvasRef.current;
    if (!canvas) return;
    
    const container = trendsContainerRef.current;
    if (!container) return;
    
    // Set canvas dimensions to match container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = (i * width) / 6;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (i * height) / 5;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
    
    // Find max value for scaling
    const maxValue = Math.max(...donationTrends.map(item => item.count));
    const padding = 30; // Space for labels
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    
    // Store points for hover detection
    const dataPoints = [];
    
    donationTrends.forEach((item, index) => {
      const x = padding + ((index) * (width - padding * 2) / (donationTrends.length - 1));
      // Scale to 80% of height to leave margin at top and bottom
      const y = height - padding - ((item.count / maxValue) * (height - padding * 2));
      
      dataPoints.push({ x, y, value: item.count, month: item.month });
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Add dots at each data point
    dataPoints.forEach((point) => {
      ctx.beginPath();
      ctx.fillStyle = '#e63946';
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Add x-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '10px Nunito Sans';
    ctx.textAlign = 'center';
    dataPoints.forEach((point) => {
      ctx.fillText(point.month, point.x, height - 10);
    });
    
    // Add y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = height - padding - (i * (height - padding * 2) / 5);
      ctx.fillText((maxValue * i / 5).toFixed(0), padding - 5, y + 3);
    }
    
    // Store data points for hover detection
    canvas.dataPoints = dataPoints;
  };
  
  // Function to draw the donut chart for blood group inventory
  const drawBloodGroupChart = () => {
    const canvas = donutCanvasRef.current;
    if (!canvas) return;
    
    const container = donutContainerRef.current;
    if (!container) return;
    
    // Set canvas dimensions (keep it square but fit within container)
    const containerSize = Math.min(container.clientWidth, container.clientHeight);
    const size = Math.min(containerSize, 250); // Max size of 250px
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.6;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate total value
    const total = bloodGroupInventory.reduce((sum, item) => sum + item.value, 0);
    
    // Draw donut segments
    let startAngle = -Math.PI / 2;
    const segments = [];
    
    bloodGroupInventory.forEach(item => {
      const sliceAngle = (item.value / total) * (2 * Math.PI);
      const endAngle = startAngle + sliceAngle;
      
      // Store segment data for hover detection
      segments.push({
        startAngle,
        endAngle,
        color: item.color,
        group: item.group,
        value: item.value,
        percentage: ((item.value / total) * 100).toFixed(1)
      });
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = item.color;
      ctx.fill();
      
      startAngle = endAngle;
    });
    
    // Draw a white circle in the center
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // Store segments data for hover detection
    canvas.segments = segments;
    canvas.centerX = centerX;
    canvas.centerY = centerY;
    canvas.radius = radius;
    canvas.innerRadius = innerRadius;
  };

  // Handle mouse move for tooltips on donation trends chart
  const handleTrendsMouseMove = (e) => {
    const canvas = trendsCanvasRef.current;
    if (!canvas || !canvas.dataPoints) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is near any data point
    const point = canvas.dataPoints.find(point => {
      const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
      return distance < 20; // Detection radius
    });
    
    if (point) {
      setActiveTooltip({
        x: point.x,
        y: point.y,
        content: `${point.month}: ${point.value} donations`
      });
    } else {
      setActiveTooltip(null);
    }
  };
  
  // Handle mouse move for tooltips on blood group chart
  const handleDonutMouseMove = (e) => {
    const canvas = donutCanvasRef.current;
    if (!canvas || !canvas.segments) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate distance from center and angle
    const dx = x - canvas.centerX;
    const dy = y - canvas.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if mouse is within donut area
    if (distance > canvas.innerRadius && distance < canvas.radius) {
      // Calculate angle
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += 2 * Math.PI;
      
      // Adjust angle to match our starting point (top)
      angle = (angle + Math.PI / 2) % (2 * Math.PI);
      
      // Find segment that contains this angle
      const segment = canvas.segments.find(seg => {
        // Normalize angles for comparison
        const start = seg.startAngle < 0 ? seg.startAngle + 2 * Math.PI : seg.startAngle;
        const end = seg.endAngle < 0 ? seg.endAngle + 2 * Math.PI : seg.endAngle;
        return angle >= start && angle <= end;
      });
      
      if (segment) {
        setActiveDonutSegment({
          group: segment.group,
          value: segment.value,
          percentage: segment.percentage,
          color: segment.color,
          x, y
        });
      } else {
        setActiveDonutSegment(null);
      }
    } else {
      setActiveDonutSegment(null);
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setActiveTooltip(null);
    setActiveDonutSegment(null);
  };

  useEffect(() => {
    drawDonationTrendsChart();
    drawBloodGroupChart();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Stats Cards Row */}
      <div className="stats-container">
        <div className="stat-card donations">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#e63946" fill="none">
              <path d="M12 2L8 6H12L10 10L18 3L14 18L8 14L12 22L12 15L6 12H12V2Z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Donations</h3>
            <div className="stat-value">{dashboardData.totalDonations.count.toLocaleString()}</div>
            <div className="stat-period">{dashboardData.totalDonations.period}</div>
          </div>
        </div>
        
        <div className="stat-card donors">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#e63946" fill="none">
              <circle cx="9" cy="7" r="4" />
              <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              <circle cx="19" cy="9" r="3" />
              <path d="M15 15a3 3 0 0 1 6 0v2" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Active Donors</h3>
            <div className="stat-value">{dashboardData.activeDonors.count.toLocaleString()}</div>
            <div className="stat-period">{dashboardData.activeDonors.period}</div>
          </div>
        </div>
        
        <div className="stat-card appointments">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#e63946" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="2" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Scheduled Appointments</h3>
            <div className="stat-value">{dashboardData.scheduledAppointments.count.toLocaleString()}</div>
            <div className="stat-period">{dashboardData.scheduledAppointments.period}</div>
          </div>
        </div>
        
        <div className="stat-card blood-units">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#e63946" fill="none">
              <path d="M14 11h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1z" />
              <path d="M14 5v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2z" />
              <path d="M12 8L12 11" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Blood Units Available</h3>
            <div className="stat-value">{dashboardData.bloodUnitsAvailable.count.toLocaleString()}</div>
            <div className="stat-period">{dashboardData.bloodUnitsAvailable.period}</div>
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Donation Trends</h3>
            <span className="chart-period">Last 6 Months</span>
          </div>
          <div 
            className="chart-content trends-chart"
            ref={trendsContainerRef}
            onMouseMove={handleTrendsMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <canvas ref={trendsCanvasRef}></canvas>
            {activeTooltip && (
              <div 
                className="chart-tooltip" 
                style={{ 
                  left: `${activeTooltip.x}px`, 
                  top: `${activeTooltip.y - 40}px`
                }}
              >
                {activeTooltip.content}
              </div>
            )}
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-header">
            <h3>Blood Group Inventory</h3>
            <span className="chart-period">Current Stock</span>
          </div>
          <div 
            className="chart-content donut-container"
            ref={donutContainerRef}
            onMouseMove={handleDonutMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <canvas ref={donutCanvasRef}></canvas>
            {activeDonutSegment && (
              <div 
                className="chart-tooltip donut-tooltip" 
                style={{ 
                  left: `${activeDonutSegment.x}px`, 
                  top: `${activeDonutSegment.y - 40}px`,
                  borderColor: activeDonutSegment.color
                }}
              >
                <span style={{ color: activeDonutSegment.color }}>
                  {activeDonutSegment.group}:
                </span> 
                {activeDonutSegment.value} units ({activeDonutSegment.percentage}%)
              </div>
            )}
            <div className="chart-legend">
              {bloodGroupInventory.map((item, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                  <span className="legend-label">{item.group}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activities Table */}
      <div className="activities-container">
        <h3>Recent Activities</h3>
        <div className="activities-table">
          <div className="table-header">
            <div className="table-col" data-label="Date">Date</div>
            <div className="table-col" data-label="Activity">Activity</div>
            <div className="table-col" data-label="Donor">Donor</div>
            <div className="table-col" data-label="Status">Status</div>
            <div className="table-col" data-label="Details">Details</div>
          </div>
          
          {dashboardData.recentActivities.map((activity, index) => (
            <div key={index} className="table-row">
              <div className="table-col" data-label="Date">{formatDate(activity.date)}</div>
              <div className="table-col" data-label="Activity">{activity.activity}</div>
              <div className="table-col" data-label="Donor">{activity.donor}</div>
              <div className="table-col" data-label="Status">
                <span className={`status-badge ${activity.statusType}`}>
                  {activity.status}
                </span>
              </div>
              <div className="table-col detail-col" data-label="Details">{activity.details}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0].replace(/-/g, '-');
};

export default BloodBankDashboard;
