import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatbotWidget from "./ChatbotWidget";

// 🎨 CÁC ĐỊNH NGHĨA STYLE 

const ROYAL_COLOR = "#f3c300"; 
const DARK_BG = "#0f172a"; 
const LIGHT_BG = "#f9f9ff"; 
const TEXT_COLOR = "#ccc"; 
const BORDER_COLOR = "#3c475d"; 
const BUTTON_COLOR_GREEN = "#27ae60"; 

const styles = {
    // Style chung cho trang
    container: {
        padding: "0 20px 50px 20px", 
        backgroundColor: LIGHT_BG, 
        fontFamily: "serif", 
    },
    heading: {
        textAlign: "center",
        fontSize: "2.5rem",
        color: "#333",
        paddingTop: "40px", 
        fontWeight: "700",
    },
    
    // --- KHỐI BANNER ---
    bannerArea: {
        position: 'relative',
        width: '100%',
        height: '570px', 
        overflow: 'hidden',
        marginBottom: '0px', 
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    },
    bannerContent: {
        position: 'absolute',
        top: '10%', 
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: 'white',
        zIndex: 2,
    },
    bannerTitle: {
        fontSize: '3.5rem',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    bannerSubText: {
        fontSize: '1rem',
        marginBottom: '20px',
        maxWidth: '500px',
    },

    // --- KHỐI TÌM KIẾM (Đã chỉnh sửa layout cho 6 cột) ---
    filterWrapper: {
        maxWidth: "1100px",
        margin: "0 auto",
        position: 'relative',
        zIndex: 10, 
        marginTop: '-240px', 
    },
    filterContainer: {
        backgroundColor: DARK_BG, 
        color: "white",
        padding: "30px",
        borderRadius: "0px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        display: 'flex',
        flexDirection: 'column',
    },
    mainFilterTitle: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        color: ROYAL_COLOR, 
        marginBottom: "20px",
        textTransform: "uppercase",
        textAlign: 'center',
    },
    // 🔥 CẬP NHẬT GRID: Thêm cột cho Giá (1fr 1fr 1.2fr 0.6fr 0.6fr 0.8fr)
    filterGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1.2fr 0.6fr 0.6fr 0.8fr", 
        gap: "15px", 
        width: '100%',
        alignItems: 'flex-end', 
    },
    filterLabel: { 
        fontSize: '0.85rem',
        fontWeight: '600',
        marginBottom: '8px', 
        color: TEXT_COLOR,
        display: 'block',
        whiteSpace: 'nowrap', 
    },
    filterItem: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end', 
        minHeight: '80px', 
    },
    inputStyle: {
        padding: "12px",
        height: '48px', 
        borderRadius: "0px",
        border: `1px solid ${BORDER_COLOR}`, 
        backgroundColor: "#1e293b", 
        fontSize: "1rem",
        color: TEXT_COLOR, 
        colorScheme: 'dark', 
        width: '100%', 
        boxSizing: 'border-box', 
    },
    searchButton: {
        padding: "12px 10px",
        backgroundColor: BUTTON_COLOR_GREEN, 
        color: 'white', 
        border: "none",
        borderRadius: "0px", 
        fontWeight: "bold",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
        width: "100%",
        height: '48px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        fontSize: "0.9rem", // Giảm font chữ nút một chút để vừa
    },
    
    // --- Danh sách thẻ phòng ---
    productList: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "30px",
        maxWidth: "1100px",
        margin: "50px auto 0 auto", 
    },
    cardBase: {
        backgroundColor: "#fff",
        borderRadius: "0px", 
        overflow: "hidden", 
        boxShadow: "0 0 10px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        textAlign: "left",
    },
    cardHover: {
        transform: "translateY(-3px)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    },
    cardImage: {
        width: "100%",
        height: "240px",
        objectFit: "cover",
    },
    cardContent: {
        padding: "20px",
        paddingBottom: "15px", 
    },
    cardTitle: {
        fontSize: "1.2rem",
        color: "#444", 
        marginBottom: "5px",
        fontWeight: "600",
        textDecoration: 'none',
    },
    cardPrice: {
        fontSize: "1.5rem",
        color: BUTTON_COLOR_GREEN, 
        fontWeight: "bold",
        marginBottom: "10px",
    },
    cardDetails: {
        fontSize: "0.9rem",
        color: "#666",
        marginBottom: "5px",
    },
    bookingButton: {
        marginTop: "15px",
        padding: "10px 20px",
        backgroundColor: ROYAL_COLOR, 
        color: DARK_BG, 
        border: "none",
        borderRadius: "0px", 
        fontWeight: "bold",
        cursor: "pointer",
        width: "100%",
        textTransform: "uppercase",
        transition: "background-color 0.3s ease",
    }
};

function Home() {
    const navigate = useNavigate();
    
    const [filters, setFilters] = useState({
        checkIn: "", 
        checkOut: "", 
        adults: 1, 
        children: 0,
        maxPrice: "", // 🔥 Thêm state lọc giá
    });

    const [allProducts, setAllProducts] = useState([]); 
    const [displayRooms, setDisplayRooms] = useState([]); // Thay đổi tên cho rõ nghĩa hơn (Phòng đang hiển thị)
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [searchExecuted, setSearchExecuted] = useState(false); 

    const API_URL = "http://localhost:3001/api/rooms";

    // Hàm chọn N phòng ngẫu nhiên
    const selectRandomRooms = (data, count = 3) => {
        if (!data || data.length === 0) return [];
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const normalizeRoomData = (data) => {
        return data.map(item => ({
            ...item,
            image: item.main_image_url || item.image || 'placeholder.jpg', 
            price: parseFloat(item.price_per_night) || 0,
            beds: parseInt(item.beds) || 1,
            view: item.view || 'Đa dạng',
            description: item.description || '',
        }));
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(API_URL);
                const normalizedData = normalizeRoomData(res.data);
                
                setAllProducts(normalizedData);
                setDisplayRooms(selectRandomRooms(normalizedData, 3)); // Mặc định hiển thị 3 phòng random

            } catch (err) {
                console.error("Lỗi API:", err);
                setError("Không thể tải dữ liệu phòng.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // 🔥 LOGIC TÌM KIẾM THỰC SỰ (Đã update)
    const handleSearch = () => {
        console.log("Đang tìm kiếm với filters:", filters);
        setSearchExecuted(true);

        let results = allProducts;

        // 1. Lọc theo giá (Nếu có chọn)
        if (filters.maxPrice) {
            const maxPriceValue = parseFloat(filters.maxPrice);
            results = results.filter(room => room.price <= maxPriceValue);
        }

        // 2. Có thể thêm logic lọc giường ở đây nếu API có trường 'max_guests'
        // Tạm thời ta chỉ ưu tiên lọc giá như yêu cầu

        if (results.length > 0) {
            // Nếu tìm thấy, hiển thị tối đa 6 phòng phù hợp (hoặc 3 tùy bạn)
            setDisplayRooms(results.slice(0, 6));
        } else {
            setDisplayRooms([]); // Không tìm thấy
        }
    };

    if (loading) return <p style={{ textAlign: "center", padding: "50px", fontSize: "1.2rem" }}>Đang tải...</p>;
    if (error) return <p style={{ color: "#e8491d", textAlign: "center", padding: "50px", fontSize: "1.2rem" }}>{error}</p>;

    return (
        <div style={styles.container}>
            {/* 1. BANNER */}
            <section style={styles.bannerArea}>
                <img
                    src={`/images/dark_banner.jpg`} 
                    alt="Banner"
                    style={styles.bannerImage}
                    onError={(e) => { e.target.style.backgroundColor = '#ccc'; }}
                />
                <div style={styles.bannerOverlay}></div>
                <div style={styles.bannerContent}>
                    <p style={{ fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '5px' }}>TRÁNH XA CUỘC SỐNG ĐƠN ĐIỆU</p>
                    <h2 style={styles.bannerTitle}>Thư Giãn Tâm Trí</h2>
                    <p style={{...styles.bannerSubText, textAlign: "center", margin: "0 auto", maxWidth: "600px"}}>
                        Tìm kiếm chỗ ở hoàn hảo cho kỳ nghỉ tiếp theo của bạn ngay tại đây.
                    </p>
                    <button 
                        style={{ ...styles.bookingButton, width: '200px', margin: '0 auto', fontSize: '1rem', padding: '15px', color: DARK_BG }}
                        onClick={() => navigate('/rooms')}
                    >
                        BẮT ĐẦU NGAY
                    </button>
                </div>
            </section>

            {/* 2. KHỐI TÌM KIẾM (ĐÃ UPDATE) */}
            <div style={styles.filterWrapper}>
                <div style={styles.filterContainer}>
                    <h3 style={styles.mainFilterTitle}>ĐẶT PHÒNG CỦA BẠN</h3>
                    
                    <div style={styles.filterGrid}>
                        
                        {/* Ngày Nhận */}
                        <div style={styles.filterItem}>
                            <label htmlFor="checkIn" style={styles.filterLabel}>Ngày Nhận</label>
                            <input
                                id="checkIn" type="date" name="checkIn"
                                value={filters.checkIn} onChange={handleFilterChange}
                                style={styles.inputStyle}
                            />
                        </div>
                        
                        {/* Ngày Trả */}
                        <div style={styles.filterItem}>
                            <label htmlFor="checkOut" style={styles.filterLabel}>Ngày Trả</label>
                            <input
                                id="checkOut" type="date" name="checkOut"
                                value={filters.checkOut} onChange={handleFilterChange}
                                style={styles.inputStyle}
                            />
                        </div>

                        {/* 🔥 MỚI: Lọc theo Giá */}
                        <div style={styles.filterItem}>
                            <label htmlFor="maxPrice" style={styles.filterLabel}>Ngân sách / Đêm</label>
                            <select
                                id="maxPrice"
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
                        </div>
                        
                        {/* Người Lớn */}
                        <div style={styles.filterItem}>
                            <label htmlFor="adults" style={styles.filterLabel}>Người Lớn</label>
                            <select
                                id="adults" name="adults"
                                value={filters.adults} onChange={handleFilterChange}
                                style={{...styles.inputStyle, cursor: 'pointer'}}
                            >
                                {[...Array(10).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}
                            </select>
                        </div>
                        
                        {/* Trẻ Em */}
                        <div style={styles.filterItem}>
                            <label htmlFor="children" style={styles.filterLabel}>Trẻ Em</label>
                            <select
                                id="children" name="children"
                                value={filters.children} onChange={handleFilterChange}
                                style={{...styles.inputStyle, cursor: 'pointer'}}
                            >
                                {[...Array(5).keys()].map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>

                        {/* Nút Tìm */}
                        <button
                            onClick={handleSearch}
                            style={styles.searchButton}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2ecc71'} 
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = BUTTON_COLOR_GREEN} 
                        >
                            TÌM NGAY
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. DANH SÁCH PHÒNG */}
            <h1 style={styles.heading}>
                {searchExecuted ? "Kết Quả Tìm Kiếm" : "Khám phá Lựa chọn Phòng"}
            </h1>
            
            {searchExecuted && (
                <p style={{ textAlign: "center", marginBottom: "30px", fontSize: "1rem", color: "#666" }}>
                    {displayRooms.length > 0 
                        ? `Tìm thấy ${displayRooms.length} phòng phù hợp với tiêu chí.` 
                        : "Rất tiếc, không tìm thấy phòng nào phù hợp với mức giá này."}
                </p>
            )}

            <div style={styles.productList}>
                {displayRooms.length > 0 ? (
                    displayRooms.map((p, index) => (
                        <div
                            key={p.id || index}
                            onClick={() => navigate(`/rooms/${p.id || ''}`)}
                            style={hoveredCard === index ? { ...styles.cardBase, ...styles.cardHover } : styles.cardBase}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div>
                                <img
                                    src={`/images/${p.image}`} 
                                    alt={p.name}
                                    style={styles.cardImage}
                                    onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                                />
                            </div>
                            <div style={styles.cardContent}>
                                <h3 style={styles.cardTitle}>{p.name}</h3>
                                <p style={styles.cardPrice}>
                                    {p.price > 0 ? `${p.price.toLocaleString('vi-VN')} VNĐ/đêm` : 'Liên hệ'}
                                </p>
                                <p style={styles.cardDetails}>Giường: {p.beds} | View: {p.view}</p>
                                <button style={styles.bookingButton}>XEM CHI TIẾT</button>
                            </div>
                        </div>
                    ))
                ) : (
                    // Nếu không có phòng hiển thị (ví dụ mới vào lỗi hoặc search không ra)
                    !searchExecuted && (
                         <p style={{ textAlign: "center", width: '100%', gridColumn: '1/-1' }}>Đang tải danh sách...</p>
                    )
                )}
            </div>
            <ChatbotWidget />
        </div>
    );
}

export default Home;