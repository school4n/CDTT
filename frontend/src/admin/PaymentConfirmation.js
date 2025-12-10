import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Giả định thư viện axios đã được cài đặt: npm install axios
import axios from 'axios';

// Định nghĩa URL API
const API_BOOKINGS_URL = 'http://localhost:3001/api/admin/bookings'; 

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
    searchBox: { float: 'right', padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '15px' },
    buttonContainer: { display: 'flex', flexDirection: 'column', gap: '5px' },
    // Màu cho các trạng thái
    statusConfirmed: { backgroundColor: '#ffc107', color: '#212529', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
    statusCheckedIn: { backgroundColor: '#007bff', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
};

const PaymentConfirmation = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // 🚨 LẤY TOKEN BÊN TRONG COMPONENT HOẶC USE MEMO
    const ADMIN_TOKEN = useMemo(() => localStorage.getItem('adminToken'), []);

    // ------------------
    // HÀM TẢI DỮ LIỆU
    // ------------------
    const fetchBookings = useCallback(async () => {
        if (!ADMIN_TOKEN) {
            setError("Lỗi xác thực: Không tìm thấy Token Admin.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(API_BOOKINGS_URL, {
                headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
            });
            // Lọc chỉ hiển thị Confirmed và Checked_in (đang hoạt động)
            const activeBookings = response.data.filter(b => 
                b.order_status === 'confirmed' || b.order_status === 'checked_in'
            );
            setBookings(activeBookings);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải đơn đặt phòng:", err);
            setError(`Không thể tải dữ liệu: ${err.response?.data?.message || err.message}. Vui lòng kiểm tra API Backend.`);
        } finally {
            setLoading(false);
        }
    }, [ADMIN_TOKEN]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // ------------------
    // HÀM XỬ LÝ HÀNH ĐỘNG
    // ------------------
    const handleAction = async (bookingId, actionType) => {
        let message = "";
        let endpoint = "";
        let method = "";
        let body = {};
        let successMessage = "";

        if (actionType === 'check_in') {
            message = `Xác nhận CHECK-IN cho đơn #${bookingId}?`;
            endpoint = `${API_BOOKINGS_URL}/${bookingId}/confirm`;
            method = 'PUT';
            body = { action: 'check_in' };
            successMessage = "Check-in thành công! Đơn hàng đang ở trạng thái Đang thuê.";
        } else if (actionType === 'confirm_payment') {
            message = `Xác nhận THANH TOÁN VÀ TRẢ PHÒNG cho đơn #${bookingId}?`;
            endpoint = `${API_BOOKINGS_URL}/${bookingId}/confirm`;
            method = 'PUT';
            body = { action: 'pay' };
            successMessage = "Thanh toán thành công! Đơn hàng đã được chuyển vào Hồ sơ.";
        } else if (actionType === 'cancel') {
            message = `Hủy đơn đặt phòng #${bookingId}? (Trạng thái sẽ chuyển sang 'cancelled')`;
            endpoint = `${API_BOOKINGS_URL}/${bookingId}/cancel`;
            method = 'DELETE'; 
            successMessage = "Hủy đơn thành công!";
        } else {
            return;
        }

        if (!window.confirm(message)) return;

        try {
            await axios({
                method: method,
                url: endpoint,
                data: method === 'PUT' ? body : undefined,
                headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
            });
            alert(successMessage);
            fetchBookings(); // Tải lại dữ liệu
        } catch (err) {
            console.error(`Lỗi khi xử lý hành động ${actionType}:`, err);
            alert(`Lỗi: ${err.response?.data?.message || err.message}`);
        }
    };

    // ------------------
    // HÀM HIỂN THỊ
    // ------------------
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
    };

    const formatTimeRemaining = (time) => {
        if (!time) return 'N/A';
        if (time.includes('ngày')) return <span style={{ color: '#007bff', fontWeight: 'bold' }}>{time}</span>;
        if (time.includes('Cần Check-in ngay')) return <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{time}</span>;
        return time;
    };

    const renderActionButtons = (booking) => {
        if (booking.order_status === 'confirmed') {
             // Đơn đã xác nhận, chờ Check-in
             return (
                <div style={styles.buttonContainer}>
                    <button 
                        onClick={() => handleAction(booking.booking_id, 'check_in')}
                        style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '3px', cursor: 'pointer' }}
                    >
                        ✅ Xác nhận Check-in
                    </button>
                    <button 
                        onClick={() => handleAction(booking.booking_id, 'cancel')}
                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '3px', cursor: 'pointer' }}
                    >
                        ❌ Hủy Đặt Phòng
                    </button>
                </div>
            );
        }
        
        if (booking.order_status === 'checked_in') {
            // Đơn đã check-in, chờ Trả phòng và Thanh toán cuối
            return (
                <div style={styles.buttonContainer}>
                     <button 
                        onClick={() => handleAction(booking.booking_id, 'confirm_payment')}
                        style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '3px', cursor: 'pointer' }}
                    >
                        ☑️ Xác nhận Thanh Toán
                    </button>
                    <button 
                        onClick={() => handleAction(booking.booking_id, 'cancel')}
                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '3px', cursor: 'pointer' }}
                    >
                        ❌ Hủy Đặt Phòng
                    </button>
                </div>
            );
        }
        
        return <span style={{ color: 'gray' }}>Đã xử lý</span>;
    };

    if (loading) return <div style={styles.container}>Đang tải dữ liệu...</div>;
    if (error) return <div style={{ ...styles.container, color: 'red' }}>{error}</div>;

    const filteredBookings = bookings.filter(booking => 
        booking.booking_id.toString().includes(searchTerm) ||
        booking.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <h2>🧾 Xác Nhận Thanh Toán / Trả Phòng</h2>
            <hr />
            
            <input
                type="text"
                placeholder="Nhập ID Đặt phòng, Tên Khách hàng để tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchBox}
            />

            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeader}>
                        <th style={{ width: '5%', ...styles.tableCell }}>#</th>
                        <th style={{ width: '25%', ...styles.tableCell }}>Thông Tin Khách Hàng</th>
                        <th style={{ width: '35%', ...styles.tableCell }}>Thông Tin Đặt</th>
                        <th style={{ width: '15%', ...styles.tableCell }}>Trạng Thái</th>
                        <th style={{ width: '20%', ...styles.tableCell }}>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => {
                            const statusStyle = booking.order_status === 'confirmed' ? styles.statusConfirmed : styles.statusCheckedIn;
                            return (
                                <tr key={booking.booking_id}>
                                    <td style={styles.tableCell}>{index + 1}</td>
                                    <td style={styles.tableCell}>
                                        <p>ID: <span style={{ color: '#007bff', fontWeight: 'bold' }}>ORD_{booking.booking_id}</span></p>
                                        <p>Tên: {booking.client_name}</p>
                                        <p>Điện Thoại: {booking.client_phone || 'N/A'}</p>
                                        <p>Tổng tiền: <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{formatCurrency(booking.total_price)}</span></p>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <p>Phòng: {booking.room_name} ({booking.num_rooms} phòng)</p>
                                        <p>Ngày Vào: {new Date(booking.check_in_date).toLocaleDateString('vi-VN')}</p>
                                        <p>Ngày Trả: {new Date(booking.check_out_date).toLocaleDateString('vi-VN')}</p>
                                        <p>Thời Gian Còn Lại: {formatTimeRemaining(booking.time_remaining)}</p>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <span style={statusStyle}>{booking.order_status.toUpperCase()}</span>
                                    </td>
                                    <td style={styles.tableCell}>
                                        {renderActionButtons(booking)}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Không có đơn đặt phòng nào đang hoạt động.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentConfirmation;