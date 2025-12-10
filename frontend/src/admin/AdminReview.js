import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaStar, FaSearch, FaCommentDots } from "react-icons/fa";

// --- CẤU HÌNH STYLE ---
const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";
const API_BASE_URL = "http://localhost:3001";

const styles = {
    container: {
        padding: "30px",
        fontFamily: "serif",
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
    },
    title: {
        color: DARK_BG,
        fontWeight: "700",
        fontSize: "2rem",
    },
    searchBox: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "white",
        padding: "10px 15px",
        borderRadius: "6px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        border: "1px solid #ddd",
    },
    input: {
        border: "none",
        outline: "none",
        marginLeft: "10px",
        fontSize: "1rem",
        width: "250px",
    },
    tableContainer: {
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        overflow: "hidden",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
    },
    th: {
        backgroundColor: DARK_BG,
        color: "white",
        padding: "15px",
        fontWeight: "600",
    },
    td: {
        padding: "15px",
        borderBottom: "1px solid #eee",
        color: "#333",
        verticalAlign: "top",
    },
    star: {
        color: ROYAL_COLOR,
        marginRight: "2px",
    },
    deleteBtn: {
        backgroundColor: "#e74c3c",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        transition: "0.3s",
    },
    emptyState: {
        textAlign: "center",
        padding: "40px",
        color: "#666",
        fontStyle: "italic",
    },
    errorMsg: {
        color: "red",
        textAlign: "center",
        padding: "20px",
        fontWeight: "bold",
    }
};

const AdminReview = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null); // Thêm state quản lý lỗi

    // 1. Lấy ADMIN_TOKEN từ localStorage (sử dụng useMemo như bạn yêu cầu)
    const ADMIN_TOKEN = useMemo(() => localStorage.getItem("adminToken"), []);

    // 2. Fetch dữ liệu từ API (sử dụng useCallback)
    const fetchReviews = useCallback(async () => {
        // Kiểm tra Token trước khi gọi API
        if (!ADMIN_TOKEN) {
            setError("Không tìm thấy Admin Token. Vui lòng đăng nhập lại quyền Admin.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/admin/reviews`, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
            });
            setReviews(res.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi tải reviews:", err);
            setError("Không thể tải danh sách đánh giá. Hãy đảm bảo bạn là Admin.");
        } finally {
            setLoading(false);
        }
    }, [ADMIN_TOKEN]); // Hàm sẽ được tạo lại nếu ADMIN_TOKEN thay đổi (thực tế useMemo [] thì ít thay đổi)

    // Gọi fetchReviews khi component mount
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // 3. Xử lý xóa review (Cũng dùng ADMIN_TOKEN)
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này vĩnh viễn?")) return;

        if (!ADMIN_TOKEN) {
            alert("Mất kết nối Admin. Vui lòng đăng nhập lại.");
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/api/reviews/${id}`, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
            });
            alert("Đã xóa thành công!");
            fetchReviews(); // Load lại danh sách sau khi xóa
        } catch (error) {
            console.error("Lỗi xóa review:", error);
            alert("Xóa thất bại. Có thể bạn không có quyền.");
        }
    };

    // 4. Helper render sao
    const renderStars = (points) => {
        return [...Array(5)].map((_, i) => (
            <FaStar key={i} style={{ ...styles.star, color: i < points ? ROYAL_COLOR : "#ddd" }} />
        ));
    };

    // 5. Lọc review theo từ khóa
    const filteredReviews = reviews.filter((r) => {
        const text = searchTerm.toLowerCase();
        return (
            (r.username && r.username.toLowerCase().includes(text)) ||
            (r.full_name && r.full_name.toLowerCase().includes(text)) ||
            (r.room_name && r.room_name.toLowerCase().includes(text)) ||
            (r.review_text && r.review_text.toLowerCase().includes(text))
        );
    });

    // Render giao diện
    if (loading) return <div style={{ padding: "30px", textAlign: "center" }}>⏳ Đang tải dữ liệu...</div>;
    
    // Nếu có lỗi (ví dụ chưa đăng nhập admin), hiển thị thông báo lỗi
    if (error) return <div style={styles.errorMsg}>{error}</div>;

    return (
        <div style={styles.container}>
            {/* Header & Search */}
            <div style={styles.header}>
                <h2 style={styles.title}>Quản lý Đánh giá & Bình luận</h2>
                <div style={styles.searchBox}>
                    <FaSearch color="#888" />
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Tìm theo tên, phòng, nội dung..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, width: '5%'}}>ID</th>
                            <th style={{...styles.th, width: '20%'}}>Phòng</th>
                            <th style={{...styles.th, width: '15%'}}>Khách hàng</th>
                            <th style={{...styles.th, width: '15%'}}>Đánh giá</th>
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
                                    <td style={{ ...styles.td, fontWeight: "bold", color: DARK_BG }}>
                                        {item.room_name}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: "bold" }}>{item.full_name || item.username}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#888" }}>@{item.username}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ display: "flex" }}>{renderStars(item.rating_point)}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <FaCommentDots color="#ccc" style={{ marginTop: '4px', flexShrink: 0 }} />
                                            <span style={{ fontStyle: "italic", color: "#555" }}>
                                                "{item.review_text}"
                                            </span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        {new Date(item.created_at).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            style={styles.deleteBtn}
                                            onClick={() => handleDelete(item.id)}
                                            title="Xóa đánh giá này"
                                        >
                                            <FaTrash /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={styles.emptyState}>
                                    Không tìm thấy đánh giá nào phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReview;