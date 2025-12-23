import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import axios from "axios"; // Đã thay thế bằng axiosClient
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

function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 💡 Endpoint ngắn gọn
    const REGISTER_ENDPOINT = "/auth/register";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password || !email) {
            setError("Vui lòng nhập đầy đủ Tên đăng nhập, Email và Mật khẩu.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);

        try {
            // Sử dụng axiosClient
            const response = await axiosClient.post(REGISTER_ENDPOINT, { username, password, email });

            // 💾 Lưu thông tin xác thực vào Local Storage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('username', response.data.username);

            // 📢 Kích hoạt sự kiện để đồng bộ trạng thái đăng nhập toàn trang
            window.dispatchEvent(new Event('auth-change'));
            
            alert("Đăng ký thành công! Bạn đã được đăng nhập.");
            navigate('/'); 

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.formContainer}>
                <h2 style={styles.heading}>ĐĂNG KÝ TÀI KHOẢN MỚI</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={{ color: TEXT_COLOR, display: 'block', marginBottom: '5px' }}>
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Tên đăng nhập (Username)"
                            style={styles.inputStyle}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={{ color: TEXT_COLOR, display: 'block', marginBottom: '5px' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Địa chỉ Email"
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
                    
                    <div style={styles.formGroup}>
                        <label style={{ color: TEXT_COLOR, display: 'block', marginBottom: '5px' }}>
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu"
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
                        {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
                    </button>
                </form>

                <p style={styles.linkText}>
                    Đã có tài khoản?{' '}
                    <Link to="/login" style={{ color: ROYAL_COLOR, textDecoration: 'none', fontWeight: 'bold' }}>
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;