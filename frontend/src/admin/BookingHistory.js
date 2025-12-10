import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const API_HISTORY_URL = 'http://localhost:3001/api/admin/bookings/history'; 

const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    tableHeader: { backgroundColor: '#343a40', color: 'white' },
    // 🚨 FIX 1: Điều chỉnh tableCell: Căn giữa theo chiều dọc, căn trái mặc định.
    tableCell: { 
        padding: '15px', 
        verticalAlign: 'middle', // Căn giữa theo chiều dọc
        borderBottom: '1px solid #eee', 
        fontSize: '14px',
        textAlign: 'left' // Mặc định căn trái
    },
    // Các style cụ thể cho từng cột
    idCell: { width: '5%', textAlign: 'center' },
    clientCell: { width: '25%', textAlign: 'left' },
    infoCell: { width: '35%', textAlign: 'left' },
    priceCell: { width: '15%', textAlign: 'center' },
    statusCell: { width: '15%', textAlign: 'center' },

    searchBox: { float: 'right', padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '15px' },
    
    // Màu cho các trạng thái
    statusCancelled: { backgroundColor: '#6c757d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
    statusPaid: { backgroundColor: '#28a745', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
    statusError: { backgroundColor: '#ff5722', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
    
    // 🚨 FIX 2: Style cho p để căn trái nội dung trong cell
    paragraph: { margin: '2px 0' }
};

const BookingHistory = () => {
    const [historyOrders, setHistoryOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const ADMIN_TOKEN = useMemo(() => localStorage.getItem('adminToken'), []);

    // ------------------
    // HÀM TẢI DỮ LIỆU
    // ------------------
    const fetchHistoryOrders = useCallback(async () => {
        if (!ADMIN_TOKEN) {
            setError("Lỗi xác thực: Không tìm thấy Token Admin.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(API_HISTORY_URL, {
                headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
            });
            setHistoryOrders(response.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải lịch sử đặt phòng:", err);
            setError("Không thể tải lịch sử. Vui lòng kiểm tra Server và Token.");
        } finally {
            setLoading(false);
        }
    }, [ADMIN_TOKEN]);

    useEffect(() => {
        fetchHistoryOrders();
    }, [fetchHistoryOrders]);

    // ------------------
    // HÀM HIỂN THỊ
    // ------------------
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
    };

    const formatStatus = (status) => {
        // FIX: Xử lý order_status rỗng/null (giả định là Đã Thanh Toán nếu nó nằm trong history mà không có status)
        if (status === 'paid' || status === null || status === '' || status === undefined) {
            return <span style={styles.statusPaid}>ĐÃ THANH TOÁN</span>;
        }
        if (status === 'cancelled') {
            return <span style={styles.statusCancelled}>ĐÃ HỦY</span>;
        }
        // Trường hợp khác
        return <span style={styles.statusError}>{status.toUpperCase()} (LỖI)</span>;
    };

    if (loading) return <div style={styles.container}>Đang tải lịch sử đơn hàng...</div>;
    if (error) return <div style={{ ...styles.container, color: 'red' }}>Lỗi: {error}</div>;

    const filteredOrders = historyOrders.filter(order => 
        order.booking_id.toString().includes(searchTerm) ||
        order.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.room_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <h2>📜 Hồ Sơ Đặt Phòng (Lịch sử & Lỗi)</h2>
            <hr />
            
            <input
                type="text"
                placeholder="Tìm kiếm theo ID, Tên Khách hàng, hoặc Tên Phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchBox}
            />

            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeader}>
                        {/* 🚨 FIX 3: Áp dụng style cho từng cột header */}
                        <th style={{ ...styles.tableCell, ...styles.idCell }}>ID</th>
                        <th style={{ ...styles.tableCell, ...styles.clientCell }}>Khách Hàng</th>
                        <th style={{ ...styles.tableCell, ...styles.infoCell }}>Thông Tin Thuê</th>
                        <th style={{ ...styles.tableCell, ...styles.priceCell }}>Giá Trị Đơn</th>
                        <th style={{ ...styles.tableCell, ...styles.statusCell }}>Trạng Thái</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                            const priceColor = (order.order_status === 'paid' && order.total_price > 0) ? '#28a745' : '#dc3545';
                            
                            return (
                                <tr key={order.booking_id}>
                                    {/* 🚨 FIX 4: Áp dụng style cho từng cột body cell */}
                                    <td style={{ ...styles.tableCell, ...styles.idCell }}>ORD_{order.booking_id}</td>
                                    
                                    <td style={{ ...styles.tableCell, ...styles.clientCell }}>
                                        <p style={styles.paragraph}>Tên: {order.client_name || 'N/A'}</p>
                                        <p style={styles.paragraph}>SĐT: {order.client_phone || 'N/A'}</p>
                                        <p style={styles.paragraph}>Ngày tạo: {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                                    </td>
                                    
                                    <td style={{ ...styles.tableCell, ...styles.infoCell }}>
                                        <p style={styles.paragraph}>Phòng: {order.room_name} ({order.num_rooms} phòng)</p>
                                        <p style={styles.paragraph}>Ngày Vào: {order.check_in_date ? new Date(order.check_in_date).toLocaleDateString('vi-VN') : 'N/A'}</p>
                                        <p style={styles.paragraph}>Ngày Trả: {order.check_out_date ? new Date(order.check_out_date).toLocaleDateString('vi-VN') : 'N/A'}</p>
                                        <p style={styles.paragraph}>Thời gian thuê: {order.duration || 'N/A'}</p>
                                    </td>
                                    
                                    <td style={{ ...styles.tableCell, ...styles.priceCell }}>
                                        <span style={{ fontWeight: 'bold', color: priceColor }}>
                                            {formatCurrency(order.total_price || 0)}
                                        </span>
                                    </td>
                                    
                                    <td style={{ ...styles.tableCell, ...styles.statusCell }}>
                                        {formatStatus(order.order_status)}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Không có hồ sơ đặt phòng nào đã hoàn tất, hủy, hoặc bị lỗi.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BookingHistory;