import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserShield, FaLock } from 'react-icons/fa';

// 🎨 CÁC HẰNG SỐ THEME
const ROYAL_COLOR = "#f3c300"; // Màu vàng cam chủ đạo
const DARK_BG = "#0f172a"; // Màu nền tối
const LIGHT_BG = "#f9f9ff"; // Nền nhẹ
const TEXT_COLOR = "#333"; 
const BORDER_COLOR_DARK = "#3c475d"; // Màu viền cho input tối
const ERROR_COLOR = "#e8491d";

// 📝 STYLES RIÊNG CHO TRANG ADMIN LOGIN
const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: LIGHT_BG,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'serif',
    },
    loginBox: {
        width: '400px',
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        textAlign: 'center',
        borderTop: `5px solid ${ROYAL_COLOR}`,
    },
    heading: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: DARK_BG,
        marginBottom: '10px',
    },
    subText: {
        color: '#666',
        marginBottom: '30px',
        fontSize: '0.9rem',
    },
    formGroup: {
        marginBottom: '15px',
        textAlign: 'left',
        position: 'relative',
    },
    icon: {
        position: 'absolute',
        top: '50%',
        left: '15px',
        transform: 'translateY(-50%)',
        color: ROYAL_COLOR,
        fontSize: '1.1rem',
    },
    inputStyle: {
        width: '100%',
        padding: '12px 12px 12px 40px', // Thêm padding cho icon
        borderRadius: '4px',
        border: `1px solid #ddd`,
        boxSizing: 'border-box',
        fontSize: '1rem',
    },
    loginButton: {
        width: '100%',
        padding: '12px',
        marginTop: '20px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: DARK_BG,
        color: ROYAL_COLOR,
        fontWeight: 'bold',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s, color 0.3s',
    },
    errorText: {
        color: ERROR_COLOR,
        marginTop: '10px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
    }
};

function AdminLogin() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const navigate = useNavigate();

    const API_ADMIN_LOGIN = "https://my-backend-mocha-phi.vercel.app/api/admin/auth/login";

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoginError(null);

        try {
            const res = await axios.post(API_ADMIN_LOGIN, credentials);
            
            // Giả định API trả về token và chuyển hướng
            const { token } = res.data; 
            
            // 1. Lưu token (Tốt nhất là dùng session storage hoặc secure cookie cho admin)
            localStorage.setItem('adminToken', token);
            
            // 2. Chuyển hướng đến trang dashboard admin
            navigate('/admin/dashboard'); 

        } catch (err) {
            console.error("Lỗi đăng nhập Admin:", err.response?.data?.message || err.message);
            setLoginError(err.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <FaUserShield size={40} color={ROYAL_COLOR} style={{ marginBottom: '15px' }} />
                <h2 style={styles.heading}>Đăng Nhập Quản Trị</h2>
                <p style={styles.subText}>Truy cập khu vực quản trị viên hệ thống.</p>

                <form onSubmit={handleSubmit}>
                    
                    {/* Username */}
                    <div style={styles.formGroup}>
                        <FaUserShield style={styles.icon} />
                        <input
                            type="text"
                            name="username"
                            placeholder="Tên đăng nhập Admin"
                            value={credentials.username}
                            onChange={handleChange}
                            style={styles.inputStyle}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Password */}
                    <div style={styles.formGroup}>
                        <FaLock style={styles.icon} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Mật khẩu"
                            value={credentials.password}
                            onChange={handleChange}
                            style={styles.inputStyle}
                            required
                            disabled={loading}
                        />
                    </div>

                    {loginError && <p style={styles.errorText}>{loginError}</p>}

                    <button
                        type="submit"
                        style={styles.loginButton}
                        disabled={loading}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ROYAL_COLOR}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = DARK_BG}
                    >
                        {loading ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
