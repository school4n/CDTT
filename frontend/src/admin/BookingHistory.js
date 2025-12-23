import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios'; // Đã thay thế bằng axiosClient
import axiosClient from "../api/config"; 
import { FaSearch, FaUser, FaBed, FaCalendarAlt, FaMoneyBillWave, FaClock } from 'react-icons/fa';

const BookingHistory = () => {
    // 📱 CHECK MOBILE
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [historyOrders, setHistoryOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // 🚀 LOGIC GỌI API TẬP TRUNG
    const fetchHistoryOrders = useCallback(async () => {
        try {
            setLoading(true);
            // SỬ DỤNG axiosClient: Header Authorization đã được tự động thêm trong interceptor
            const response = await axiosClient.get('/admin/bookings/history');
            setHistoryOrders(response.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi tải lịch sử đặt phòng:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("Bạn không có quyền truy cập dữ liệu lịch sử.");
            } else {
                setError("Không thể tải lịch sử đặt phòng.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistoryOrders();
    }, [fetchHistoryOrders]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
    };

    // 🎨 STYLES (Giữ nguyên logic của bạn)
    const styles = {
        container: { padding: isMobile ? '15px' : '20px', fontFamily: 'serif', backgroundColor: '#f4f6f8', minHeight: '100%' },
        headerGroup: { marginBottom: '20px' },
        heading: { fontSize: isMobile ? '1.5rem' : '1.8rem', color: '#333', marginBottom: '5px' },
        searchBoxContainer: { display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' },
        searchBox: { 
            width: isMobile ? '100%' : '300px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', 
            boxSizing: 'border-box' 
        },
        tableContainer: { display: isMobile ? 'none' : 'block', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse' },
        tableHeader: { backgroundColor: '#343a40', color: 'white' },
        tableCell: { padding: '15px', verticalAlign: 'top', borderBottom: '1px solid #eee', fontSize: '14px', color: '#333' },
        mobileList: { display: isMobile ? 'flex' : 'none', flexDirection: 'column', gap: '15px' },
        card: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #ddd' },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' },
        cardId: { fontWeight: 'bold', color: '#666', fontSize: '0.9rem' },
        cardRow: { display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '0.9rem', color: '#555', alignItems: 'flex-start' },
        icon: { marginTop: '3px', color: '#888', minWidth: '16px' },
        statusPaid: { backgroundColor: '#28a745', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' },
        statusCancelled: { backgroundColor: '#6c757d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' },
        statusError: { backgroundColor: '#dc3545', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }
    };

    const renderStatusBadge = (status) => {
        if (status === 'paid' || !status) return <span style={styles.statusPaid}>ĐÃ THANH TOÁN</span>;
        if (status === 'cancelled') return <span style={styles.statusCancelled}>ĐÃ HỦY</span>;
        return <span style={styles.statusError}>{status.toUpperCase()}</span>;
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Đang tải dữ liệu lịch sử...</div>;
    if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;

    const filteredOrders = historyOrders.filter(order => 
        order.booking_id.toString().includes(searchTerm) ||
        order.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.room_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.headerGroup}>
                <h2 style={styles.heading}>📜 Lịch Sử Đặt Phòng</h2>
                <div style={styles.searchBoxContainer}>
                    <input
                        type="text"
                        placeholder="Tìm ID, Tên Khách, Tên Phòng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchBox}
                    />
                </div>
            </div>

            {/* --- BẢNG TRÊN MÁY TÍNH --- */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={{ ...styles.tableCell, width: '10%' }}>ID</th>
                            <th style={{ ...styles.tableCell, width: '25%' }}>Khách Hàng</th>
                            <th style={{ ...styles.tableCell, width: '35%' }}>Chi Tiết Thuê</th>
                            <th style={{ ...styles.tableCell, width: '15%' }}>Tổng Tiền</th>
                            <th style={{ ...styles.tableCell, width: '15%' }}>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order.booking_id}>
                                    <td style={{...styles.tableCell, fontWeight: 'bold'}}>ORD_{order.booking_id}</td>
                                    <td style={styles.tableCell}>
                                        <div style={{fontWeight: 'bold'}}>{order.client_name}</div>
                                        <div style={{fontSize: '0.85rem', color: '#666'}}>{order.client_phone}</div>
                                        <div style={{fontSize: '0.85rem', color: '#888'}}>
                                            <FaClock size={10} /> {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <div style={{fontWeight: 'bold', color: '#007bff'}}>{order.room_name}</div>
                                        <div style={{fontSize: '0.9rem'}}>
                                            {new Date(order.check_in_date).toLocaleDateString('vi-VN')} ➝ {new Date(order.check_out_date).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div style={{fontSize: '0.85rem', fontStyle: 'italic'}}>{order.duration}</div>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <span style={{ fontWeight: 'bold', color: order.order_status === 'cancelled' ? '#999' : '#28a745' }}>
                                            {formatCurrency(order.total_price)}
                                        </span>
                                    </td>
                                    <td style={styles.tableCell}>
                                        {renderStatusBadge(order.order_status)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không tìm thấy dữ liệu.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- DANH SÁCH TRÊN ĐIỆN THOẠI --- */}
            <div style={styles.mobileList}>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order.booking_id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.cardId}>ORD_{order.booking_id}</span>
                                {renderStatusBadge(order.order_status)}
                            </div>

                            <div style={styles.cardRow}>
                                <FaUser style={styles.icon} />
                                <div>
                                    <strong>{order.client_name}</strong>
                                    <div style={{fontSize: '0.8rem', color: '#888'}}>{order.client_phone}</div>
                                </div>
                            </div>

                            <div style={styles.cardRow}>
                                <FaBed style={styles.icon} />
                                <span>{order.room_name}</span>
                            </div>

                            <div style={styles.cardRow}>
                                <FaCalendarAlt style={styles.icon} />
                                <span>
                                    {order.check_in_date ? new Date(order.check_in_date).toLocaleDateString('vi-VN') : 'N/A'} 
                                    {' ➝ '} 
                                    {order.check_out_date ? new Date(order.check_out_date).toLocaleDateString('vi-VN') : 'N/A'}
                                </span>
                            </div>

                            <div style={styles.cardRow}>
                                <FaMoneyBillWave style={styles.icon} />
                                <span style={{ fontWeight: 'bold', color: order.order_status === 'cancelled' ? '#999' : '#28a745' }}>
                                    {formatCurrency(order.total_price)}
                                </span>
                            </div>
                            
                            <div style={{...styles.cardRow, fontSize: '0.8rem', color: '#aaa', justifyContent: 'flex-end', marginTop: '5px'}}>
                                Ngày tạo: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: '#999', padding: '30px' }}>Không tìm thấy dữ liệu.</div>
                )}
            </div>
        </div>
    );
};

export default BookingHistory;