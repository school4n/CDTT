import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios'; // Đã thay thế bằng axiosClient
import axiosClient from "../api/config"; 
import { 
    FaCheckCircle, FaMoneyBillWave, FaTimesCircle, FaUser, 
    FaBed, FaCalendarAlt, FaClock, FaPhone // 👈 Đã thêm FaPhone vào đây để hết lỗi
} from 'react-icons/fa';

const PaymentConfirmation = () => {
    // 📱 1. STATE CHECK MOBILE
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // 🚀 TẢI DANH SÁCH ĐƠN ĐẶT ĐANG HOẠT ĐỘNG
    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            // SỬ DỤNG axiosClient: Chỉ cần truyền path, domain và token đã được xử lý tập trung
            const response = await axiosClient.get('/admin/bookings');
            
            // Lọc chỉ hiển thị đơn đã xác nhận (Confirmed) và đã nhận phòng (Checked_in)
            const activeBookings = response.data.filter(b => 
                b.order_status === 'confirmed' || b.order_status === 'checked_in'
            );
            setBookings(activeBookings);
            setError(null);
        } catch (err) {
            console.error("Lỗi tải đơn đặt:", err);
            setError("Không thể tải danh sách xác nhận. Vui lòng kiểm tra quyền Admin.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // 🚀 XỬ LÝ HÀNH ĐỘNG (CHECK-IN / THANH TOÁN / HỦY)
    const handleAction = async (bookingId, actionType) => {
        let successMsg = "";
        let requestPromise;

        if (!window.confirm("Bạn có chắc chắn muốn thực hiện thao tác này?")) return;

        try {
            if (actionType === 'check_in') {
                // PUT: Cập nhật trạng thái check-in
                requestPromise = axiosClient.put(`/admin/bookings/${bookingId}/confirm`, { action: 'check_in' });
                successMsg = "Xác nhận Check-in thành công!";
            } else if (actionType === 'confirm_payment') {
                // PUT: Xác nhận thanh toán & Trả phòng
                requestPromise = axiosClient.put(`/admin/bookings/${bookingId}/confirm`, { action: 'pay' });
                successMsg = "Xác nhận Thanh toán & Trả phòng thành công!";
            } else if (actionType === 'cancel') {
                // DELETE: Hủy đơn qua axiosClient
                requestPromise = axiosClient.delete(`/admin/bookings/${bookingId}/cancel`);
                successMsg = "Đã hủy đơn đặt phòng thành công!";
            }

            await requestPromise;
            alert(successMsg);
            fetchBookings(); // Tải lại danh sách sau khi thực hiện thành công
        } catch (err) {
            alert(`Thao tác thất bại: ${err.response?.data?.message || err.message}`);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
    };

    const formatTimeRemaining = (time) => {
        if (!time) return 'N/A';
        if (time.includes('ngày')) return <span style={{ color: '#007bff', fontWeight: 'bold' }}>{time}</span>;
        if (time.includes('Cần Check-in ngay')) return <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{time}</span>;
        return time;
    };

    // 🎨 STYLES
    const styles = {
        container: { padding: isMobile ? '15px' : '20px', fontFamily: 'serif', backgroundColor: '#f4f6f8', minHeight: '100vh' },
        headerGroup: { marginBottom: '20px' },
        heading: { fontSize: isMobile ? '1.5rem' : '1.8rem', color: '#333', marginBottom: '5px', fontWeight: 'bold' },
        searchBox: { 
            width: isMobile ? '100%' : '300px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', 
            marginBottom: '20px', boxSizing: 'border-box' 
        },
        tableContainer: { display: isMobile ? 'none' : 'block', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse' },
        tableHeader: { backgroundColor: '#343a40', color: 'white' },
        tableCell: { padding: '15px', verticalAlign: 'top', borderBottom: '1px solid #eee', fontSize: '14px', color: '#333' },
        mobileList: { display: isMobile ? 'flex' : 'none', flexDirection: 'column', gap: '15px' },
        card: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #ddd' },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' },
        cardId: { fontWeight: 'bold', color: '#007bff' },
        cardRow: { display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '0.9rem', color: '#555', alignItems: 'flex-start' },
        icon: { marginTop: '3px', color: '#888', minWidth: '16px' },
        highlight: { fontWeight: 'bold', color: '#dc3545' },
        btnGroup: { display: 'flex', gap: '5px', flexDirection: isMobile ? 'column' : 'row' },
        btnSuccess: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.9rem' },
        btnInfo: { backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.9rem' },
        btnDanger: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.9rem' },
        statusConfirmed: { backgroundColor: '#ffc107', color: '#212529', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' },
        statusCheckedIn: { backgroundColor: '#007bff', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' },
    };

    const renderButtons = (booking) => (
        <div style={styles.btnGroup}>
            {booking.order_status === 'confirmed' && (
                <button style={styles.btnSuccess} onClick={() => handleAction(booking.booking_id, 'check_in')}>
                    <FaCheckCircle /> Xác nhận Check-in
                </button>
            )}
            {booking.order_status === 'checked_in' && (
                <button style={styles.btnInfo} onClick={() => handleAction(booking.booking_id, 'confirm_payment')}>
                    <FaMoneyBillWave /> Thanh toán & Trả phòng
                </button>
            )}
            <button style={styles.btnDanger} onClick={() => handleAction(booking.booking_id, 'cancel')}>
                <FaTimesCircle /> Hủy đơn
            </button>
        </div>
    );

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Đang tải dữ liệu đơn đặt...</div>;
    if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;

    const filteredBookings = bookings.filter(booking => 
        booking.booking_id.toString().includes(searchTerm) ||
        booking.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.headerGroup}>
                <h2 style={styles.heading}>🧾 Xác Nhận Thanh Toán / Trả Phòng</h2>
                <input
                    type="text" placeholder="Tìm kiếm theo ID, Tên khách hoặc Phòng..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchBox}
                />
            </div>

            {/* --- TABLE DESKTOP --- */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={{ ...styles.tableCell, width: '5%' }}>#</th>
                            <th style={{ ...styles.tableCell, width: '25%' }}>Khách Hàng</th>
                            <th style={{ ...styles.tableCell, width: '35%' }}>Thông Tin Đặt</th>
                            <th style={{ ...styles.tableCell, width: '15%' }}>Trạng Thái</th>
                            <th style={{ ...styles.tableCell, width: '20%' }}>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking, index) => (
                                <tr key={booking.booking_id}>
                                    <td style={styles.tableCell}>{index + 1}</td>
                                    <td style={styles.tableCell}>
                                        <p>ID: <span style={{ color: '#007bff', fontWeight: 'bold' }}>#{booking.booking_id}</span></p>
                                        <p><FaUser size={12} /> {booking.client_name}</p>
                                        <p><FaPhone size={12} /> {booking.client_phone || 'N/A'}</p>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <p><FaBed size={12} /> <strong>{booking.room_name}</strong> (x{booking.num_rooms})</p>
                                        <p>Check-in: {new Date(booking.check_in_date).toLocaleDateString('vi-VN')}</p>
                                        <p>Check-out: {new Date(booking.check_out_date).toLocaleDateString('vi-VN')}</p>
                                        <p style={{color: '#dc3545', fontWeight: 'bold'}}>Tổng: {formatCurrency(booking.total_price)}</p>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <span style={booking.order_status === 'confirmed' ? styles.statusConfirmed : styles.statusCheckedIn}>
                                            {booking.order_status.toUpperCase()}
                                        </span>
                                        <div style={{marginTop: '5px', fontSize: '0.8rem'}}><FaClock size={10} /> {formatTimeRemaining(booking.time_remaining)}</div>
                                    </td>
                                    <td style={styles.tableCell}>{renderButtons(booking)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Không có đơn đặt phòng nào cần xử lý.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- CARD LIST MOBILE --- */}
            <div style={styles.mobileList}>
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <div key={booking.booking_id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.cardId}>Đơn #{booking.booking_id}</span>
                                <span style={booking.order_status === 'confirmed' ? styles.statusConfirmed : styles.statusCheckedIn}>
                                    {booking.order_status.toUpperCase()}
                                </span>
                            </div>

                            <div style={styles.cardRow}>
                                <FaUser style={styles.icon} />
                                <div><strong>{booking.client_name}</strong> - {booking.client_phone}</div>
                            </div>

                            <div style={styles.cardRow}>
                                <FaBed style={styles.icon} />
                                <span>{booking.room_name} (x{booking.num_rooms})</span>
                            </div>

                            <div style={styles.cardRow}>
                                <FaMoneyBillWave style={styles.icon} />
                                <span style={styles.highlight}>{formatCurrency(booking.total_price)}</span>
                            </div>

                            <div style={styles.cardRow}>
                                <FaCalendarAlt style={styles.icon} />
                                <span>{new Date(booking.check_in_date).toLocaleDateString('vi-VN')} ➝ {new Date(booking.check_out_date).toLocaleDateString('vi-VN')}</span>
                            </div>

                            <div style={styles.cardRow}>
                                <FaClock style={styles.icon} />
                                <span>{formatTimeRemaining(booking.time_remaining)}</span>
                            </div>

                            <div style={{marginTop: '10px'}}>
                                {renderButtons(booking)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: '#999', padding: '30px' }}>Không có dữ liệu.</div>
                )}
            </div>
        </div>
    );
};

export default PaymentConfirmation;