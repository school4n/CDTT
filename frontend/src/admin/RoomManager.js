import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const API_ROOMS_URL = "http://localhost:3001/api/admin/rooms";

const styles = {
    container: { padding: "20px", fontFamily: "Arial, sans-serif", position: "relative" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
    tableHeader: { backgroundColor: "#343a40", color: "white" },
    tableCell: {
        padding: "15px",
        verticalAlign: "middle",
        borderBottom: "1px solid #eee",
        fontSize: "14px",
        textAlign: "left"
    },
    headerControls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px"
    },
    searchBox: {
        padding: "8px 15px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        width: "300px"
    },
    button: {
        padding: "8px 14px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px"
    },
    // Badge trạng thái
    badge: {
        padding: "5px 10px",
        borderRadius: "15px",
        color: "white",
        fontSize: "12px",
        fontWeight: "bold",
        display: "inline-block"
    },
    // Modal styles
    modalOverlay: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
    },
    modal: {
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "8px",
        width: "500px",
        maxWidth: "90%",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        maxHeight: "90vh",
        overflowY: "auto"
    },
    formGroup: { marginBottom: "15px" },
    label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
    input: {
        width: "100%",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        boxSizing: "border-box"
    },
    select: { // Style cho dropdown
        width: "100%",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        backgroundColor: "white",
        cursor: "pointer"
    },
    modalActions: { marginTop: "20px", textAlign: "right" }
};

// Map giá trị ENUM sang tiếng Việt và màu sắc
const STATUS_OPTIONS = {
    available: { label: "Sẵn sàng", color: "#28a745" },   // Xanh lá
    booked: { label: "Đã đặt", color: "#ffc107", textColor: "black" },      // Vàng
    maintenance: { label: "Bảo trì", color: "#dc3545" }   // Đỏ
};

const RoomManager = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // State cho Modal
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    
    // State form data
    const [formData, setFormData] = useState({
        name: "",
        price_per_night: "",
        max_guests: "",
        area: "",
        main_image_url: "",
        description: "",
        status: "available" // Mặc định
    });

    const ADMIN_TOKEN = useMemo(() => localStorage.getItem("adminToken"), []);

    const fetchRooms = useCallback(async () => {
        if (!ADMIN_TOKEN) {
            setError("Không tìm thấy adminToken");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(API_ROOMS_URL, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
            });
            setRooms(response.data.data || response.data);
            setError(null);
        } catch (err) {
            console.error("Error:", err);
            setError(`Lỗi tải dữ liệu: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [ADMIN_TOKEN]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Mở form Thêm mới
    const handleAddClick = () => {
        setIsEditing(false);
        setCurrentRoomId(null);
        setFormData({
            name: "",
            price_per_night: "",
            max_guests: "",
            area: "",
            main_image_url: "",
            description: "",
            status: "available"
        });
        setShowModal(true);
    };

    // Mở form Sửa
    const handleEditClick = (room) => {
        setIsEditing(true);
        setCurrentRoomId(room.id);
        setFormData({
            name: room.name,
            price_per_night: room.price_per_night,
            max_guests: room.max_guests,
            area: room.area,
            main_image_url: room.main_image_url || "",
            description: room.description || "",
            status: room.status || "available" // Load status hiện tại
        });
        setShowModal(true);
    };

    // Lưu dữ liệu (Thêm/Sửa)
    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price_per_night) {
            alert("Vui lòng nhập tên phòng và giá!");
            return;
        }

        try {
            const payload = {
                ...formData,
                price_per_night: Number(formData.price_per_night),
                max_guests: Number(formData.max_guests),
                area: Number(formData.area)
            };

            if (isEditing) {
                await axios.put(`${API_ROOMS_URL}/${currentRoomId}`, payload, {
                    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
                });
                alert("Cập nhật thành công!");
            } else {
                await axios.post(API_ROOMS_URL, payload, {
                    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
                });
                alert("Thêm mới thành công!");
            }

            setShowModal(false);
            fetchRooms();
        } catch (err) {
            alert(`Lỗi: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm(`Xóa phòng ID ${roomId}?`)) return;
        try {
            await axios.delete(`${API_ROOMS_URL}/${roomId}`, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
            });
            fetchRooms();
        } catch (err) {
            alert("Lỗi xóa phòng");
        }
    };

    // Helper render badge trạng thái
    const renderStatusBadge = (status) => {
        const config = STATUS_OPTIONS[status] || { label: status, color: "gray" };
        return (
            <span style={{
                ...styles.badge,
                backgroundColor: config.color,
                color: config.textColor || "white"
            }}>
                {config.label}
            </span>
        );
    };

    if (loading && !rooms.length) return <div style={styles.container}>Đang tải...</div>;
    if (error) return <div style={{ ...styles.container, color: "red" }}>{error}</div>;

    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <h2>📦 Quản Lý Phòng</h2>
            <hr />

            <div style={styles.headerControls}>
                <input
                    type="text"
                    placeholder="Tìm kiếm phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchBox}
                />
                <button 
                    style={{ ...styles.button, backgroundColor: "#28a745", color: "white" }}
                    onClick={handleAddClick}
                >
                    ➕ Thêm Phòng Mới
                </button>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeader}>
                        <th style={styles.tableCell}>#</th>
                        <th style={styles.tableCell}>Tên Phòng</th>
                        <th style={styles.tableCell}>Giá</th>
                        <th style={styles.tableCell}>Trạng Thái</th> {/* Cột mới */}
                        <th style={styles.tableCell}>Số Khách</th>
                        <th style={styles.tableCell}>Ảnh</th>
                        <th style={styles.tableCell}>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRooms.map((room, index) => (
                        <tr key={room.id}>
                            <td style={styles.tableCell}>{index + 1}</td>
                            <td style={styles.tableCell}>
                                <strong>{room.name}</strong>
                            </td>
                            <td style={styles.tableCell}>{Number(room.price_per_night).toLocaleString()} đ</td>
                            
                            {/* Hiển thị trạng thái dạng Badge màu */}
                            <td style={styles.tableCell}>
                                {renderStatusBadge(room.status)}
                            </td>

                            <td style={styles.tableCell}>{room.max_guests}</td>
                            <td style={styles.tableCell}>
                                {room.main_image_url && (
                                    <img src={room.main_image_url} alt="room" width="60" style={{ borderRadius: "4px" }} />
                                )}
                            </td>
                            <td style={styles.tableCell}>
                                <button
                                    style={{ ...styles.button, backgroundColor: "#007bff", color: "white", marginRight: "8px" }}
                                    onClick={() => handleEditClick(room)}
                                >
                                    ✏️ Sửa / Đổi Status
                                </button>
                                <button
                                    style={{ ...styles.button, backgroundColor: "#dc3545", color: "white" }}
                                    onClick={() => handleDeleteRoom(room.id)}
                                >
                                    🗑️ Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={{ marginTop: 0 }}>{isEditing ? "Cập Nhật Phòng" : "Thêm Phòng Mới"}</h3>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tên phòng:</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} style={styles.input} />
                            </div>

                            {/* PHẦN CHỌN STATUS */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Trạng thái hiện tại:</label>
                                <select 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleInputChange} 
                                    style={styles.select}
                                >
                                    <option value="available">✅ Sẵn sàng đón khách</option>
                                    <option value="booked">📅 Đã được đặt</option>
                                    <option value="maintenance">🛠️ Đang bảo trì / Sửa chữa</option>
                                </select>
                            </div>
                            {/* HẾT PHẦN CHỌN STATUS */}

                            <div style={{ display: "flex", gap: "10px" }}>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>Giá (VNĐ):</label>
                                    <input type="number" name="price_per_night" required value={formData.price_per_night} onChange={handleInputChange} style={styles.input} />
                                </div>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>Số khách:</label>
                                    <input type="number" name="max_guests" value={formData.max_guests} onChange={handleInputChange} style={styles.input} />
                                </div>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>Diện tích (m²):</label>
                                    <input type="number" name="area" value={formData.area} onChange={handleInputChange} style={styles.input} />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Link ảnh:</label>
                                <input type="text" name="main_image_url" value={formData.main_image_url} onChange={handleInputChange} style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Mô tả:</label>
                                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} style={{ ...styles.input, resize: "vertical" }} />
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.button, backgroundColor: "#6c757d", color: "white", marginRight: "10px" }}>Hủy</button>
                                <button type="submit" style={{ ...styles.button, backgroundColor: "#007bff", color: "white" }}>{isEditing ? "Lưu Lại" : "Tạo Mới"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManager;