import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// 🎨 CÁC HẰNG SỐ THEME
const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";
const LIGHT_BG = "#f9f9ff";
const TEXT_COLOR = "#333";
const BORDER_COLOR_LIGHT = "#ccc";
const BUTTON_COLOR_GREEN = "#27ae60";

const styles = {
    // --- Styles (Giữ nguyên) ---
    container: {
        padding: "30px 20px",
        backgroundColor: LIGHT_BG,
        fontFamily: "serif",
        minHeight: '100vh',
    },
    mainLayout: {
        display: "flex",
        maxWidth: "1200px",
        margin: "20px auto",
        gap: "30px",
    },
    sidebar: {
        width: "300px",
        flexShrink: 0,
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        height: 'fit-content',
    },
    sidebarTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: DARK_BG,
        marginBottom: '20px',
        borderBottom: `1px solid ${BORDER_COLOR_LIGHT}`,
        paddingBottom: '10px',
    },
    filterSection: {
        marginBottom: '20px',
        paddingTop: '15px',
    },
    filterSectionTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: TEXT_COLOR,
        marginBottom: '10px',
        textTransform: 'uppercase',
    },
    inputStyle: {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        border: `1px solid ${BORDER_COLOR_LIGHT}`,
        borderRadius: '4px',
        boxSizing: 'border-box',
        fontSize: '0.9rem',
        paddingRight: '30px',
    },
    checkboxItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
        fontSize: '0.95rem',
        color: TEXT_COLOR,
    },
    content: {
        flexGrow: 1,
        minWidth: '600px',
    },
    roomCard: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        marginBottom: '20px',
        display: 'flex',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        '&:hover': {
            transform: 'translateY(-2px)',
        }
    },
    cardImageArea: {
        width: '250px',
        height: '250px',
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: '8px',
        margin: '15px',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
    },
    cardInfo: {
        padding: '15px 15px 15px 0',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardDetails: {
        flex: 2,
        paddingRight: '15px',
    },
    cardTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: DARK_BG,
        marginBottom: '5px',
    },
    cardPriceArea: {
        flex: 1,
        textAlign: 'right',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: '1.4rem',
        fontWeight: 'bold',
        color: '#e8491d',
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        alignItems: 'flex-end',
    },
    bookBtn: {
        background: BUTTON_COLOR_GREEN,
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background 0.3s',
        fontWeight: 'bold',
        width: '120px',
        textDecoration: 'none',
        textAlign: 'center',
        display: 'block', 
    },
    detailBtn: {
        background: '#fff',
        color: TEXT_COLOR,
        border: `1px solid ${BORDER_COLOR_LIGHT}`,
        padding: '7.5px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        width: '89px',
        textDecoration: 'none',
        textAlign: 'center',
        display: 'block', 
    },
    statusText: {
        fontSize: '1.2rem',
        color: TEXT_COLOR,
        padding: '50px',
        textAlign: 'center',
    },
};

const DUMMY_AMENITIES = ["Wifi", "Điều Hoà", "Tivi", "Spa", "Máy Sưởi", "Nóng Lạnh"];

function HotelList() {
    const [allRooms, setAllRooms] = useState([]); 
    const [rooms, setRooms] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isBooking, setIsBooking] = useState(false); 

    const [filters, setFilters] = useState({
        checkIn: "",
        checkOut: "",
        adults: 1,
        children: 0,
        amenities: [],
        maxPrice: "", // 🔥 MỚI: Thêm trường maxPrice vào state
    });

    const API_URL = "http://localhost:3001/api/rooms"; 
    const API_CART = "http://localhost:3001/api/cart";

    // --- XỬ LÝ ĐẶT PHÒNG (Giữ nguyên) ---
    const handleBookNow = async (roomId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Vui lòng đăng nhập để đặt phòng.");
            navigate('/login');
            return;
        }
        if (isBooking) return;
        setIsBooking(true);
        try {
            const response = await axios.post(API_CART, 
                { room_id: roomId, quantity: 1 }, 
                { headers: { Authorization: `Bearer ${token}` }}
            );
            alert(response.data.message || "Phòng đã được thêm vào đơn đặt.");
            navigate('/cart'); 
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Đặt phòng thất bại.");
        } finally {
            setIsBooking(false);
        }
    };

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await axios.get(API_URL);
                const mappedRooms = res.data.map((item) => {
                    const roomAmenities = item.facilities ? item.facilities.split(',').map(f => f.trim()) : [];
                    return {
                        id: item.id,
                        name: item.name || `Phòng số ${item.id}`,
                        // Đảm bảo price là số để so sánh
                        price: parseFloat(item.price_per_night) || 800000, 
                        priceFormatted: (parseFloat(item.price_per_night) || 800000).toLocaleString("vi-VN") + " VNĐ mỗi đêm",
                        image: item.main_image_url ? `/images/${item.main_image_url}` : `https://picsum.photos/250/250?random=${item.id}`,
                        basis: item.basis || "Cơ Sở: Phòng Ngủ, Phòng Bếp",
                        max_guests: parseInt(item.max_guests) || 1, 
                        guests: item.max_guests ? `${item.max_guests} Người Lớn` : "1 Người Lớn",
                        children: "3 Trẻ Em", 
                        amenities: roomAmenities.length > 0 ? roomAmenities : DUMMY_AMENITIES.slice(0, 3), 
                    };
                });
                setAllRooms(mappedRooms);
                setRooms(mappedRooms);
            } catch (err) {
                setError("Không thể tải danh sách phòng.");
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [API_URL]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFilters(prev => ({
                ...prev,
                amenities: checked ? [...prev.amenities, name] : prev.amenities.filter(a => a !== name)
            }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // 🎯 LOGIC LỌC PHÒNG (CẬP NHẬT)
    const handleSearch = useCallback(() => {
        const requiredGuests = parseInt(filters.adults) + parseInt(filters.children);
        
        // Lấy giá trị maxPrice từ state
        const maxPriceValue = filters.maxPrice ? parseFloat(filters.maxPrice) : null;

        const filtered = allRooms.filter(room => {
            // 1. Lọc sức chứa
            const capacityCheck = room.max_guests >= requiredGuests;

            // 2. Lọc tiện nghi
            const requiredAmenities = filters.amenities;
            let amenityCheck = true;
            if (requiredAmenities.length > 0) {
                amenityCheck = requiredAmenities.every(reqAmenity => 
                    room.amenities.some(roomAmenity => 
                        roomAmenity.toLowerCase().includes(reqAmenity.toLowerCase())
                    )
                );
            }

            // 3. 🔥 MỚI: Lọc theo Giá
            let priceCheck = true;
            if (maxPriceValue !== null) {
                priceCheck = room.price <= maxPriceValue;
            }

            return capacityCheck && amenityCheck && priceCheck;
        });

        setRooms(filtered);
    }, [filters, allRooms]);

    if (loading) return <div style={styles.container}><p style={styles.statusText}>⏳ Đang tải danh sách phòng...</p></div>;
    if (error) return <div style={styles.container}><p style={{...styles.statusText, color: 'red'}}>{error}</p></div>;

    return (
        <div style={styles.container}>
            <div style={styles.mainLayout}>
                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <h3 style={styles.sidebarTitle}>Tìm Kiếm & Lọc</h3>
                    
                    <div style={styles.filterSection}>
                        <p style={styles.filterSectionTitle}>Kiểm Tra Ngày & Khách</p>
                        
                        {/* Ngày tháng (Giữ nguyên) */}
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Ngày Nhận Phòng</label>
                        <input type="date" name="checkIn" value={filters.checkIn} onChange={handleFilterChange} style={styles.inputStyle} />
                        
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Ngày Trả Phòng</label>
                        <input type="date" name="checkOut" value={filters.checkOut} onChange={handleFilterChange} style={styles.inputStyle} />

                        {/* 🔥 MỚI: Select chọn Ngân sách/Giá */}
                        <label style={{ display: 'block', marginTop: '10px', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#000' }}>
                           Gía Phòng
                        </label>
                        <select
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            style={{...styles.inputStyle, cursor: 'pointer'}}
                        >
                            <option value="">Tất cả mức giá</option>
                            <option value="500000">Dưới 500.000 VNĐ</option>
                            <option value="1000000">Dưới 1.000.000 VNĐ</option>
                            <option value="2000000">Dưới 2.000.000 VNĐ</option>
                            <option value="3000000">Dưới 3.000.000 VNĐ</option>
                            <option value="5000000">Dưới 5.000.000 VNĐ</option>
                        </select>

                        {/* Khách (Giữ nguyên) */}
                        <label style={{ display: 'block', marginTop: '5px', marginBottom: '5px', fontSize: '0.9rem' }}>Người Lớn</label>
                        <select name="adults" value={filters.adults} onChange={handleFilterChange} style={styles.inputStyle}>
                            {[...Array(6).keys()].map(i => <option key={i + 1} value={i + 1}>{i + 1} Người Lớn</option>)}
                        </select>

                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Trẻ Em</label>
                        <select name="children" value={filters.children} onChange={handleFilterChange} style={styles.inputStyle}>
                            {[...Array(4).keys()].map(i => <option key={i} value={i}>{i} Trẻ Em</option>)}
                        </select>

                        <button 
                            onClick={handleSearch} 
                            style={{ ...styles.bookBtn, background: BUTTON_COLOR_GREEN, color: 'white', width: '100%', marginTop: '10px' }}
                        >
                            ÁP DỤNG LỌC
                        </button>
                    </div>

                    {/* Tiện nghi (Giữ nguyên) */}
                    <div style={styles.filterSection}>
                        <p style={styles.filterSectionTitle}>Tiện Nghi</p>
                        {DUMMY_AMENITIES.map((amenity) => (
                            <div key={amenity} style={styles.checkboxItem}>
                                <input
                                    type="checkbox" id={amenity} name={amenity}
                                    checked={filters.amenities.includes(amenity)}
                                    onChange={handleFilterChange}
                                    style={{ marginRight: '10px' }}
                                />
                                <label htmlFor={amenity}>{amenity}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DANH SÁCH PHÒNG */}
                <div style={styles.content}>
                    <h1 style={{fontSize: '2rem', color: DARK_BG, marginBottom: '20px'}}>
                        Kết Quả ({rooms.length} phòng)
                    </h1>
                    {rooms.length > 0 ? (
                        rooms.map((room) => (
                            <div key={room.id} style={styles.roomCard}>
                                <div style={styles.cardImageArea}>
                                    <img 
                                        src={room.image} alt={room.name} style={styles.cardImage} 
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/250x250?text=Room+Image"; }}
                                    />
                                </div>
                                <div style={styles.cardInfo}>
                                    <div style={styles.cardDetails}>
                                        <h3 style={styles.cardTitle}>{room.name}</h3>
                                        <p style={{ color: '#777', marginBottom: '10px' }}>{room.basis}</p>
                                        <div style={{ marginBottom: '10px' }}>
                                            <p style={{ fontWeight: '600', marginBottom: '5px' }}>Tiện Nghi:</p>
                                            <p style={{ fontSize: '0.9rem', color: '#666' }}>{Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities}</p>
                                        </div>
                                        <p style={{ fontWeight: '600', marginBottom: '5px' }}>Khách Hàng:</p>
                                        <p style={{ fontSize: '0.9rem', color: '#666' }}>{room.guests}, {room.children}</p>
                                    </div>
                                    <div style={styles.cardPriceArea}>
                                        <p style={styles.priceText}>{room.priceFormatted}</p>
                                        <div style={styles.buttonContainer}>
                                            <button 
                                                style={{ ...styles.bookBtn, background: BUTTON_COLOR_GREEN }}
                                                onClick={() => handleBookNow(room.id)} 
                                                disabled={isBooking}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2ecc71'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BUTTON_COLOR_GREEN}
                                            >
                                                {isBooking ? 'Đang Đặt...' : 'Đặt Ngay'}
                                            </button>
                                            <Link
                                                to={`/rooms/${room.id}`}
                                                style={styles.detailBtn}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                            >
                                                Chi Tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{...styles.statusText, textAlign: 'center'}}>
                            Không tìm thấy phòng phù hợp với tiêu chí lọc của bạn. Vui lòng thử lại.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HotelList;