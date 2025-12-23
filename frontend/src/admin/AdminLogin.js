import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Đã thay thế bằng axiosClient
import axiosClient from "../api/config"; 
import { FaUserShield, FaLock } from 'react-icons/fa';

// 🎨 CÁC HẰNG SỐ THEME
const ROYAL_COLOR = "#f3c300"; 
const DARK_BG = "#0f172a"; 
const LIGHT_BG = "#f9f9ff"; 
const ERROR_COLOR = "#e8491d";

function AdminLogin() {
    // 📱 Check Mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 480);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const navigate = useNavigate();

// <<<<<<< HEAD
//     const API_ADMIN_LOGIN = "https://my-backend-mocha-phi.vercel.app/api/admin/auth/login";
// =======
    // 💡 Chỉ cần định nghĩa endpoint, Base URL đã có trong axiosClient
    const ADMIN_LOGIN_ENDPOINT = "/admin/auth/login";


    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoginError(null);

        try {
            // SỬ DỤNG axiosClient
            const res = await axiosClient.post(ADMIN_LOGIN_ENDPOINT, credentials);
            
            const { token } = res.data; 
            
            // Lưu token riêng cho admin để tránh xung đột với user thường (nếu hệ thống yêu cầu)
            localStorage.setItem('adminToken', token);
            // Vẫn lưu vào 'token' nếu axiosClient của bạn đang lấy header từ key 'token'
            localStorage.setItem('token', token); 
            
            navigate('/admin/dashboard'); 
        } catch (err) {
            console.error("Lỗi đăng nhập Admin:", err.response?.data?.message || err.message);
            setLoginError(err.response?.data?.message || "Tên đăng nhập hoặc mật khẩu quản trị không đúng.");
        } finally {
            setLoading(false);
        }
    };

    // 📝 STYLES
    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: LIGHT_BG,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'serif',
            padding: isMobile ? '20px' : '0',
        },
        loginBox: {
            width: isMobile ? '100%' : '400px',
            padding: isMobile ? '30px 20px' : '40px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderTop: `5px solid ${ROYAL_COLOR}`,
            boxSizing: 'border-box',
        },
        heading: { fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 'bold', color: DARK_BG, marginBottom: '10px' },
        subText: { color: '#666', marginBottom: '30px', fontSize: '0.9rem' },
        formGroup: { marginBottom: '15px', textAlign: 'left', position: 'relative' },
        icon: { position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: ROYAL_COLOR, fontSize: '1.1rem' },
        inputStyle: { 
            width: '100%', padding: '12px 12px 12px 40px', borderRadius: '4px', 
            border: `1px solid #ddd`, boxSizing: 'border-box', 
            fontSize: '16px' 
        },
        loginButton: { 
            width: '100%', padding: '12px', marginTop: '20px', border: 'none', borderRadius: '4px', 
            backgroundColor: DARK_BG, color: ROYAL_COLOR, fontWeight: 'bold', fontSize: '1.1rem', 
            cursor: 'pointer', transition: 'background-color 0.3s, color 0.3s' 
        },
        errorText: { color: ERROR_COLOR, marginTop: '10px', fontSize: '0.9rem', fontWeight: 'bold' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <FaUserShield size={40} color={ROYAL_COLOR} style={{ marginBottom: '15px' }} />
                <h2 style={styles.heading}>Đăng Nhập Quản Trị</h2>
                <p style={styles.subText}>Truy cập khu vực quản trị viên hệ thống.</p>

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <FaUserShield style={styles.icon} />
                        <input
                            type="text" name="username" placeholder="Tên đăng nhập Admin"
                            value={credentials.username} onChange={handleChange}
                            style={styles.inputStyle} required disabled={loading}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <FaLock style={styles.icon} />
                        <input
                            type="password" name="password" placeholder="Mật khẩu"
                            value={credentials.password} onChange={handleChange}
                            style={styles.inputStyle} required disabled={loading}
                        />
                    </div>

                    {loginError && <p style={styles.errorText}>{loginError}</p>}

                    <button
                        type="submit" style={styles.loginButton} disabled={loading}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = ROYAL_COLOR;
                            e.currentTarget.style.color = DARK_BG;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = DARK_BG;
                            e.currentTarget.style.color = ROYAL_COLOR;
                        }}
                    >
                        {loading ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
