import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 🎨 CÁC ĐỊNH NGHĨA STYLE

const ROYAL_COLOR = "#f3c300"; // Màu vàng cam chủ đạo
const DARK_BG = "#0f172a"; // Màu nền tối

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // { username: '...' } hoặc null

    const styles = {
        // --- Container chung ---
        navbarContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fff', 
            padding: '15px 40px',
            borderBottom: '1px solid #ddd',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            fontFamily: 'serif',
        },
        
        // --- Logo ---
        navbarLogo: {
            fontSize: '26px',
            fontWeight: '700',
            color: DARK_BG, 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        logoIcon: {
            fontSize: '30px',
            color: ROYAL_COLOR,
        },

        // --- Danh sách liên kết và Nút hành động ---
        navLinks: {
            listStyle: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            margin: 0,
            padding: 0,
        },
        
        // --- Liên kết chung ---
        navLink: {
            textDecoration: 'none',
            color: DARK_BG,
            fontWeight: 500,
            fontSize: '16px',
            padding: '5px 0',
            transition: 'color 0.3s ease',
        },
        
        // --- Nút hành động (Đăng nhập/Đăng xuất) ---
        actionButton: {
            backgroundColor: ROYAL_COLOR, 
            color: DARK_BG, 
            padding: '8px 15px',
            borderRadius: '4px',
            transition: 'background-color 0.3s ease',
            textDecoration: 'none',
            fontWeight: 'bold',
        },
        
        // --- Tên người dùng ---
        userName: {
            color: DARK_BG,
            fontWeight: 'bold',
            marginRight: '10px',
            fontSize: '16px',
            cursor: 'default',
        },
    };

    // Hàm kiểm tra trạng thái đăng nhập
    const checkAuthStatus = () => {
        const storedUsername = localStorage.getItem('username'); 
        if (storedUsername) {
            setUser({ username: storedUsername });
        } else {
            setUser(null);
        }
    };

    // useEffect Lắng nghe sự kiện
    useEffect(() => {
        // Chạy lần đầu khi component mount
        checkAuthStatus();

        // 🎯 Lắng nghe sự kiện tùy chỉnh từ Login/Register để cập nhật trạng thái
        window.addEventListener('auth-change', checkAuthStatus);

        // Cleanup: xóa listener khi component unmount
        return () => {
            window.removeEventListener('auth-change', checkAuthStatus);
        };
    }, []); 

    // XỬ LÝ ĐĂNG XUẤT
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        setUser(null); // Cập nhật trạng thái ngay lập tức
        alert("Đã đăng xuất thành công!");
        navigate('/login'); 
    };

    // Helper components (giữ nguyên logic hover)
    const ActionLink = ({ to, onClick, children }) => (
        <Link 
            to={to} 
            onClick={onClick}
            style={styles.actionButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d6ad00'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ROYAL_COLOR}
        >
            {children}
        </Link>
    );

    const NavItemLink = ({ to, children }) => (
        <Link 
            to={to} 
            style={styles.navLink}
            onMouseEnter={(e) => e.currentTarget.style.color = ROYAL_COLOR}
            onMouseLeave={(e) => e.currentTarget.style.color = DARK_BG}
        >
            {children}
        </Link>
    );

    return (
        <nav style={styles.navbarContainer}>
            {/* Logo */}
            <Link to="/" style={styles.navbarLogo}>
                <span role="img" aria-label="hotel-icon" style={styles.logoIcon}>🏨</span> Hotel Booking
            </Link>
            
            {/* Các liên kết và Nút hành động */}
            <ul style={styles.navLinks}>
                <li>
                    <NavItemLink to="/">Trang chủ</NavItemLink>
                </li>
                <li>
                    <NavItemLink to="/rooms">Phòng & Khách sạn</NavItemLink>
                </li>
                 <li>
                    <NavItemLink to="/about">Giới Thiệu</NavItemLink>
                </li>
                 <li>
                    <NavItemLink to="/contact">Liên Hệ</NavItemLink>
                </li>
                <li>
                    <NavItemLink to="/bookings">Lịch Sử Đặt Phòng</NavItemLink>
                </li>
                {/* CONDITIONAL RENDERING */}
                {user ? (
                    <>
                        <li style={{display: 'flex', alignItems: 'center'}}>
                            {/* Tên người dùng */}
                            <span style={styles.userName}>
                                Xin chào, {user.username}!
                            </span>
                            {/* Nút Đăng xuất */}
                            <ActionLink to="#" onClick={handleLogout}>
                                Đăng xuất
                            </ActionLink>
                        </li>
                    </>
                ) : (
                    <li>
                        {/* Nút Đăng nhập */}
                        <ActionLink to="/login">
                            Đăng nhập
                        </ActionLink>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;