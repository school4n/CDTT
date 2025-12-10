import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// 🎨 CÁC ĐỊNH NGHĨA STYLE (Giữ nguyên)
const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";
const LIGHT_BG = "#f0f2f5"; 
const INPUT_BG = "#1e293b";
const TEXT_COLOR = "#ccc";

const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: LIGHT_BG,
        fontFamily: "serif",
    },
    formContainer: {
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        backgroundColor: DARK_BG,
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        textAlign: 'center',
    },
    heading: {
        color: ROYAL_COLOR,
        marginBottom: '25px',
        fontSize: '2rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    formGroup: {
        marginBottom: '20px',
        textAlign: 'left',
    },
    inputStyle: {
        width: '100%',
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid #333',
        backgroundColor: INPUT_BG,
        color: TEXT_COLOR,
        fontSize: '1rem',
        boxSizing: 'border-box',
    },
    buttonStyle: {
        width: '100%',
        padding: '12px 20px',
        backgroundColor: ROYAL_COLOR,
        color: DARK_BG,
        border: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '1.1rem',
        marginTop: '10px',
        transition: 'background-color 0.3s ease',
    },
    linkText: {
        marginTop: '20px',
        color: TEXT_COLOR,
    },
    errorText: {
        color: '#e8491d', 
        marginTop: '15px',
    },
};

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = "http://localhost:3001/api/auth/login";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError("Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(API_URL, { username, password });

            // 💾 LƯU username VÀO Local Storage (Đã đúng)
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('username', response.data.username); 

            // 📢 KÍCH HOẠT SỰ KIỆN để Navbar cập nhật trạng thái
            window.dispatchEvent(new Event('auth-change')); 
            
            alert("Đăng nhập thành công!");
            
            navigate('/'); 

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Đã xảy ra lỗi không xác định.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.formContainer}>
                <h2 style={styles.heading}>ĐĂNG NHẬP HỆ THỐNG</h2>
                
                <form onSubmit={handleSubmit}>
                    
                    <div style={styles.formGroup}>
                        <label style={{ color: TEXT_COLOR, display: 'block', marginBottom: '5px' }}>
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập"
                            style={styles.inputStyle}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={{ color: TEXT_COLOR, display: 'block', marginBottom: '5px' }}>
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            style={styles.inputStyle}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    {error && <p style={styles.errorText}>{error}</p>}

                    <button
                        type="submit"
                        style={styles.buttonStyle}
                        disabled={loading}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d6ad00'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = ROYAL_COLOR}
                    >
                        {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>

                <p style={styles.linkText}>
                    Chưa có tài khoản?{' '}
                    <Link to="/register" style={{ color: ROYAL_COLOR, textDecoration: 'none', fontWeight: 'bold' }}>
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;