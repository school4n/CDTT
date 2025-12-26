import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/config"; 
import emailjs from '@emailjs/browser'; 

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
        // FIX CSS WARNING: Tách biệt hoàn toàn marginTop và margin
        marginTop: '15px',
        marginLeft: '0px',
        marginRight: '0px',
        marginBottom: '0px',
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

    useEffect(() => {
        emailjs.init("seajRlYP6YCpKbOZQ");
    }, []);

    const sendWelcomeEmail = (targetEmail, targetName) => {
        // Cấu trúc data gửi đi phải KHỚP 100% với Template trên Web
        const templateParams = {
            name: targetName,  
            email: targetEmail 
        };

        emailjs.send(
            'service_iyu6lx9', 
            'template_a41466', 
            templateParams
        )
        .then((res) => {
            console.log("SUCCESS!", res.status, res.text);
        })
        .catch((err) => {
            // Log chi tiết lỗi để xem server báo gì
            console.error("FAILED... Chi tiết lỗi:", err);
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
            const response = await axiosClient.post("/auth/register", { username, password, email });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('username', response.data.username);

            // Gửi mail sau khi lưu DB thành công
            sendWelcomeEmail(email, username);

            window.dispatchEvent(new Event('auth-change'));
            alert("Đăng ký thành công! Vui lòng kiểm tra email.");
            navigate('/'); 

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Đăng ký thất bại.";
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
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" style={styles.inputStyle} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Địa chỉ Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" style={styles.inputStyle} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mật khẩu</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.inputStyle} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Xác nhận mật khẩu</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={styles.inputStyle} required />
                    </div>
                    {error && <p style={styles.errorText}>{error}</p>}
                    <button type="submit" style={styles.buttonStyle} disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ NGAY'}
                    </button>
                </form>
                <p style={styles.linkText}>Đã có tài khoản? <Link to="/login" style={{ color: ROYAL_COLOR, textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập</Link></p>
            </div>
        </div>
    );
}

export default Register;
