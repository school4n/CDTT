import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios"; // Đã thay thế bằng axiosClient
import axiosClient from "../api/config"; 
import { FaTrash, FaStar, FaSearch, FaCommentDots, FaDoorOpen, FaUser, FaCalendarAlt } from "react-icons/fa";

// --- CẤU HÌNH STYLE ---
const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";

function AdminReview() {
    // 📱 1. STATE CHECK MOBILE
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // 🚀 LOGIC GỌI API TẬP TRUNG
    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            // SỬ DỤNG axiosClient: Header Authorization đã được Interceptor tự động thêm
            const res = await axiosClient.get("/admin/reviews");
            setReviews(res.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi tải reviews:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("Bạn không có quyền truy cập khu vực này.");
            } else {
                setError("Không thể tải danh sách đánh giá.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
        try {
            // SỬ DỤNG axiosClient: Chỉ cần truyền path
            await axiosClient.delete(`/reviews/${id}`);
            alert("Đã xóa thành công!");
            fetchReviews(); 
        } catch (error) {
            console.error("Lỗi xóa review:", error);
            alert("Xóa thất bại. Vui lòng thử lại.");
        }
    };

    const renderStars = (points) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={i} size={14} color={i < points ? ROYAL_COLOR : "#ddd"} style={{marginRight: '2px'}} />
        ));
    };

    const filteredReviews = reviews.filter((r) => {
        const text = searchTerm.toLowerCase();
        return (
            (r.username && r.username.toLowerCase().includes(text)) ||
            (r.full_name && r.full_name.toLowerCase().includes(text)) ||
            (r.room_name && r.room_name.toLowerCase().includes(text)) ||
            (r.review_text && r.review_text.toLowerCase().includes(text))
        );
    });

    // 🎨 STYLES
    const styles = {
        container: {
            padding: isMobile ? "10px 0" : "30px", 
            fontFamily: "serif",
            backgroundColor: "#f4f6f8",
            minHeight: "100%", 
            boxSizing: "border-box", 
            width: "100%"
        },
        header: {
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            marginBottom: "20px",
            gap: isMobile ? "15px" : "0",
            padding: isMobile ? "0 10px" : "0"
        },
        title: {
            color: DARK_BG,
            fontWeight: "700",
            fontSize: isMobile ? "1.5rem" : "2rem",
            margin: 0
        },
        searchBox: {
            display: "flex",
            alignItems: "center",
            backgroundColor: "white",
            padding: "10px 15px",
            borderRadius: "6px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            border: "1px solid #ddd",
            width: isMobile ? "100%" : "300px", 
            boxSizing: 'border-box',
        },
        input: {
            border: "none",
            outline: "none",
            marginLeft: "10px",
            fontSize: "1rem",
            width: "100%",
            backgroundColor: 'transparent'
        },
        tableContainer: {
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            overflow: "hidden",
            display: isMobile ? 'none' : 'block',
        },
        table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
        th: { backgroundColor: DARK_BG, color: "white", padding: "15px", fontWeight: "600" },
        td: { padding: "15px", borderBottom: "1px solid #eee", color: "#333", verticalAlign: "top" },
        mobileList: {
            display: isMobile ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '15px',
            padding: '0 10px'
        },
        mobileCard: {
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            border: '1px solid #eee',
            width: '100%',
            boxSizing: 'border-box'
        },
        cardHeader: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px',
            borderBottom: '1px solid #f0f0f0', paddingBottom: '10px',
        },
        cardId: { fontWeight: 'bold', color: '#888', fontSize: '0.85rem' },
        cardRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.95rem', color: '#444' },
        cardComment: { 
            backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', 
            fontStyle: 'italic', color: '#555', marginTop: '5px', marginBottom: '15px', fontSize: '0.9rem' 
        },
        deleteBtn: {
            backgroundColor: "#e74c3c", color: "white", border: "none", padding: "10px",
            borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: 'center', gap: "5px",
            transition: "0.3s", fontSize: '0.9rem', width: isMobile ? '100%' : 'auto'
        },
        emptyState: { textAlign: "center", padding: "40px", color: "#666", fontStyle: "italic" },
        errorMsg: { color: "red", textAlign: "center", padding: "20px", fontWeight: "bold" }
    };

    if (loading) return <div style={{ padding: "30px", textAlign: "center" }}>⏳ Đang tải dữ liệu...</div>;
    if (error) return <div style={styles.errorMsg}>{error}</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Quản lý Đánh giá</h2>
                <div style={styles.searchBox}>
                    <FaSearch color="#888" />
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* BẢNG DESKTOP */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, width: '5%'}}>ID</th>
                            <th style={{...styles.th, width: '20%'}}>Phòng</th>
                            <th style={{...styles.th, width: '15%'}}>Khách hàng</th>
                            <th style={{...styles.th, width: '15%'}}>Điểm</th>
                            <th style={{...styles.th, width: '30%'}}>Nội dung</th>
                            <th style={{...styles.th, width: '10%'}}>Ngày</th>
                            <th style={{...styles.th, width: '5%'}}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReviews.length > 0 ? (
                            filteredReviews.map((item) => (
                                <tr key={item.id}>
                                    <td style={styles.td}>#{item.id}</td>
                                    <td style={{ ...styles.td, fontWeight: "bold", color: DARK_BG }}>{item.room_name}</td>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: "bold" }}>{item.full_name || item.username}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#888" }}>@{item.username}</div>
                                    </td>
                                    <td style={styles.td}>{renderStars(item.rating_point)}</td>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <FaCommentDots color="#ccc" style={{ marginTop: '4px', flexShrink: 0 }} />
                                            <span style={{ fontStyle: "italic", color: "#555" }}>"{item.review_text}"</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>{new Date(item.created_at).toLocaleDateString("vi-VN")}</td>
                                    <td style={styles.td}>
                                        <button style={styles.deleteBtn} onClick={() => handleDelete(item.id)} title="Xóa">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={styles.emptyState}>Không tìm thấy đánh giá nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* DANH SÁCH MOBILE */}
            <div style={styles.mobileList}>
                {filteredReviews.length > 0 ? (
                    filteredReviews.map((item) => (
                        <div key={item.id} style={styles.mobileCard}>
                            <div style={styles.cardHeader}>
                                <span style={styles.cardId}>Review #{item.id}</span>
                                <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#888'}}>
                                    <FaCalendarAlt /> {new Date(item.created_at).toLocaleDateString("vi-VN")}
                                </div>
                            </div>

                            <div style={styles.cardRow}>
                                <FaDoorOpen color={ROYAL_COLOR} /> 
                                <span style={{fontWeight: 'bold', color: DARK_BG}}>{item.room_name}</span>
                            </div>
                            
                            <div style={styles.cardRow}>
                                <FaUser color="#666" /> 
                                <span>{item.full_name || item.username}</span>
                            </div>

                            <div style={{...styles.cardRow, margin: '10px 0'}}>
                                {renderStars(item.rating_point)}
                            </div>

                            <div style={styles.cardComment}>
                                <FaCommentDots style={{marginRight: '5px'}}/> {item.review_text}
                            </div>

                            <button style={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                                <FaTrash /> Xóa Đánh Giá
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={styles.emptyState}>Không tìm thấy đánh giá nào.</div>
                )}
            </div>
        </div>
    );
}

export default AdminReview;