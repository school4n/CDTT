import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// 🎨 CÁC HẰNG SỐ THEME
const ROYAL_COLOR = "#f3c300"; // Màu vàng cam chủ đạo
const DARK_BG = "#0f172a"; // Màu nền tối
const LIGHT_BG = "#f9f9ff"; // Nền nhẹ
const TEXT_COLOR = "#333"; 

function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const beds = params.get("beds") || 1;
    const view = params.get("view"); // Lấy view từ URL

    const API_URL = `http://localhost:3001/api/rooms`;

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await axios.get(API_URL);
                let data = res.data;

                // Lọc thêm theo view nếu có (để khớp chính xác từ trang Home.js)
                if (view && view !== "Đa dạng Hướng nhìn") {
                    // Chuyển view sang chữ thường để so sánh không phân biệt chữ hoa chữ thường
                    const lowerCaseView = view.toLowerCase(); 
                    data = data.filter(item => item.view && item.view.toLowerCase() === lowerCaseView);
                }

                const mapped = data.map((item) => ({
                    id: item.id,
                    name: item.name,
                    description: (item.description && item.description.length > 100) ? 
                                 item.description.substring(0, 100) + '...' : 
                                 item.description || "Không có mô tả chi tiết.",
                    image: item.image ? `/images/${item.image}` : `https://picsum.photos/500/300?random=${item.id}`,
                    beds: item.beds || beds,
                    view: item.view || "Không xác định",
                    location: item.location || "Việt Nam",
                    price: parseFloat(item.price) || 0, // Đảm bảo price là số hoặc 0
                }));
                setRooms(mapped);
            } catch (err) {
                setError("Không thể tải danh sách phòng.");
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [API_URL, view, beds]);

    // ==========================
    // STYLE (Đã áp dụng Royal Theme)
    // ==========================
    const styles = {
        container: {
            fontFamily: "serif", // Dùng font serif nhất quán
            backgroundColor: LIGHT_BG,
            minHeight: "100vh",
            padding: "50px 8%",
        },
        header: {
            textAlign: "center",
            marginBottom: 40,
        },
        title: {
            fontSize: 32,
            fontWeight: 700,
            color: DARK_BG,
            textTransform: 'uppercase',
        },
        subtitle: {
            color: TEXT_COLOR,
            fontSize: 16,
            marginTop: 10,
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: 25,
            maxWidth: '900px', // Giới hạn chiều ngang danh sách
            margin: '0 auto',
        },
        card: (hovered) => ({
            display: "flex",
            flexDirection: 'row', 
            backgroundColor: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: hovered
                ? "0 6px 18px rgba(0,0,0,0.2)"
                : "0 3px 10px rgba(0,0,0,0.1)",
            transition: "0.3s",
            cursor: "pointer",
            borderLeft: hovered ? `5px solid ${ROYAL_COLOR}` : '5px solid #eee',
        }),
        image: {
            width: 300,
            height: 220,
            objectFit: "cover",
            minWidth: '250px',
        },
        info: {
            flex: 1,
            padding: "20px 25px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        },
        name: {
            fontSize: 22,
            fontWeight: "bold",
            color: DARK_BG,
            marginBottom: 5,
        },
        desc: {
            fontSize: 14,
            color: "#666",
            margin: "10px 0 15px 0",
            lineHeight: 1.4,
        },
        tags: {
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 10,
        },
        tag: {
            backgroundColor: ROYAL_COLOR,
            color: DARK_BG,
            borderRadius: 4,
            padding: "4px 10px",
            fontSize: 13,
            fontWeight: 600,
        },
        location: {
            fontSize: 14,
            color: "#777",
            marginBottom: 5,
        },
        price: {
            fontSize: 22,
            fontWeight: 'bold',
            color: '#e8491d', 
        },
        actionArea: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '1px dashed #eee',
        },
        viewDetailButton: {
            background: DARK_BG,
            color: ROYAL_COLOR,
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background 0.3s',
        }
    };

    const [hoveredId, setHoveredId] = useState(null);

    // Xử lý tiêu đề chính
    const mainTitle = (view && view !== "Đa dạng Hướng nhìn") 
        ? `Phòng ${beds} Giường (${view})`
        : `Phòng ${beds} Giường (Đa dạng View)`;

    if (loading)
        return <p style={{ textAlign: "center", padding: 50 }}>⏳ Đang tải danh sách phòng...</p>;
    if (error)
        return <p style={{ textAlign: "center", padding: 50, color: "red" }}>{error}</p>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>{mainTitle}</h1>
                <p style={styles.subtitle}>
                    Tìm thấy {rooms.length} lựa chọn phòng có {beds} giường phù hợp với nhu cầu của bạn.
                </p>
            </header>

            <div style={styles.list}>
                {rooms.length > 0 ? (
                    rooms.map((r) => {
                        const isHovered = hoveredId === r.id;
                        return (
                            <div
                                key={r.id}
                                style={styles.card(isHovered)}
                                onMouseEnter={() => setHoveredId(r.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => navigate(`/hotels/${r.id}`)}
                            >
                                <img 
                                    src={r.image} 
                                    alt={r.name} 
                                    style={styles.image} 
                                    onError={(e) => {
                                        // Xử lý khi ảnh không tải được
                                        e.target.style.backgroundColor = '#ccc';
                                        e.target.alt = "Ảnh phòng mặc định";
                                    }}
                                />
                                <div style={styles.info}>
                                    <div>
                                        <h3 style={styles.name}>{r.name}</h3>
                                        <p style={styles.location}>📍 {r.location}</p>
                                        
                                        <div style={styles.tags}>
                                            <span style={styles.tag}>🛏 {r.beds} giường</span>
                                            <span style={styles.tag}>🌅 Hướng {r.view}</span>
                                        </div>
                                        <p style={styles.desc}>{r.description}</p>
                                    </div>
                                    
                                    <div style={styles.actionArea}>
                                        <div style={styles.price}>
                                            {/* 🎯 SỬA LỖI: Đảm bảo r.price tồn tại và là số trước khi gọi toLocaleString */}
                                            {r.price !== null && r.price !== undefined 
                                                ? `${r.price.toLocaleString("vi-VN")} VNĐ/đêm`
                                                : "Liên hệ"}
                                        </div>
                                        <button 
                                            style={styles.viewDetailButton}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = DARK_BG}
                                        >
                                            Xem Chi Tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p style={{ textAlign: "center", color: TEXT_COLOR }}>
                        Không có phòng nào phù hợp với tiêu chí bạn đã chọn.
                    </p>
                )}
            </div>
        </div>
    );
}

export default Rooms;