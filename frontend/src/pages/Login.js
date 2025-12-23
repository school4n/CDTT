import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import axios from "axios"; // Đã thay bằng axiosClient
import axiosClient from "../api/config"; 

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

    // 💡 URL giờ đây cực kỳ ngắn gọn vì đã có baseURL trong axiosClient
    const LOGIN_ENDPOINT = "/auth/login";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError("Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.");
            return;
        }

        setLoading(true);

        try {
            // Sử dụng axiosClient thay cho axios trực tiếp
            const response = await axiosClient.post(LOGIN_ENDPOINT, { username, password });

            // 💾 Lưu thông tin vào Local Storage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('username', response.data.username); 

            // 📢 Kích hoạt sự kiện để Navbar/Sidebar cập nhật giao diện ngay lập tức
            window.dispatchEvent(new Event('auth-change')); 
            
            alert("Đăng nhập thành công!");
            navigate('/'); 

        } catch (err) {
            // Xử lý lỗi tập trung hơn
            const errorMessage = err.response?.data?.message || "Sai tên đăng nhập hoặc mật khẩu.";
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