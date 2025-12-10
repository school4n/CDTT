// NewBookings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_PENDING_URL = 'http://localhost:3001/api/admin/bookings/pending'; 
const ADMIN_TOKEN = localStorage.getItem('adminToken'); // Giả định token Admin

const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    tableHeader: { backgroundColor: '#343a40', color: 'white' },
    tableCell: { 
        padding: '15px', 
        verticalAlign: 'middle', // Căn giữa theo chiều dọc
        borderBottom: '1px solid #eee', 
        fontSize: '14px',
        textAlign: 'left' // Mặc định căn trái
    },
    statusPending: { 
        backgroundColor: '#ffc107', 
        color: '#212529', 
        padding: '4px 8px', 
        borderRadius: '4px',
        fontWeight: 'bold'
    }
};

const NewBookings = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const fetchPendingOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_PENDING_URL, {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                }
            });
            setPendingOrders(response.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải đơn đặt pending:", err);
            setError("Không thể tải đơn đặt đang chờ. Vui lòng kiểm tra Server và Token.");
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý hủy đơn (Chuyển trạng thái sang 'cancelled' hoặc xóa vĩnh viễn)
    const handleCancelOrder = async (bookingId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn HỦY vĩnh viễn đơn đặt pending #${bookingId} này?`)) {
            return;
        }
        
        // 🚨 SỬ DỤNG ENDPOINT XÓA CART/PENDING TẠM THỜI TRONG API GỐC
        const API_DELETE_CART = `http://localhost:3001/api/cart/${bookingId}`; 
        
        try {
            await axios.delete(API_DELETE_CART, {
                headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` } // 🚨 LƯU Ý: Endpoint này cần là Admin, hoặc tạo endpoint /api/admin/cart/:id
            });
            alert(`Đã xóa đơn đặt #${bookingId} thành công.`);
            fetchPendingOrders(); // Tải lại danh sách
        } catch (err) {
            console.error(`Lỗi khi hủy đơn ${bookingId}:`, err);
            alert(`Lỗi: ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading) return <div style={styles.container}>Đang tải đơn đặt pending...</div>;
    if (error) return <div style={{ ...styles.container, color: 'red' }}>Lỗi: {error}</div>;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <div style={styles.container}>
            <h2>🏨 Phòng Mới Đặt (Pending)</h2>
            <p>Các đơn hàng này đang ở trạng thái Giỏ hàng/Đơn tạm và cần khách hàng hoàn tất chi tiết thanh toán.</p>
            <hr />

            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeader}>
                        <th style={{ width: '5%', ...styles.tableCell }}>ID</th>
                        <th style={{ width: '30%', ...styles.tableCell }}>Thông tin Khách hàng</th>
                        <th style={{ width: '35%', ...styles.tableCell }}>Thông tin Đặt Phòng</th>
                        <th style={{ width: '15%', ...styles.tableCell }}>Trạng thái</th>
                        <th style={{ width: '15%', ...styles.tableCell }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingOrders.length > 0 ? (
                        pendingOrders.map((order, index) => (
                            <tr key={order.booking_id}>
                                <td style={styles.tableCell}>ORD_{order.booking_id}</td>
                                <td style={styles.tableCell}>
                                    <p>Tên đăng nhập: {order.client_username}</p>
                                    <p>Email: {order.client_email || 'N/A'}</p>
                                    <p>SĐT: {order.client_phone || 'N/A'}</p>
                                    <p>Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                                </td>
                                <td style={styles.tableCell}>
                                    <p>Phòng: {order.room_name} ({order.num_rooms} phòng)</p>
                                    <p>Giá/Đêm: {formatCurrency(order.price_per_night)}</p>
                                    <p>Giá trị tạm tính: <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{formatCurrency(order.estimated_price)}</span></p>
                                    <p>Ngày Check-in dự kiến: {order.check_in_date_temp}</p>
                                </td>
                                <td style={styles.tableCell}>
                                    <span style={styles.statusPending}>{order.order_status.toUpperCase()}</span>
                                </td>
                                <td style={styles.tableCell}>
                                    <button 
                                        onClick={() => handleCancelOrder(order.booking_id)}
                                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        ❌ Hủy Đơn
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Không có đơn đặt phòng nào đang ở trạng thái pending.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default NewBookings;