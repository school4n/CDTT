import React, { useState } from 'react';
// 🚨 NHẬP THÊM: useLocation và useNavigate từ React Router DOM
// Đảm bảo bạn đã cài đặt: npm install react-router-dom
import { useLocation, useNavigate } from 'react-router-dom'; 

// Dữ liệu menu
const adminMenuItems = [
    { title: 'Thống Kê', path: '/admin/dashboard', icon: '📊' },
    { 
        title: 'Đặt Phòng', 
        icon: '🏨',
        children: [
            { title: 'Phòng Mới Đặt', path: '/admin/bookings/new' },
            { title: 'Xác Nhận Thanh Toán', path: '/admin/bookings/payment' },
            { title: 'Hồ Sơ Đặt Phòng', path: '/admin/bookings/history' },
        ]
    },
    { title: 'Khách Hàng', path: '/admin/users', icon: '🧑' },
    { title: 'Đánh Giá', path: '/admin/reviews', icon: '⭐' },
    { title: 'Phòng', path: '/admin/rooms', icon: '🚪' },
    { title: 'Cơ Sở và Trang Thiết Bị', path: '/admin/facilities', icon: '🛠️' },
];

// Định nghĩa CSS Styles dưới dạng đối tượng JavaScript
const styles = {
    sidebar: {
        width: '250px',
        backgroundColor: '#212529',
        color: '#f8f9fa',
        height: '100vh', 
        padding: '0 0 20px 0',
        fontFamily: 'Arial, sans-serif',
        position: 'fixed',
        left: 0,
        top: 0,
        boxShadow: '2px 0 5px rgba(0,0,0,0.5)',
        zIndex: 1000,
    },
    header: {
        padding: '20px',
        borderBottom: '1px solid #495057'
    },
    hotelName: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '5px',
        cursor: 'pointer', // Cho phép click vào logo/tên
    },
    adminTitle: {
        fontSize: '18px',
        color: '#adb5bd',
        fontWeight: 'normal',
        letterSpacing: '2px',
    },
    menuContainer: {
        paddingTop: '10px'
    },
    menuItem: {
        base: {
            padding: '12px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            transition: 'background-color 0.15s',
        },
        hover: {
            backgroundColor: '#343a40'
        }
    },
    icon: {
        marginRight: '10px',
    },
    dropdownArrow: {
        position: 'absolute',
        right: '20px',
        fontSize: '10px'
    },
    dropdown: {
        backgroundColor: '#343a40',
    },
    dropdownItem: {
        base: {
            padding: '10px 20px 10px 40px',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
        },
        selected: {
            backgroundColor: '#007bff',
            color: 'white',
            fontWeight: 'bold',
        },
        hover: {
            backgroundColor: '#0056b3'
        }
    }
};

const AdminSidebar = () => {
    // 🚨 SỬ DỤNG HOOKS CỦA REACT ROUTER DOM
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname; // Lấy đường dẫn hiện tại

    // State để kiểm soát menu con "Đặt Phòng" có đang mở không
    // Cập nhật logic: mở nếu bất kỳ con nào của nó là đường dẫn hiện tại
    const [isBookingDropdownOpen, setIsBookingDropdownOpen] = useState(
        adminMenuItems.some(item => 
            item.children && item.children.some(child => child.path === currentPath)
        )
    );
    // State để quản lý hover cho các item menu cha
    const [hoveredItem, setHoveredItem] = useState(null);
    // State để quản lý hover cho các item menu con
    const [hoveredChildItem, setHoveredChildItem] = useState(null);


    const toggleBookingDropdown = (title) => {
        if (title === 'Đặt Phòng') {
            setIsBookingDropdownOpen(!isBookingDropdownOpen);
        }
    };
    
    // 🚨 HÀM XỬ LÝ CHUYỂN TRANG THỰC TẾ
    const handleNavigation = (path) => {
        // Sử dụng navigate để chuyển trang
        navigate(path);
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.header}>
                {/* 🚨 THÊM TÊN HOTEL VÀ CHO PHÉP CLICK VỀ TRANG CHỦ ADMIN */}
                <h1 
                    style={styles.hotelName}
                    onClick={() => handleNavigation('/admin/dashboard')} // Hoặc '/admin'
                >
                    ThaiTruongAnn Hotel
                </h1>
                <h2 style={styles.adminTitle}>ADMIN</h2>
            </div>
            
            <div style={styles.menuContainer}>
                {adminMenuItems.map((item) => {
                    const isItemActive = item.path === currentPath;
                    const isHovered = hoveredItem === item.title;

                    return (
                        <React.Fragment key={item.title}>
                            {/* Menu Cha */}
                            <div
                                style={{
                                    ...styles.menuItem.base,
                                    ...(isItemActive && !item.children ? styles.dropdownItem.selected : {}), // Đánh dấu item cha là active nếu nó không phải dropdown
                                    ...(!isItemActive && isHovered ? styles.menuItem.hover : {})
                                }}
                                onClick={() => {
                                    toggleBookingDropdown(item.title);
                                    if (!item.children) {
                                        handleNavigation(item.path);
                                    }
                                }}
                                onMouseEnter={() => setHoveredItem(item.title)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                {item.icon && <span style={styles.icon}>{item.icon}</span>}
                                <span>{item.title}</span>
                                {item.children && <span style={styles.dropdownArrow}>{isBookingDropdownOpen ? '▲' : '▼'}</span>}
                            </div>

                            {/* Menu Con (Dropdown) */}
                            {item.children && isBookingDropdownOpen && item.title === 'Đặt Phòng' && (
                                <div style={styles.dropdown}>
                                    {item.children.map((child) => {
                                        const isSelected = child.path === currentPath;
                                        const isChildHovered = hoveredChildItem === child.title;

                                        return (
                                            <div
                                                key={child.title}
                                                style={{
                                                    ...styles.dropdownItem.base,
                                                    ...(isSelected ? styles.dropdownItem.selected : {}),
                                                    ...(!isSelected && isChildHovered ? styles.dropdownItem.hover : {})
                                                }}
                                                onClick={() => handleNavigation(child.path)} // 🚨 GỌI navigate
                                                onMouseEnter={() => setHoveredChildItem(child.title)}
                                                onMouseLeave={() => setHoveredChildItem(null)}
                                            >
                                                {child.title}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminSidebar;