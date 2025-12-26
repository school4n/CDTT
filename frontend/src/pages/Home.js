import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Thay thế bằng axiosClient
import axiosClient from "../api/config"; 
import ChatbotWidget from "./ChatbotWidget";
import SearchWidget from "./SearchWidget"; 

// 🎨 MÀU SẮC
const TRIP_ORANGE = "#ff9500"; 
const LIGHT_BG = "#f5f7fa"; 

const styles = {
    container: {
        padding: "0 0 50px 0", 
        backgroundColor: LIGHT_BG, 
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        minHeight: "100vh",
    },
    bannerArea: {
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        marginBottom: '0px', 
        backgroundColor: '#2b56cc', 
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center center', 
    },
    bannerOverlay: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)', 
    },
    bannerContent: {
        position: 'absolute', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '100%',
        maxWidth: '1100px', 
        padding: '0 20px', 
        boxSizing: 'border-box',
        zIndex: 2,
    },
    bannerTitle: {
        color: 'white',
        fontWeight: '800', 
        marginBottom: '0', 
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        textAlign: 'left', 
    },
    dotStyle: {
        color: TRIP_ORANGE, 
        marginLeft: '5px',
        fontSize: '1.2em', 
    },
    searchContainerWrapper: {
        padding: '0 20px',
        position: 'relative',
        zIndex: 10,
    },
    heading: { textAlign: "center", color: "#333", paddingTop: "40px", fontWeight: "800" },
    productList: { display: "grid", gap: "20px", maxWidth: "1100px", margin: "30px auto 0 auto", padding: "0 20px" },
    cardBase: { backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.3s ease" },
    cardHover: { transform: "translateY(-5px)" },
    cardImage: { width: "100%", height: "200px", objectFit: "cover" },
    cardContent: { padding: "15px" },
    cardTitle: { fontSize: "1.1rem", color: "#333", fontWeight: "700", marginBottom: "5px" },
    cardPrice: { fontSize: "1.3rem", color: "#2b56cc", fontWeight: "bold", marginBottom: "5px" },
    bookingButton: { marginTop: "10px", width: "100%", padding: "10px", backgroundColor: "#eef2ff", color: "#2b56cc", fontWeight: "bold", border: "none", borderRadius: "4px", cursor: "pointer" }
};

function Home() {
    const navigate = useNavigate();
    
    // 📱 Check Mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // State data
    const [displayRooms, setDisplayRooms] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState(null);

// <<<<<<< HEAD
//     const API_URL = "https://my-backend-mocha-phi.vercel.app/api/rooms";

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
                // SỬ DỤNG axiosClient: Chỉ cần truyền phần đuôi '/rooms'
                const res = await axiosClient.get('/rooms');
                const data = res.data.map(item => ({
                    ...item,
                    image: item.main_image_url || item.image || 'placeholder.jpg', 
                    price: parseFloat(item.price_per_night) || 0,
                    beds: parseInt(item.beds) || 1,
                    view: item.view || 'Đa dạng',
                }));
                // Lấy ngẫu nhiên 3 phòng hiển thị
                setDisplayRooms([...data].sort(() => 0.5 - Math.random()).slice(0, 3));
            } catch (err) { 
                console.error("Lỗi lấy danh sách phòng:", err); 
            } 
            finally { setLoading(false); }
        };
        fetchProducts();
    }, []);

    return (
        <div style={styles.container}>
            {/* 1. BANNER */}
            <section style={{
                ...styles.bannerArea, 
                height: isMobile ? '380px' : '480px'
            }}>
                <img 
                    src={`/images/santorini-banner.jpg`} 
                    alt="Banner" 
                    style={styles.bannerImage} 
                    onError={(e)=>{e.target.style.backgroundColor='#85a5ff'}} 
                />
                <div style={styles.bannerOverlay}></div>
                
                <div style={{
                    ...styles.bannerContent,
                    top: isMobile ? '12%' : '35%'
                }}>
                    <h1 style={{...styles.bannerTitle, fontSize: isMobile ? '2.2rem' : '3.5rem'}}>
                        Khách Sạn<span style={styles.dotStyle}>.</span>
                    </h1>
                </div>
            </section>

            {/* 2. KHỐI TÌM KIẾM */}
            <div style={{
                ...styles.searchContainerWrapper,
                marginTop: isMobile ? '-200px' : '-140px'
            }}>
                <SearchWidget isMobile={isMobile} />
            </div>

            {/* 3. DANH SÁCH GỢI Ý */}
            <h2 style={{...styles.heading, fontSize: isMobile ? '1.5rem' : '2rem'}}>
                Điểm Đến Nổi Bật cho dân chơi
            </h2>

            <div style={{...styles.productList, gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)"}}>
                {loading ? (
                    <p style={{textAlign:'center', gridColumn: '1/-1'}}>Đang tải...</p>
                ) : (
                    displayRooms.map((p, index) => (
                        <div
                            key={p.id || index}
                            onClick={() => navigate(`/rooms/${p.id}`)}
                            style={hoveredCard === index ? { ...styles.cardBase, ...styles.cardHover } : styles.cardBase}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <img 
                                src={`/images/${p.image}`} 
                                alt={p.name} 
                                style={styles.cardImage} 
                                onError={(e)=>e.target.src='/images/placeholder.jpg'}
                            />
                            <div style={styles.cardContent}>
                                <h3 style={styles.cardTitle}>{p.name}</h3>
                                <p style={styles.cardPrice}>{p.price.toLocaleString('vi-VN')} VNĐ</p>
                                <div style={{fontSize: '0.9rem', color: '#666'}}>
                                    <span>🛏 {p.beds} Giường</span> • <span>⛰ {p.view}</span>
                                </div>
                                <button style={styles.bookingButton}>XEM NGAY</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ChatbotWidget />
        </div>
    );
}

export default Home;
