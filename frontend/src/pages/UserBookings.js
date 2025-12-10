import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    FaHistory, FaCalendarAlt, FaClock, FaUser, FaTrashAlt, 
    FaMoneyBillWave, FaIdCard, FaBed, FaInfoCircle 
} from 'react-icons/fa'; 

// 🎨 THEME COLORS
const ROYAL_COLOR = "#d4af37"; 
const DARK_BG = "#1a1a1a"; 
const LIGHT_BG = "#f3f4f6"; 
const TEXT_COLOR = "#4b5563"; 
const DANGER_COLOR = "#ef4444";

const styles = {
    container: {
        padding: "60px 20px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "'Playfair Display', serif",
        backgroundColor: LIGHT_BG,
        minHeight: '100vh',
    },
    heading: {
        fontSize: "2.2rem",
        color: DARK_BG,
        marginBottom: "40px",
        fontWeight: "700",
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    statusText: {
        fontSize: '1.2rem',
        color: TEXT_COLOR,
        padding: '50px',
        textAlign: 'center',
    },
    
    // --- Booking Card ---
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        marginBottom: '30px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'transform 0.2s ease',
    },
    cardHeader: {
        backgroundColor: DARK_BG,
        padding: '15px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: ROYAL_COLOR,
    },
    bookingId: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    bookingDate: {
        fontSize: '0.9rem',
        color: '#9ca3af', // Xám nhạt
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },

    // --- Card Body (Grid Layout) ---
    cardBody: {
        padding: '25px',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr', // Cột trái (Phòng) lớn hơn cột phải (Thông tin)
        gap: '30px',
    },
    
    // Cột Trái: Danh sách phòng
    roomList: {
        borderRight: '1px dashed #e5e7eb',
        paddingRight: '20px',
    },
    sectionTitle: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: DARK_BG,
        marginBottom: '15px',
        borderBottom: `2px solid ${ROYAL_COLOR}`,
        display: 'inline-block',
        paddingBottom: '5px',
    },
    item: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #f3f4f6',
    },
    itemImage: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    itemInfo: {
        flex: 1,
    },
    roomName: {
        fontWeight: 'bold',
        fontSize: '1.1rem',
        color: '#374151',
        marginBottom: '5px',
    },
    roomMeta: {
        fontSize: '0.9rem',
        color: '#6b7280',
        lineHeight: '1.5',
    },

    // Cột Phải: Thông tin khách & Thanh toán
    infoColumn: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
        fontSize: '0.95rem',
        color: '#4b5563',
    },
    totalArea: {
        marginTop: 'auto',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
    },
    totalPrice: {
        fontSize: '1.6rem',
        fontWeight: 'bold',
        color: '#d97706', // Màu cam đậm
        textAlign: 'right',
        display: 'block',
    },
    
    // --- Footer Actions ---
    cardFooter: {
        padding: '15px 25px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '15px',
    },
    btn: {
        padding: '10px 20px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '0.9rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        border: 'none',
    },
    btnDetail: {
        backgroundColor: '#fff',
        color: DARK_BG,
        border: '1px solid #d1d5db',
        textDecoration: 'none', // Cho Link
    },
    btnCancel: {
        backgroundColor: '#fff',
        color: DANGER_COLOR,
        border: `1px solid ${DANGER_COLOR}`,
    },
    badge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        backgroundColor: '#10b981', // Xanh lá
        color: 'white',
        marginLeft: '10px',
    }
};

function UserBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const token = localStorage.getItem('token');
    const API_BOOKINGS = "http://localhost:3001/api/bookings";
    const API_CANCEL = "http://localhost:3001/api/bookings"; 

    const handleAuthError = useCallback((message = "Phiên đăng nhập hết hạn.") => {
        localStorage.clear();
        window.dispatchEvent(new Event('auth-change')); 
        alert(message);
        navigate('/login');
    }, [navigate]);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        if (!token) {
            setLoading(false);
            return handleAuthError("Vui lòng đăng nhập để xem lịch sử.");
        }
        try {
            const res = await axios.get(API_BOOKINGS, { headers: { Authorization: `Bearer ${token}` } });
            setBookings(res.data); 
        } catch (err) {
            if (err.response?.status === 401) handleAuthError();
            else setError("Lỗi tải dữ liệu: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [token, handleAuthError]); 

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const calculateTotal = (items) => {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((acc, item) => acc + (item.unit_price || 0) * (item.quantity || 0), 0);
    };
    
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn #${bookingId}? Hành động này không thể hoàn tác.`)) return;
        setIsCancelling(true);
        try {
            await axios.delete(`${API_CANCEL}/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
            alert(`Đã hủy thành công đơn hàng #${bookingId}`);
            fetchBookings(); // Reload lại danh sách
        } catch (err) {
            alert(`Hủy thất bại: ${err.response?.data?.message || "Lỗi kết nối"}`);
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) return <div style={styles.container}><p style={styles.statusText}>⏳ Đang tải dữ liệu...</p></div>;
    if (error) return <div style={styles.container}><p style={{...styles.statusText, color: DANGER_COLOR}}>{error}</p></div>;
    if (bookings.length === 0) return (
        <div style={styles.container}>
            <h2 style={styles.heading}><FaHistory style={{marginRight: '10px'}}/> LỊCH SỬ ĐẶT PHÒNG</h2>
            <p style={styles.statusText}>Bạn chưa có đơn đặt phòng nào.</p>
        </div>
    );

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}><FaHistory style={{marginRight: '10px'}}/> LỊCH SỬ ĐẶT PHÒNG</h2>
            
            {bookings.map((booking) => (
                <div key={booking.booking_id} style={styles.card}>
                    
                    {/* 1. Header Card */}
                    <div style={styles.cardHeader}>
                        <div style={styles.bookingId}>
                            #{booking.booking_id}
                            <span style={styles.badge}>ĐÃ XÁC NHẬN</span>
                        </div>
                        <div style={styles.bookingDate}>
                            <FaClock /> {new Date(booking.created_at).toLocaleString('vi-VN')}
                        </div>
                    </div>

                    {/* 2. Body Card */}
                    <div style={styles.cardBody}>
                        
                        {/* Cột Trái: Danh sách phòng */}
                        <div style={styles.roomList}>
                            <div style={styles.sectionTitle}><FaBed style={{marginRight:5}}/> Danh Sách Phòng</div>
                            {booking.items?.map(item => (
                                <div key={item.id} style={styles.item}>
                                    <img 
                                        src={item.image ? `/images/${item.image}` : `https://via.placeholder.com/80`} 
                                        alt="Room" style={styles.itemImage} 
                                    />
                                    <div style={styles.itemInfo}>
                                        <div style={styles.roomName}>{item.room_name}</div>
                                        <div style={styles.roomMeta}>
                                            Diện tích: {item.area ? `${item.area}m²` : 'N/A'} <br/>
                                            Sức chứa: {item.max_guests} người
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cột Phải: Thông tin chi tiết */}
                        <div style={styles.infoColumn}>
                            <div>
                                <div style={styles.sectionTitle}><FaUser style={{marginRight:5}}/> Thông Tin Khách</div>
                                <div style={styles.infoRow}><FaUser color="#9ca3af"/> {booking.client_name}</div>
                                <div style={styles.infoRow}><FaIdCard color="#9ca3af"/> {booking.cccd}</div>
                                <div style={styles.infoRow}>
                                    <FaMoneyBillWave color="#9ca3af"/> 
                                    {booking.payment_method === 'cash' ? 'Tiền mặt tại quầy' : 'Chuyển khoản ngân hàng'}
                                </div>
                                
                                <div style={{marginTop: '20px'}}></div>
                                <div style={styles.sectionTitle}><FaCalendarAlt style={{marginRight:5}}/> Thời Gian</div>
                                <div style={styles.infoRow}>
                                    Từ: <strong>{new Date(booking.check_in_date).toLocaleDateString('vi-VN')}</strong>
                                </div>
                                <div style={styles.infoRow}>
                                    Đến: <strong>{new Date(booking.check_out_date).toLocaleDateString('vi-VN')}</strong>
                                </div>
                            </div>

                            <div style={styles.totalArea}>
                                <span style={{fontSize:'0.9rem', color:'#666'}}>TỔNG THANH TOÁN</span>
                                <span style={styles.totalPrice}>
                                    {(booking.total_price || calculateTotal(booking.items)).toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Footer Actions */}
                    <div style={styles.cardFooter}>
                        <button
                            onClick={() => handleCancelBooking(booking.booking_id)}
                            style={{...styles.btn, ...styles.btnCancel}}
                            disabled={isCancelling}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                            <FaTrashAlt /> Hủy Đơn
                        </button>

                        <Link
                            to={`/booking_detail/${booking.booking_id}`}
                            style={{...styles.btn, ...styles.btnDetail}}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                            <FaInfoCircle /> Xem Chi Tiết
                        </Link>
                    </div>

                </div>
            ))}
        </div>
    );
}

export default UserBookings;