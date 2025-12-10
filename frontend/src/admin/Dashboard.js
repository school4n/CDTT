// Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_STATS_URL = 'http://localhost:3001/api/admin/dashboard/stats'; 
const ADMIN_TOKEN = localStorage.getItem('adminToken'); // Giả định token được lưu

// Định nghĩa Styles cho các thẻ thống kê
const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Grid 3 cột
        gap: '20px',
    },
    card: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        transition: 'transform 0.2s',
        borderLeft: '5px solid', // Đường viền màu
    },
    title: {
        fontSize: '16px',
        color: '#6c757d',
        margin: '0 0 10px 0',
    },
    value: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: 0,
    }
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRooms: 0,
        totalFacilities: 0,
        totalRevenue: 0,
        newBookings: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axios.get(API_STATS_URL, {
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`
                    }
                });
                setStats(response.data);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi tải thống kê:", err);
                setError("Không thể tải dữ liệu thống kê. Vui lòng kiểm tra kết nối Server.");
            } finally {
                setLoading(false);
            }
        };

        if (ADMIN_TOKEN) {
            fetchStats();
        } else {
            setError("Vui lòng đăng nhập Admin để xem thống kê.");
            setLoading(false);
        }
    }, []);

    if (loading) return <div style={styles.container}>Đang tải thống kê...</div>;
    if (error) return <div style={{ ...styles.container, color: 'red' }}>Lỗi: {error}</div>;

    // Định dạng tiền tệ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND', 
            minimumFractionDigits: 0 
        }).format(value);
    };

    // Danh sách các thẻ thống kê
    const statCards = [
        { title: "Tổng Doanh Thu", value: formatCurrency(stats.totalRevenue), color: '#28a745', icon: '💰' },
        { title: "Tổng Số Khách Hàng", value: stats.totalUsers, color: '#007bff', icon: '🧑' },
        { title: "Tổng Số Phòng", value: stats.totalRooms, color: '#ffc107', icon: '🚪' },
        { title: "Đơn Đặt Mới (Confirmed)", value: stats.newBookings, color: '#dc3545', icon: '🆕' },
        { title: "Tổng Số Tiện Nghi", value: stats.totalFacilities, color: '#17a2b8', icon: '🛠️' },
    ];

    return (
        <div style={styles.container}>
            <h2>📊 Bảng Điều Khiển Quản Trị</h2>
            <hr />
            <div style={styles.grid}>
                {statCards.map((card, index) => (
                    <div 
                        key={index} 
                        style={{ ...styles.card, borderColor: card.color }}
                        // Thêm hiệu ứng hover (cần sử dụng useState/onMouseEnter/onMouseLeave để làm việc này hiệu quả với inline styles)
                    >
                        <p style={styles.title}>{card.icon} {card.title}</p>
                        <p style={{ ...styles.value, color: card.color }}>{card.value}</p>
                    </div>
                ))}
            </div>
            
            <div style={{ marginTop: '40px' }}>
                <h3>Thông tin nhanh:</h3>
                <ul>
                    <li>Số tiền đã thu được là: {formatCurrency(stats.totalRevenue)}.</li>
                    <li>Hiện có {stats.totalRooms} loại phòng đang được quản lý.</li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;