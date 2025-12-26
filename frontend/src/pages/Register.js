import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/config"; 
import emailjs from '@emailjs/browser'; // Đảm bảo đã chạy: npm install @emailjs/browser

// 🎨 LUXURY STYLES
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
        fontFamily: "'Inter', serif",
    },
    formContainer: {
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        backgroundColor: DARK_BG,
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        textAlign: 'center',
    },
    heading: {
        color: ROYAL_COLOR,
        marginBottom: '25px',
        fontSize: '1.8rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    formGroup: {
        marginBottom: '18px',
        textAlign: 'left',
    },
    label: {
        color: TEXT_COLOR,
        display: 'block',
        marginBottom: '8px',
        fontSize: '0.85rem',
        fontWeight: '600'
    },
    inputStyle: {
        width: '100%',
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid #334155',
        backgroundColor: INPUT_BG,
        color: '#fff',
        fontSize: '1rem',
        boxSizing: 'border-box',
        outline: 'none',
    },
    buttonStyle: {
        width: '100%',
        padding: '14px',
        backgroundColor: ROYAL_COLOR,
        color: DARK_BG,
        border: 'none',
        borderRadius: '8px',
        fontWeight: '800',
        cursor: 'pointer',
        fontSize: '1rem',
        marginTop: '15px',
        transition: 'all 0.3s ease',
    },
    linkText: {
        marginTop: '25px',
        color: TEXT_COLOR,
        fontSize: '0.9rem'
    },
    errorText: {
        color: '#f87171', 
        marginTop: '15px',
        fontSize: '0.9rem'
    }
};

function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ✅ KHỞI TẠO EMAILJS VỚI PUBLIC KEY CỦA BẠN
    useEffect(() => {
        emailjs.init("seajRlYP6YCpKbOZQ");
    }, []);

    const REGISTER_ENDPOINT = "/auth/register";

    // ✅ HÀM GỬI EMAIL CHÀO MỪNG (Đã sửa tên biến khớp với Template {{name}} {{email}})
    const sendWelcomeEmail = (targetEmail, targetName) => {
        const templateParams = {
            name: targetName,   // Khớp với {{name}} trong Template
            email: targetEmail, // Khớp với {{email}} trong Template
            message: "Chào mừng bạn đã gia nhập hệ thống Luxury Hotel!",
            join_date: new Date().toLocaleDateString('vi-VN')
        };

        emailjs.send(
            'service_iyu6lx9', // Service ID mới của bạn
            'template_a41466', // Template ID từ ảnh của bạn
            templateParams
        )
        .then((res) => {
            console.log("SUCCESS! Email chào mừng đã gửi.", res.status, res.text);
        })
        .catch((err) => {
            console.error("FAILED... Không thể gửi email.", err);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password || !email) {
            setError("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);

        try {
            // 1. Gửi yêu cầu đăng ký lên Server của bạn
            const response = await axiosClient.post(REGISTER_ENDPOINT, { username, password, email });

            // 2. Lưu thông tin đăng nhập vào Local Storage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('username', response.data.username);

            // 3. GỬI EMAIL CHÀO MỪNG TỰ ĐỘNG
            sendWelcomeEmail(email, username);

            // 4. Đồng bộ trạng thái và chuyển trang
            window.dispatchEvent(new Event('auth-change'));
            alert("Đăng ký thành công! Một thư chào mừng đã được gửi tới " + email);
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
                <h2 style={styles.heading}>Đăng Ký Thành Viên</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Tên đăng nhập</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            style={styles.inputStyle}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Địa chỉ Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@gmail.com"
                            style={styles.inputStyle}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={styles.inputStyle}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            style={styles.inputStyle}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    {error && <p style={styles.errorText}>{error}</p>}

                    <button
                        type="submit"
                        style={{
                            ...styles.buttonStyle,
                            opacity: loading ? 0.7 : 1
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ NGAY'}
                    </button>
                </form>

                <p style={styles.linkText}>
                    Bạn đã có tài khoản?{' '}
                    <Link to="/login" style={{ color: ROYAL_COLOR, textDecoration: 'none', fontWeight: 'bold' }}>
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
