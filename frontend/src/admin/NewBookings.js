import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import axios from 'axios'; // Đã thay thế bằng axiosClient
import axiosClient from "../api/config"; 
import { FaTrash, FaUser, FaBed, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

const NewBookings = () => {
    // 📱 1. STATE CHECK MOBILE
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🚀 TẢI DỮ LIỆU TẬP TRUNG
    const fetchPendingOrders = useCallback(async () => {
        try {
            setLoading(true);
            // SỬ DỤNG axiosClient: Header Authorization đã được tự động thêm trong config.js
            const response = await axiosClient.get('/admin/bookings/pending');
            setPendingOrders(response.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi tải đơn pending:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("Phiên đăng nhập hết hạn hoặc không có quyền quản trị.");
            } else {
                setError("Không thể tải danh sách đơn đặt đang chờ.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingOrders();
    }, [fetchPendingOrders]);

    // 🚀 HỦY ĐƠN TẬP TRUNG
    const handleCancelOrder = async (bookingId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn HỦY vĩnh viễn đơn #${bookingId}?`)) return;
        
        try {
            // SỬ DỤNG axiosClient: Chỉ cần truyền path endpoint
            await axiosClient.delete(`/cart/${bookingId}`);
            alert(`Đã xóa đơn đặt #${bookingId} thành công.`);
            fetchPendingOrders(); // Reload lại danh sách
        } catch (err) {
            console.error(`Lỗi xóa đơn:`, err);
            alert(`Lỗi: ${err.response?.data?.message || "Không thể xóa đơn này"}`);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
    };

    // 🎨 STYLES (Giữ nguyên logic của bạn)
    const styles = {
        container: { padding: isMobile ? '15px' : '20px', fontFamily: 'serif', backgroundColor: '#f4f6f8', minHeight: '100%' },
        headerGroup: { marginBottom: '20px' },
        heading: { fontSize: isMobile ? '1.5rem' : '1.8rem', color: '#333', marginBottom: '5px' },
        subText: { color: '#666', fontSize: '0.9rem' },
        tableContainer: { display: isMobile ? 'none' : 'block', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse' },
        tableHeader: { backgroundColor: '#343a40', color: 'white' },
        tableCell: { padding: '15px', verticalAlign: 'top', borderBottom: '1px solid #eee', fontSize: '14px', color: '#333' },
        mobileList: { display: isMobile ? 'flex' : 'none', flexDirection: 'column', gap: '15px' },
        card: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #ddd' },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' },
        cardId: { fontWeight: 'bold', color: '#333' },
        statusBadge: { backgroundColor: '#ffc107', color: '#212529', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' },
        cardRow: { display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '0.9rem', color: '#555', alignItems: 'flex-start' },
        icon: { marginTop: '3px', color: '#888', minWidth: '16px' },
        highlight: { fontWeight: 'bold', color: '#dc3545' },
        btnCancel: {
            backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? '10px' : '0'
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Đang tải dữ liệu...</div>;
    if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;

    return (
        <div style={styles.container}>
            <div style={styles.headerGroup}>
                <h2 style={styles.heading}>🏨 Phòng Mới Đặt (Pending)</h2>
                <p style={styles.subText}>Danh sách các đơn chưa hoàn tất thanh toán.</p>
            </div>

            {/* --- GIAO DIỆN DESKTOP (TABLE) --- */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={{ ...styles.tableCell, width: '10%' }}>ID</th>
                            <th style={{ ...styles.tableCell, width: '25%' }}>Khách hàng</th>
                            <th style={{ ...styles.tableCell, width: '35%' }}>Chi tiết Phòng</th>
                            <th style={{ ...styles.tableCell, width: '15%' }}>Trạng thái</th>
                            <th style={{ ...styles.tableCell, width: '15%' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingOrders.length > 0 ? (
                            pendingOrders.map((order) => (
                                <tr key={order.booking_id}>
                                    <td style={{...styles.tableCell, fontWeight: 'bold'}}>#{order.booking_id}</td>
                                    <td style={styles.tableCell}>
                                        <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{order.client_username}</div>
                                        <div style={{fontSize: '0.85rem', color: '#666'}}>📧 {order.client_email || 'N/A'}</div>
                                        <div style={{fontSize: '0.85rem', color: '#666'}}>📞 {order.client_phone || 'N/A'}</div>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <div style={{fontWeight: 'bold', color: '#007bff'}}>{order.room_name}</div>
                                        <div style={{fontSize: '0.9rem'}}>SL: {order.num_rooms} phòng</div>
                                        <div style={{marginTop: '5px'}}>Tổng: <span style={styles.highlight}>{formatCurrency(order.estimated_price)}</span></div>
                                        <div style={{fontSize: '0.85rem', color: '#666'}}>Check-in: {order.check_in_date_temp}</div>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <span style={styles.statusBadge}>{order.order_status.toUpperCase()}</span>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <button style={styles.btnCancel} onClick={() => handleCancelOrder(order.booking_id)}>
                                            <FaTrash /> Hủy
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>Không có đơn hàng nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- GIAO DIỆN MOBILE (CARD LIST) --- */}
            <div style={styles.mobileList}>
                {pendingOrders.length > 0 ? (
                    pendingOrders.map((order) => (
                        <div key={order.booking_id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.cardId}>Đơn #{order.booking_id}</span>
                                <span style={styles.statusBadge}>{order.order_status.toUpperCase()}</span>
                            </div>

                            <div style={styles.cardRow}>
                                <FaUser style={styles.icon} />
                                <div>
                                    <strong>{order.client_username}</strong>
                                    <div style={{fontSize: '0.8rem', color: '#888'}}>{order.client_phone}</div>
                                </div>
                            </div>

                            <div style={styles.cardRow}>
                                <FaBed style={styles.icon} />
                                <span>{order.room_name} (x{order.num_rooms})</span>
                            </div>

                            <div style={styles.cardRow}>
                                <FaMoneyBillWave style={styles.icon} />
                                <span style={styles.highlight}>{formatCurrency(order.estimated_price)}</span>
                            </div>

                            <div style={styles.cardRow}>
                                <FaCalendarAlt style={styles.icon} />
                                <span>Check-in: {order.check_in_date_temp}</span>
                            </div>

                            <button style={styles.btnCancel} onClick={() => handleCancelOrder(order.booking_id)}>
                                <FaTrash /> Hủy Đơn Này
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: '#999', padding: '30px' }}>Không có đơn hàng nào.</div>
                )}
            </div>
        </div>
    );
};

export default NewBookings;