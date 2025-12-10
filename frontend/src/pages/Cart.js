import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa'; 

// 🎨 CÁC HẰNG SỐ THEME
const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";
const LIGHT_BG = "#f9f9ff"; 
const TEXT_COLOR = "#333"; 
const BUTTON_COLOR_GREEN = "#27ae60"; 
const BORDER_COLOR_LIGHT = "#ccc"; 

const styles = {
    container: {
        padding: "50px 20px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "serif",
        backgroundColor: LIGHT_BG,
        minHeight: '100vh',
    },
    heading: {
        fontSize: "2.2rem",
        color: DARK_BG,
        marginBottom: "30px",
        fontWeight: "700",
        textAlign: 'left',
    },
    // --- Styles cho Form và Success ---
    formGroup: {
        marginBottom: '15px',
        textAlign: 'left',
    },
    inputStyle: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        boxSizing: 'border-box',
    },
    formBox: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        border: `1px solid #ddd`,
    },
    statusText: {
        fontSize: '1.2rem',
        color: TEXT_COLOR,
        padding: '50px',
        textAlign: 'center',
    },
    // --- STYLES CHO BƯỚC XÁC NHẬN (STEP 2) ---
    checkoutLayout: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '30px',
        alignItems: 'flex-start',
        marginTop: '30px',
    },
    roomSummary: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        border: `1px solid ${BORDER_COLOR_LIGHT}`,
        overflow: 'hidden',
    },
    roomSummaryImage: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
    },
    roomSummaryContent: {
        padding: '15px',
        textAlign: 'left',
    },
    roomSummaryPrice: {
        fontWeight: 'bold',
        color: '#e8491d',
        marginTop: '5px',
        fontSize: '1.1rem',
    },
    checkoutFormArea: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        border: `1px solid ${BORDER_COLOR_LIGHT}`,
    },
    dateGroup: {
        display: 'flex',
        gap: '15px',
        marginBottom: '15px',
    },
    dateInput: {
        flex: 1,
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        boxSizing: 'border-box',
    },
    actionButton: {
        background: BUTTON_COLOR_GREEN,
        color: 'white',
        border: 'none',
        padding: '12px 0',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        width: '100%',
        transition: 'background 0.3s',
        marginTop: '15px',
    },
    formLabel: {
        display: 'block',
        fontSize: '0.9rem',
        marginBottom: '5px',
        color: TEXT_COLOR,
    }
};

// Hàm tính số đêm thuê
const calculateNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 0;

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    if (isNaN(start) || isNaN(end) || end <= start) return 0;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
};


function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(2); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutInfo, setCheckoutInfo] = useState({

    });
    const [paymentResult, setPaymentResult] = useState(null);

    const token = localStorage.getItem('token');
    
    const API_CART = "http://localhost:3001/api/cart";
    const API_PAYMENT = "http://localhost:3001/api/payments";

    // Xử lý lỗi xác thực và chuyển hướng
    const handleAuthError = useCallback((message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.") => {
        console.warn(message);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.dispatchEvent(new Event('auth-change')); 
        navigate('/login');
    }, [navigate]);

    // LOGIC TẢI DỮ LIỆU GIỎ HÀNG
    const fetchCartItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        if (!token) {
            setError("Bạn cần đăng nhập để xem đơn đặt.");
            setLoading(false);
            handleAuthError("Không tìm thấy token. Chuyển hướng đến đăng nhập.");
            return;
        }

        try {
            const res = await axios.get(API_CART, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const initialRoom = res.data.length > 0 ? res.data[0] : null;
            
            if (initialRoom) {
                const price = initialRoom.price_per_night || initialRoom.price; 
                
                const imageUrl = initialRoom.main_image_url || initialRoom.room_details?.main_image_url || initialRoom.image || null;
                
                setCartItems([{
                    ...initialRoom, 
                    price: price, 
                    quantity: 1,
                    main_image_url: imageUrl 
                }]);
            } else {
                setCartItems([]);
            }

        } catch (err) {
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                handleAuthError();
            } else {
                setError(`Lỗi tải thông tin đơn đặt: ${err.response?.data?.message || err.message}`);
            }
        } finally {
            setLoading(false);
        }
    }, [token, handleAuthError]); 

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]); 

    // Tính toán Total DỰA TRÊN SỐ NGÀY THUÊ
    const nights = calculateNights(checkoutInfo.checkIn, checkoutInfo.checkOut);
    const roomItem = cartItems[0]; 
    
    const cartTotal = roomItem 
        ? (roomItem.price || 0) * (nights > 0 ? nights : 1)
        : 0;

    // HANDLERS (Form thanh toán)
    const handleFormChange = (e) => {
        setCheckoutInfo({ ...checkoutInfo, [e.target.name]: e.target.value });
    };

    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        const { name, phone, address, cccd, method } = checkoutInfo;

        // 1. VALIDATION CỦA FORM
        if (!name || !phone || !address || !cccd) {
            alert("Vui lòng điền đầy đủ Tên, SĐT, Địa chỉ và CCCD.");
            return;
        }
        if (nights === 0) {
              alert("Vui lòng chọn ngày nhận phòng và ngày trả phòng hợp lệ (Tối thiểu 1 đêm).");
              return;
        }
        if (!token) return handleAuthError(); 
        if (!roomItem) {
              alert("Không tìm thấy phòng để thanh toán.");
              return;
        }
        
        setIsProcessing(true);

        try {
            const paymentData = {
                ...checkoutInfo,
                quantity: nights, 
                totalPrice: cartTotal,
                cartId: roomItem.cart_id, 
            };

            const res = await axios.post(API_PAYMENT, paymentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const bookingId = res.data.paymentId;

            // Khôi phục thông tin cần thiết cho hóa đơn (Dữ liệu mô phỏng)
            setPaymentResult({
                paymentId: bookingId,
                total: cartTotal,
                info: paymentData,
                date: new Date(),
                items: [roomItem], 
            });
            setStep(3);
            setCartItems([]); 

        } catch (err) {
            console.error("Lỗi thanh toán:", err.response?.data?.message || err.message);
            
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleAuthError();
            } else {
                alert(`Thanh toán thất bại: ${err.response?.data?.message || "Lỗi kết nối."}`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // ------------------------------------
    // RENDERING
    // ------------------------------------

    if (loading)
        return <div style={styles.container}><p style={styles.statusText}>⏳ Đang tải thông tin xác nhận...</p></div>;
    
    if (error && token === null)
        return (
            <div style={styles.container}>
                <p style={{ ...styles.statusText, color: '#e8491d', textAlign: 'center' }}>
                    {error}
                </p>
            </div>
        );

    // --- RENDER BƯỚC 3: XÁC NHẬN THÀNH CÔNG ---
    if (step === 3 && paymentResult) {
        const bookingId = paymentResult.paymentId;
        
        const methodDisplay = paymentResult.info.method === 'cash' 
            ? 'Thanh toán tiền mặt' 
            : 'Chuyển khoản ngân hàng (ATM)';

        return (
            <div style={styles.container}>
                <h2 style={{ ...styles.heading, color: '#38c172' }}>
                    <FaCheckCircle style={{marginRight: '10px'}} /> ĐẶT PHÒNG THÀNH CÔNG!
                </h2>
                <div style={styles.formBox}>
                    <h3 style={{color: DARK_BG, marginBottom: '20px'}}>Hóa Đơn Đặt Phòng</h3>
                    
                    <div style={{textAlign: 'left', border: '1px solid #ddd', padding: '20px', borderRadius: '4px'}}>
                        <p><strong>Mã giao dịch:</strong> #{bookingId}</p>
                        <p><strong>Thời gian:</strong> {paymentResult.date.toLocaleString('vi-VN')}</p>
                        <p><strong>Người thuê:</strong> {paymentResult.info.name}</p>
                        <p><strong>CCCD:</strong> {paymentResult.info.cccd}</p>
                        <p><strong>SĐT:</strong> {paymentResult.info.phone}</p>
                        <p><strong>Số đêm thuê:</strong> {paymentResult.info.quantity} đêm ({paymentResult.info.checkIn} đến {paymentResult.info.checkOut})</p>
                        <p><strong>Phương thức:</strong> {methodDisplay}</p>
                        
                        <h4 style={{marginTop: '20px', marginBottom: '10px', color: ROYAL_COLOR}}>Phòng đã đặt:</h4>
                        <ul style={{listStyle: 'disc', marginLeft: '20px', color: TEXT_COLOR}}>
                            {paymentResult.items.map(item => (
                                <li key={item.room_id || item.product_id}>
                                    {item.name} 
                                </li>
                            ))}
                        </ul>

                        <hr style={{margin: '15px 0'}} />
                        <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#e8491d'}}>
                            TỔNG TIỀN: {paymentResult.total.toLocaleString('vi-VN')} VNĐ
                        </p>
                    </div>

                    <button 
                        style={{ ...styles.actionButton, width: 'auto', marginRight: '10px', background: DARK_BG, color: ROYAL_COLOR }}
                        onClick={() => window.print()}
                    >
                        IN HÓA ĐƠN
                    </button>
                    
                    <button 
                        style={{ ...styles.actionButton, width: 'auto', background: ROYAL_COLOR, color: DARK_BG }}
                        onClick={() => navigate(`/bookings/`)} 
                    >
                        XEM CHI TIẾT ĐƠN ĐẶT
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER GIAO DIỆN XÁC NHẬN (STEP 2) ---
    const room = roomItem; 
    const roomNameDisplay = room?.name || "Chưa có phòng";
    const roomPricePerNight = (room?.price || 0).toLocaleString('vi-VN') + " VNĐ";
    
    const roomImageSrc = room?.main_image_url ? `/images/${room.main_image_url}` : `https://via.placeholder.com/400x200?text=Room+Image`;
    
    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>
                XÁC NHẬN ĐẶT PHÒNG
            </h2>
            
            <div style={styles.checkoutLayout}>
                {/* 1. CỘT TRÁI: TÓM TẮT PHÒNG */}
                <div style={styles.roomSummary}>
                    {room ? (
                        <>
                            <img 
                                src={roomImageSrc} 
                                alt={roomNameDisplay} 
                                style={styles.roomSummaryImage} 
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found'; 
                                    console.error("Lỗi tải ảnh:", roomImageSrc);
                                }}
                            />
                            <div style={styles.roomSummaryContent}>
                                <div style={styles.roomName}>{roomNameDisplay}</div>
                                <p style={styles.roomSummaryPrice}>
                                    {roomPricePerNight} / đêm
                                </p>
                            </div>
                        </>
                    ) : (
                        <p style={styles.statusText}>Không tìm thấy phòng trong đơn đặt.</p>
                    )}
                </div>

                {/* 2. CỘT PHẢI: FORM NHẬP THÔNG TIN */}
                <div style={styles.checkoutFormArea}>
                    <h3 style={{color: DARK_BG, marginBottom: '20px', fontWeight: 'bold'}}>CHI TIẾT THANH TOÁN</h3>
                    <form onSubmit={handleConfirmPayment}>
                        
                        {/* Tên và SĐT (2 cột) */}
                        <div style={styles.dateGroup}>
                            <div style={{flex: 1}}>
                                <label style={styles.formLabel}>Tên</label>
                                <input 
                                    type="text" name="name" value={checkoutInfo.name} 
                                    onChange={handleFormChange} style={styles.inputStyle} required 
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={styles.formLabel}>Số Điện Thoại</label>
                                <input 
                                    type="tel" name="phone" value={checkoutInfo.phone} 
                                    onChange={handleFormChange} style={styles.inputStyle} required 
                                />
                            </div>
                        </div>

                        {/* Địa chỉ (1 cột) */}
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Địa Chỉ</label>
                            <input 
                                type="text" name="address" value={checkoutInfo.address} 
                                onChange={handleFormChange} style={styles.inputStyle} required 
                            />
                        </div>
                        
                        {/* CCCD (1 cột) */}
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>CCCD</label>
                            <input 
                                type="text" name="cccd" value={checkoutInfo.cccd} 
                                onChange={handleFormChange} style={styles.inputStyle} required 
                            />
                        </div>

                        {/* 🌟 PHƯƠNG THỨC THANH TOÁN */}
                        <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Phương Thức Thanh Toán</label>
                            <select
                                name="method"
                                value={checkoutInfo.method}
                                onChange={handleFormChange}
                                style={styles.inputStyle}
                                required
                            >
                                <option value="cash">Tiền mặt (Thanh toán tại khách sạn)</option>
                                <option value="atm">Chuyển khoản (ATM/Bank Transfer)</option>
                            </select>
                        </div>
                        
                        {/* Ngày Nhận/Trả phòng (2 cột) */}
                        <div style={styles.dateGroup}>
                            <div style={{flex: 1}}>
                                <label style={styles.formLabel}>Ngày Nhận Phòng</label>
                                <input 
                                    type="date" name="checkIn" value={checkoutInfo.checkIn} 
                                    onChange={handleFormChange} style={styles.dateInput} required 
                                />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={styles.formLabel}>Ngày Trả Phòng</label>
                                <input 
                                    type="date" name="checkOut" value={checkoutInfo.checkOut} 
                                    onChange={handleFormChange} style={styles.dateInput} required 
                                />
                            </div>
                        </div>
                        
                        {/* Lỗi và Tổng tiền */}
                        {nights === 0 && checkoutInfo.checkIn && checkoutInfo.checkOut && (
                            <p style={{color: '#e8491d', fontSize: '0.9rem', textAlign: 'left', marginBottom: '10px'}}>
                                <FaCalendarAlt style={{marginRight: '5px'}}/> Cung cấp ngày nhận phòng và trả phòng hợp lệ!
                            </p>
                        )}
                        {nights > 0 && (
                            <p style={{fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'right', marginTop: '20px'}}>
                                Tổng {nights} đêm: {cartTotal.toLocaleString('vi-VN')} VNĐ
                            </p>
                        )}


                        <button 
                            type="submit"
                            style={styles.actionButton}
                            disabled={isProcessing || nights === 0 || !room}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#2ecc71'}
                            onMouseLeave={(e) => e.currentTarget.style.background = BUTTON_COLOR_GREEN}
                        >
                            {isProcessing ? 'ĐANG ĐẶT PHÒNG...' : 'ĐẶT PHÒNG NGAY'}
                        </button>
                        
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Cart;