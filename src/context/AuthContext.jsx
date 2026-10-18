import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kisanlink_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default logged-in demo user matching wireframe
    return {
      name: "Ram Singh",
      phone: "+91 98765 43321",
      displayPhone: "+91 98*** **321",
      location: "Meerut Mandi, Uttar Pradesh",
      farmSize: "4.5 Acres",
      crops: ["Wheat", "Tomato", "Potato"]
    };
  });

  const [otpSent, setOtpSent] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');

  const sendOtp = (phone) => {
    setPendingPhone(phone);
    setOtpSent(true);
    return true;
  };

  const verifyOtp = (otp) => {
    // Mock OTP verification (accept any 4 or 6 digit code or "1234")
    if (otp && otp.length >= 4) {
      const newUser = {
        name: "Ram Singh",
        phone: pendingPhone || "+91 98765 43321",
        displayPhone: "+91 98*** **321",
        location: "Meerut Mandi, UP",
        farmSize: "4.5 Acres",
        crops: ["Wheat", "Tomato"]
      };
      setUser(newUser);
      localStorage.setItem('kisanlink_user', JSON.stringify(newUser));
      setOtpSent(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kisanlink_user');
  };

  return (
    <AuthContext.Provider value={{ user, otpSent, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
