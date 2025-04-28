import React from 'react';
import '../Styles/Login.css'; // Import your CSS file for styling
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useFormik } from "formik";
import { passwordValidate } from "../Helper/Validate";
import { useAuthStore } from "../Helper/store";
import { login } from "../Helper/helper";
import login1 from "/uploads/app/logo.svg?url";
import {jwtDecode} from 'jwt-decode'; // Import the default export


const BloodBankLogin = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth); // Assuming `useAuthStore` has a `setAuth` method

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validate: passwordValidate,
        validateOnBlur: false,
        validateOnChange: false,
        onSubmit: async (values) => {
            const { email, password } = values;
            let loginPromise = login({ email, password });

            toast.promise(loginPromise, {
                loading: "Validating credentials...",
                success: <b>Login Successfully...!</b>,
                error: <b>Invalid email or password!</b>,
            });

            loginPromise.then((res) => {
                let { token } = res.data;
                localStorage.setItem("token", token);

                // Decode the token to extract role
                const decodedToken = jwtDecode(token);
                const userRole = decodedToken.authorizedPersonRole;

                // Store role in global state
                setAuth({ isAuthenticated: true, role: userRole });

                console.log(res.data);
                navigate("/blood-admin/Dashboard");
            }).catch((err) => {
                console.error("Login failed:", err);
            });
        },
    });

    return (
        <div className="login-container">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="login-card">
                <div className="logo-container">
                    <div className="logo">
                        <img src={login1} width="120%" height="120%" alt="Logo" />
                    </div>
                </div>

                <h1>Blood Bank Admin</h1>
                <p className="subtitle">Sign in to your dashboard</p>

                <form onSubmit={formik.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            required
                        />
                    </div>

                    <div className="form-options">
                        <div className="remember-me">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={formik.values.rememberMe}
                                onChange={() => formik.setFieldValue('rememberMe', !formik.values.rememberMe)}
                            />
                            <label htmlFor="remember">Remember me</label>
                        </div>
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div>

                    <button type="submit" className="sign-in-btn">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5M7.5 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86502 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86502C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9001 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86502 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H7.5" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Sign in</span>
                    </button>
                </form>

                <div className="footer">
                    &copy; 2025 Hayaat-e-Attiya. All Rights Reserved.
                </div>
            </div>
        </div>
    );
};

export default BloodBankLogin;