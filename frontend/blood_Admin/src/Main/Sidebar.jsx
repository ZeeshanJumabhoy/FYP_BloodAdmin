import React from "react";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from "@trendmicro/react-sidenav";
import login1 from "/uploads/app/logo.svg?url";
import { useAuthStore } from "../Helper/store";

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: true
        };
    }

    handleToggle = () => {
        const newVisibility = !this.state.isVisible;
        this.setState({ isVisible: newVisibility });

        // Notify parent component about the toggle state
        if (this.props.onToggle) {
            this.props.onToggle(newVisibility);
        }
    };

    render() {
        const role = useAuthStore.getState().auth.role; // Get the user's role from the global state

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100vh",
                    width: this.state.isVisible ? "240px" : "64px", // Adjust width dynamically
                    transition: "width 0.3s ease", // Smooth transition for width
                    backgroundColor: "#f44336", // Blood theme (red)
                    boxShadow: "2px 0 5px rgba(0,0,0,0.3)",
                    borderRadius: "15px",
                    overflow: "hidden",
                    zIndex: 1000,
                }}
            >
                <SideNav
                    expanded={this.state.isVisible}
                    style={{
                        height: "100%",
                        backgroundColor: "transparent", // Use transparent to inherit the wrapper's background
                    }}
                >
                    {/* Logo at the top */}
                    <div
                        style={{
                            padding: "20px",
                            textAlign: "center",
                            transition: "all 0.3s ease", // Smooth transition for logo adjustments
                        }}
                    >
                        <a href="/">
                            <img
                                src={login1}
                                alt="Blood Bank Logo"
                                style={{
                                    width: this.state.isVisible ? "80px" : "40px", // Adjust size dynamically
                                    height: this.state.isVisible ? "80px" : "40px", // Keep it square
                                    borderRadius: "50%",
                                    transition: "all 0.3s ease", // Smooth transition for size
                                }}
                            />
                        </a>
                    </div>

                    <SideNav.Toggle onClick={this.handleToggle} />

                    <SideNav.Nav defaultSelected="dashboard">
                        <NavItem eventKey="dashboard">
                            <NavIcon>
                                <i className="fa fa-tachometer" style={{ fontSize: "1.75em", color: "#fff" }} />
                            </NavIcon>
                            <NavText>Dashboard</NavText>
                        </NavItem>

                        {/* Conditionally render options based on role */}
                        {role === "Receptionist" && (
                            <>
                                <NavItem eventKey="donors">
                                    <NavIcon>
                                        <i className="fa fa-user-plus" style={{ fontSize: "1.75em", color: "#fff" }} />
                                    </NavIcon>
                                    <NavText>Donors</NavText>
                                </NavItem>
                                <NavItem eventKey="Campaign" onClick={() => window.location.href = "/blood-admin/Campaign"}>
                                    <NavIcon>
                                        <i className="fa fa-bullhorn" style={{ fontSize: "1.75em", color: "#fff" }} />
                                    </NavIcon>
                                    <NavText>Campaign</NavText>
                                </NavItem>
                                <NavItem eventKey="AppointmentScheduler" onClick={() => window.location.href = "/blood-admin/AppointmentScheduler"}>
                                    <NavIcon>
                                        <i className="fa fa-user-plus" style={{ fontSize: "1.75em", color: "#fff" }} />
                                    </NavIcon>
                                    <NavText>AppointmentScheduler</NavText>
                                </NavItem>
                                <NavItem eventKey="AddBloodInventory" onClick={() => window.location.href = "/blood-admin/AddBloodInventory"}>
                                    <NavIcon>
                                        <i className="fa fa-user-plus" style={{ fontSize: "1.75em", color: "#fff" }} />
                                    </NavIcon>
                                    <NavText>Add Blood Inventory</NavText>
                                </NavItem>
                                <NavItem eventKey="BloodRequestDonor" onClick={() => window.location.href = "/blood-admin/BloodRequestDonor"}>
                                    <NavIcon>
                                        <i className="fa fa-user-plus" style={{ fontSize: "1.75em", color: "#fff" }} />
                                    </NavIcon>
                                    <NavText>Blood Requests</NavText>
                                </NavItem>
                            
                            </>

                        )}

                        {(role === "Doctor" || role === "Laboratory Head") && (
                            <>
                                <NavItem eventKey="bloodRequests">
                                    <NavIcon>
                                        <i className="fa fa-heartbeat" style={{ fontSize: "1.75em", color: "#fff" }} />
                                    </NavIcon>
                                    <NavText>Blood Requests</NavText>
                                </NavItem>
                                <NavItem eventKey="inventory">
                                    <NavIcon>
                                        <i className="fa fa-medkit" style={{ fontSize: "1.75em", color: "#fff" }} />
                                    </NavIcon>
                                    <NavText>Inventory</NavText>
                                </NavItem>
                                <NavItem eventKey="DonorUnderScreening" onClick={() => window.location.href = "/blood-admin/DonorUnderScreening"}>
                                    <NavIcon>
                                        <i className="fa fa-user-plus" style={{ fontSize: "1.75em", color: "#fff" }} />
                                    </NavIcon>
                                    <NavText>Donor Under Screening</NavText>
                                </NavItem>
                                <NavItem eventKey="AddDonationDetails" onClick={() => window.location.href = "/blood-admin/AddDonationDetails"}>
                                    <NavIcon>
                                        <i className="fa fa-user-plus" style={{ fontSize: "1.75em", color: "#fff" }} />
                                    </NavIcon>
                                    <NavText>Add Donation Details</NavText>
                                </NavItem>
                                <NavItem eventKey="GetDonationDetails" onClick={() => window.location.href = "/blood-admin/GetDonationDetails"}>
                                    <NavIcon>
                                        <i className="fa fa-user-plus" style={{ fontSize: "1.75em", color: "#fff" }} />
                                    </NavIcon>
                                    <NavText>Donation Details</NavText>
                                </NavItem>
                            </>
                        )}

                        <NavItem eventKey="settings">
                            <NavIcon>
                                <i className="fa fa-cogs" style={{ fontSize: "1.75em", color: "#fff" }} />
                            </NavIcon>
                            <NavText>Settings</NavText>
                        </NavItem>
                    </SideNav.Nav>
                </SideNav>
            </div>
        );
    }
}

export default Sidebar;