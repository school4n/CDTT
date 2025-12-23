import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // Đã thay thế bằng axiosClient
import axiosClient from "../api/config"; 
import { FaMoneyBillWave, FaUserFriends, FaBed, FaClipboardList, FaConciergeBell, FaChartLine } from 'react-icons/fa';

// 🎨 CẤU HÌNH MÀU SẮC
const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";
const LIGHT_BG = "#f9f9ff";

const Dashboard = () => {
    // 📱 1. STATE CHECK MOBILE
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRooms: 0,
        totalFacilities: 0,
        totalRevenue: 0,
        newBookings: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🚀 LOGIC GỌI API TẬP TRUNG
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // SỬ DỤNG axiosClient: Chỉ cần truyền path endpoint
                // Token Admin đã được tự động thêm vào Header bởi Interceptor
                const response = await axiosClient.get('/admin/dashboard/stats');
                setStats(response.data);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi tải thống kê:", err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setError("Phiên đăng nhập hết hạn hoặc bạn không có quyền Admin.");
                } else {
                    setError("Không thể tải dữ liệu thống kê hệ thống.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []); // Hook chạy khi component mount

    // Định dạng tiền tệ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', currency: 'VND', minimumFractionDigits: 0 
        }).format(value);
    };

    // Danh sách thẻ thống kê
    const statCards = [
        { title: "Tổng Doanh Thu", value: formatCurrency(stats.totalRevenue), color: '#28a745', icon: <FaMoneyBillWave /> },
        { title: "Khách Hàng", value: stats.totalUsers, color: '#007bff', icon: <FaUserFriends /> },
        { title: "Tổng Số Phòng", value: stats.totalRooms, color: '#ffc107', icon: <FaBed /> },
        { title: "Đơn Đặt Mới", value: stats.newBookings, color: '#dc3545', icon: <FaClipboardList /> },
        { title: "Tiện Nghi", value: stats.totalFacilities, color: '#17a2b8', icon: <FaConciergeBell /> },
    ];

    // 🎨 STYLES
    const styles = {
        container: { 
            padding: isMobile ? '20px 15px' : '30px', 
            fontFamily: 'serif', 
            backgroundColor: LIGHT_BG, 
            minHeight: '100vh' 
        },
        header: {
            marginBottom: '30px',
            borderBottom: `2px solid ${ROYAL_COLOR}`,
            paddingBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        title: {
            fontSize: isMobile ? '1.5rem' : '2rem',
            color: DARK_BG,
            fontWeight: 'bold',
            margin: 0
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
        },
        card: {
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            textAlign: 'left',
            transition: 'transform 0.2s',
            borderLeft: '5px solid', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        cardContent: { flex: 1 },
        cardTitle: {
            fontSize: '0.95rem',
            color: '#6c757d',
            margin: '0 0 5px 0',
            textTransform: 'uppercase',
            fontWeight: '600'
        },
        cardValue: {
            fontSize: isMobile ? '1.5rem' : '1.8rem',
            fontWeight: 'bold',
            margin: 0,
            color: DARK_BG
        },
        iconBox: {
            fontSize: '2.5rem',
            opacity: 0.2, 
        },
        infoSection: {
            marginTop: '40px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        },
        infoList: { listStyle: 'none', padding: 0 },
        infoItem: {
            padding: '10px 0',
            borderBottom: '1px solid #eee',
            fontSize: '1rem',
            color: '#333'
        }
    };

    if (loading) return <div style={{...styles.container, textAlign: 'center'}}>⏳ Đang tải thống kê hệ thống...</div>;
    if (error) return <div style={{...styles.container, color: 'red', textAlign: 'center'}}>{error}</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <FaChartLine size={isMobile ? 24 : 32} color={ROYAL_COLOR} />
                <h2 style={styles.title}>Tổng Quan Quản Trị</h2>
            </div>

            <div style={styles.grid}>
                {statCards.map((card, index) => (
                    <div 
                        key={index} 
                        style={{ ...styles.card, borderLeftColor: card.color }}
                    >
                        <div style={styles.cardContent}>
                            <p style={styles.cardTitle}>{card.title}</p>
                            <p style={styles.cardValue}>{card.value}</p>
                        </div>
                        <div style={{ ...styles.iconBox, color: card.color }}>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>
            
            <div style={styles.infoSection}>
                <h3 style={{color: DARK_BG, marginBottom: '15px'}}>📝 Hoạt động hệ thống</h3>
                <ul style={styles.infoList}>
                    <li style={styles.infoItem}>
                        ✅ Doanh thu ghi nhận: <strong>{formatCurrency(stats.totalRevenue)}</strong>.
                    </li>
                    <li style={styles.infoItem}>
                        ✅ Danh mục vận hành: <strong>{stats.totalRooms}</strong> loại phòng.
                    </li>
                    <li style={{...styles.infoItem, borderBottom: 'none'}}>
                        ✅ Cộng đồng người dùng: <strong>{stats.totalUsers}</strong> thành viên.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;