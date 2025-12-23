import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Đã thay thế bằng axiosClient bên dưới
import axiosClient from '../api/config'; 
import { FaCreditCard, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa'; 

// 🎨 CÁC HẰNG SỐ THEME
const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";
const LIGHT_BG = "#f9f9ff"; 
const TEXT_COLOR = "#333"; 
const BUTTON_COLOR_GREEN = "#27ae60"; 
const BORDER_COLOR_LIGHT = "#ccc"; 

// Hàm tính số đêm thuê
const calculateNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

function Cart() {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(2); 
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [checkoutInfo, setCheckoutInfo] = useState({
        name: "", phone: "", address: "", cccd: "", 
        method: "cash", checkIn: "", checkOut: ""
    });
    const [paymentResult, setPaymentResult] = useState(null);

    const token = localStorage.getItem('token');

    // 🎨 STYLES
    const styles = {
        container: {
            padding: isMobile ? "20px 15px" : "50px 20px",
            maxWidth: "900px", margin: "0 auto", fontFamily: "serif", 
            backgroundColor: LIGHT_BG, minHeight: '100vh',
        },
        heading: {
            fontSize: isMobile ? "1.8rem" : "2.2rem",
            color: DARK_BG, marginBottom: "30px", fontWeight: "700", textAlign: 'left',
        },
        formGroup: { marginBottom: '15px', textAlign: 'left' },
        inputStyle: { width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px' },
        formBox: { backgroundColor: '#fff', padding: isMobile ? '20px' : '30px', borderRadius: '8px', boxShadow: "0 4px 15px rgba(0,0,0,0.1)", border: `1px solid #ddd` },
        statusText: { fontSize: '1.2rem', color: TEXT_COLOR, padding: '50px', textAlign: 'center' },
        checkoutLayout: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
            gap: '30px', alignItems: 'flex-start', marginTop: '20px',
        },
        roomSummary: {
            backgroundColor: '#fff', borderRadius: '8px', 
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)", border: `1px solid ${BORDER_COLOR_LIGHT}`, 
            overflow: 'hidden',
        },
        roomSummaryImage: { width: '100%', height: isMobile ? '180px' : '200px', objectFit: 'cover' },
        roomSummaryContent: { padding: '15px', textAlign: 'left' },
        roomSummaryPrice: { fontWeight: 'bold', color: '#e8491d', marginTop: '5px', fontSize: '1.1rem' },
        checkoutFormArea: {
            backgroundColor: '#fff', padding: isMobile ? '15px' : '20px', 
            borderRadius: '8px', boxShadow: "0 4px 15px rgba(0,0,0,0.1)", border: `1px solid ${BORDER_COLOR_LIGHT}`,
        },
        dateGroup: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '15px', marginBottom: '15px',
        },
        dateInput: { flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px' },
        actionButton: {
            background: BUTTON_COLOR_GREEN, color: 'white', border: 'none', padding: '12px 0', 
            borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', 
            width: '100%', transition: 'background 0.3s', marginTop: '15px',
        },
        formLabel: { display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: TEXT_COLOR, fontWeight: '600' }
    };

    const handleAuthError = useCallback((message = "Phiên đăng nhập đã hết hạn.") => {
        localStorage.removeItem('token'); localStorage.removeItem('userId'); localStorage.removeItem('username');
        window.dispatchEvent(new Event('auth-change')); navigate('/login');
    }, [navigate]);

    const fetchCartItems = useCallback(async () => {
        setLoading(true); setError(null);
        if (!token) {
            setError("Bạn cần đăng nhập để xem đơn đặt."); setLoading(false);
            handleAuthError(); return;
        }
        try {
            // SỬ DỤNG axiosClient: Chỉ cần truyền path '/cart'
            const res = await axiosClient.get('/cart'); 
            const initialRoom = res.data.length > 0 ? res.data[0] : null;
            if (initialRoom) {
                const price = initialRoom.price_per_night || initialRoom.price; 
                const imageUrl = initialRoom.main_image_url || initialRoom.room_details?.main_image_url || initialRoom.image || null;
                setCartItems([{ ...initialRoom, price: price, quantity: 1, main_image_url: imageUrl }]);
            } else { setCartItems([]); }
        } catch (err) {
            if (err.response?.status === 401) handleAuthError();
            else setError(`Lỗi tải thông tin: ${err.message}`);
        } finally { setLoading(false); }
    }, [token, handleAuthError]); 

    useEffect(() => { fetchCartItems(); }, [fetchCartItems]); 

    const nights = calculateNights(checkoutInfo.checkIn, checkoutInfo.checkOut);
    const roomItem = cartItems[0]; 
    const cartTotal = roomItem ? (roomItem.price || 0) * (nights > 0 ? nights : 1) : 0;

    const handleFormChange = (e) => setCheckoutInfo({ ...checkoutInfo, [e.target.name]: e.target.value });

    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        const { name, phone, address, cccd } = checkoutInfo;
        if (!name || !phone || !address || !cccd) return alert("Vui lòng điền đầy đủ thông tin.");
        if (nights === 0) return alert("Vui lòng chọn ngày nhận/trả phòng (Tối thiểu 1 đêm).");
        if (!roomItem) return alert("Không tìm thấy phòng.");
        
        setIsProcessing(true);
        try {
            const paymentData = { ...checkoutInfo, quantity: nights, totalPrice: cartTotal, cartId: roomItem.cart_id };
            
            // SỬ DỤNG axiosClient: Chỉ cần truyền path '/payments'
            const res = await axiosClient.post('/payments', paymentData);
            
            setPaymentResult({
                paymentId: res.data.paymentId, total: cartTotal, info: paymentData,
                date: new Date(), items: [roomItem], 
            });
            setStep(3); setCartItems([]); 
        } catch (err) {
            console.error(err); alert("Thanh toán thất bại.");
        } finally { setIsProcessing(false); }
    };

    if (loading) return <div style={styles.container}><p style={styles.statusText}>⏳ Đang tải thông tin xác nhận...</p></div>;
    if (error && !token) return <div style={styles.container}><p style={{ ...styles.statusText, color: '#e8491d' }}>{error}</p></div>;

    // --- BƯỚC 3: THÀNH CÔNG ---
    if (step === 3 && paymentResult) {
        const methodDisplay = paymentResult.info.method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản';
        return (
            <div style={styles.container}>
                <h2 style={{ ...styles.heading, color: '#38c172', textAlign: 'center' }}>
                    <FaCheckCircle style={{marginRight: '10px'}} /> ĐẶT PHÒNG THÀNH CÔNG!
                </h2>
                <div style={styles.formBox}>
                    <h3 style={{color: DARK_BG, marginBottom: '20px', textAlign: 'center'}}>Hóa Đơn Đặt Phòng</h3>
                    <div style={{textAlign: 'left', border: '1px solid #ddd', padding: '15px', borderRadius: '4px', fontSize: '0.95rem'}}>
                        <p><strong>Mã GD:</strong> #{paymentResult.paymentId}</p>
                        <p><strong>Ngày:</strong> {paymentResult.date.toLocaleDateString('vi-VN')}</p>
                        <p><strong>Khách:</strong> {paymentResult.info.name} - <strong>SĐT:</strong> {paymentResult.info.phone}</p>
                        <p><strong>Số đêm:</strong> {paymentResult.info.quantity} ({paymentResult.info.checkIn} ➝ {paymentResult.info.checkOut})</p>
                        <p><strong>TT:</strong> {methodDisplay}</p>
                        <hr style={{margin: '15px 0'}} />
                        <p><strong>Phòng:</strong> {paymentResult.items[0]?.name}</p>
                        <p style={{fontSize: '1.3rem', fontWeight: 'bold', color: '#e8491d', marginTop: '10px', textAlign: 'right'}}>
                            TỔNG: {paymentResult.total.toLocaleString('vi-VN')} VNĐ
                        </p>
                    </div>
                    <div style={{marginTop: '20px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px'}}>
                        <button style={{ ...styles.actionButton, background: DARK_BG, color: ROYAL_COLOR, marginTop: 0 }} onClick={() => window.print()}>IN HÓA ĐƠN</button>
                        <button style={{ ...styles.actionButton, background: ROYAL_COLOR, color: DARK_BG, marginTop: 0 }} onClick={() => navigate(`/bookings/`)}>LỊCH SỬ ĐẶT</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- BƯỚC 2: FORM ĐIỀN THÔNG TIN ---
    const room = roomItem; 
    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>XÁC NHẬN ĐẶT PHÒNG</h2>
            <div style={styles.checkoutLayout}>
                <div style={styles.roomSummary}>
                    {room ? (
                        <>
                            <img 
                                src={room.main_image_url ? `/images/${room.main_image_url}` : 'https://via.placeholder.com/400x200'} 
                                alt={room.name} style={styles.roomSummaryImage} 
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200'; }}
                            />
                            <div style={styles.roomSummaryContent}>
                                <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{room.name}</div>
                                <p style={styles.roomSummaryPrice}>{(room.price || 0).toLocaleString('vi-VN')} VNĐ / đêm</p>
                            </div>
                        </>
                    ) : <p style={styles.statusText}>Trống</p>}
                </div>

                <div style={styles.checkoutFormArea}>
                    <h3 style={{color: DARK_BG, marginBottom: '20px', fontWeight: 'bold'}}>THÔNG TIN KHÁCH HÀNG</h3>
                    <form onSubmit={handleConfirmPayment}>
                        <div style={styles.dateGroup}>
                            <div style={{flex: 1}}>
                                <label style={styles.formLabel}>Họ Tên</label>
                                <input type="text" name="name" value={checkoutInfo.name} onChange={handleFormChange} style={styles.inputStyle} required placeholder="Nguyễn Văn A" />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={styles.formLabel}>SĐT</label>
                                <input type="tel" name="phone" value={checkoutInfo.phone} onChange={handleFormChange} style={styles.inputStyle} required placeholder="0901234567" />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Địa Chỉ</label>
                            <input type="text" name="address" value={checkoutInfo.address} onChange={handleFormChange} style={styles.inputStyle} required />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>CCCD / CMND</label>
                            <input type="text" name="cccd" value={checkoutInfo.cccd} onChange={handleFormChange} style={styles.inputStyle} required />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Phương Thức TT</label>
                            <select name="method" value={checkoutInfo.method} onChange={handleFormChange} style={styles.inputStyle} required>
                                <option value="cash">Tiền mặt (Tại khách sạn)</option>
                                <option value="atm">Chuyển khoản Ngân hàng</option>
                            </select>
                        </div>
                        
                        <div style={{borderTop: '1px dashed #ccc', margin: '20px 0'}}></div>

                        <div style={styles.dateGroup}>
                            <div style={{flex: 1}}>
                                <label style={styles.formLabel}>Ngày Nhận</label>
                                <input type="date" name="checkIn" value={checkoutInfo.checkIn} onChange={handleFormChange} style={styles.dateInput} required />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={styles.formLabel}>Ngày Trả</label>
                                <input type="date" name="checkOut" value={checkoutInfo.checkOut} onChange={handleFormChange} style={styles.dateInput} required />
                            </div>
                        </div>
                        
                        {nights > 0 && (
                            <div style={{backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '5px', border: '1px solid #bbf7d0', marginBottom: '10px'}}>
                                <p style={{fontSize: '1rem', color: '#166534', display: 'flex', justifyContent: 'space-between'}}>
                                    <span>Đơn giá:</span> <strong>{(room?.price || 0).toLocaleString()} x {nights} đêm</strong>
                                </p>
                                <hr style={{margin: '10px 0', borderTop: '1px dashed #bbf7d0'}}/>
                                <p style={{fontSize: '1.3rem', fontWeight: 'bold', color: '#e8491d', textAlign: 'right'}}>
                                    {cartTotal.toLocaleString('vi-VN')} VNĐ
                                </p>
                            </div>
                        )}

                        <button type="submit" style={styles.actionButton} disabled={isProcessing || nights === 0 || !room}>
                            {isProcessing ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT PHÒNG'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Cart;