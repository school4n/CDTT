import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios"; // Đã thay thế bằng axiosClient
import axiosClient from "../api/config"; 
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUser, FaExpandArrowsAlt, FaImages } from "react-icons/fa";

// 🎨 CÁC HẰNG SỐ THEME (ĐÃ BỔ SUNG ĐỂ FIX LỖI DARK_BG IS NOT DEFINED)
const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";
const LIGHT_BG = "#f9f9ff";

const STATUS_OPTIONS = {
    available: { label: "Sẵn sàng", color: "#28a745" },
    booked: { label: "Đã đặt", color: "#ffc107", textColor: "black" },
    maintenance: { label: "Bảo trì", color: "#dc3545" }
};

const RoomManager = () => {
    // 📱 1. STATE CHECK MOBILE
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); 

    const [allFacilities, setAllFacilities] = useState([]);
    const [allFeatures, setAllFeatures] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [tempImgUrl, setTempImgUrl] = useState(""); 

    const [formData, setFormData] = useState({
        name: "", price_per_night: "", max_guests: "", area: "", description: "",
        status: "available", main_image_url: "", facility_ids: [], feature_ids: [], gallery_images: []
    });

    // 🚀 TẢI DỮ LIỆU TỔNG HỢP QUA AXIOS CLIENT
    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            const [roomsRes, facilitiesRes, featuresRes] = await Promise.all([
                axiosClient.get("/admin/rooms"),
                axiosClient.get("/admin/facilities"),
                axiosClient.get("/admin/features")
            ]);
            
            setRooms(roomsRes.data.data || roomsRes.data);
            setAllFacilities(facilitiesRes.data || []);
            setAllFeatures(featuresRes.data || []);
            setError(null);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
            setError("Không thể tải dữ liệu. Vui lòng kiểm tra quyền Admin.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

    const handleInputChange = (e) => { 
        const { name, value } = e.target; 
        setFormData(prev => ({ ...prev, [name]: value })); 
    };

    const handleCheckboxChange = (type, id) => {
        setFormData(prev => {
            const list = prev[type];
            return { ...prev, [type]: list.includes(id) ? list.filter(item => item !== id) : [...list, id] };
        });
    };

    const handleAddGalleryImage = () => {
        if (!tempImgUrl.trim()) return;
        setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, tempImgUrl.trim()] }));
        setTempImgUrl(""); 
    };

    const handleRemoveGalleryImage = (indexToRemove) => {
        setFormData(prev => ({ ...prev, gallery_images: prev.gallery_images.filter((_, index) => index !== indexToRemove) }));
    };

    const handleAddClick = () => {
        setIsEditing(false); setCurrentRoomId(null); setTempImgUrl("");
        setFormData({ name: "", price_per_night: "", max_guests: "", area: "", description: "", status: "available", main_image_url: "", facility_ids: [], feature_ids: [], gallery_images: [] });
        setShowModal(true);
    };

    const handleEditClick = async (room) => {
        setIsEditing(true); setCurrentRoomId(room.id); setTempImgUrl("");
        try {
            const detailRes = await axiosClient.get(`/rooms/${room.id}`);
            const detailData = detailRes.data;
            
            const gallery = (detailData.gallery && Array.isArray(detailData.gallery)) ? detailData.gallery.map(img => img.image_url) : [];
            const initFacilities = room.facility_ids ? (typeof room.facility_ids === 'string' ? room.facility_ids.split(',').map(Number) : room.facility_ids) : [];
            const initFeatures = room.feature_ids ? (typeof room.feature_ids === 'string' ? room.feature_ids.split(',').map(Number) : room.feature_ids) : [];

            setFormData({
                name: detailData.name || room.name,
                price_per_night: detailData.price_per_night || room.price_per_night,
                max_guests: detailData.max_guests || room.max_guests,
                area: detailData.area || room.area,
                description: detailData.description || room.description || "",
                status: detailData.status || room.status || "available",
                main_image_url: detailData.main_image_url || room.main_image_url || "",
                facility_ids: initFacilities, feature_ids: initFeatures, gallery_images: gallery 
            });
            setShowModal(true);
        } catch (err) { alert("Không thể tải chi tiết phòng."); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price_per_night: Number(formData.price_per_night),
                max_guests: Number(formData.max_guests),
                area: Number(formData.area)
            };

            if (isEditing) {
                await axiosClient.put(`/admin/rooms/${currentRoomId}`, payload);
                alert("Cập nhật thành công!");
            } else {
                await axiosClient.post("/admin/rooms", payload);
                alert("Thêm mới thành công!");
            }
            
            setShowModal(false); fetchInitialData();
        } catch (err) { alert(`Lỗi khi lưu: ${err.response?.data?.message || err.message}`); }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm(`Xác nhận xóa phòng ID ${roomId}?`)) return;
        try {
            await axiosClient.delete(`/admin/rooms/${roomId}`);
            alert("Đã xóa phòng thành công!");
            fetchInitialData();
        } catch (err) { alert("Lỗi xóa phòng"); }
    };

    const renderStatusBadge = (status) => {
        const config = STATUS_OPTIONS[status] || { label: status, color: "gray" };
        return <span style={{...styles.badge, backgroundColor: config.color, color: config.textColor || "white"}}>{config.label}</span>;
    };

    // 🎨 STYLES (SỬ DỤNG DARK_BG ĐÃ KHAI BÁO Ở TRÊN)
    const styles = {
        container: { padding: isMobile ? "15px" : "30px", fontFamily: "serif", position: "relative", backgroundColor: '#f4f6f8', minHeight: '100vh', boxSizing: 'border-box' },
        headerControls: { display: "flex", flexDirection: isMobile ? 'column' : 'row', justifyContent: "space-between", alignItems: isMobile ? 'stretch' : "center", marginBottom: "15px", gap: '10px' },
        searchBox: { padding: "10px", border: "1px solid #ccc", borderRadius: "5px", width: isMobile ? "100%" : "300px", boxSizing: 'border-box' },
        button: { padding: "10px 14px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "14px", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
        badge: { padding: "5px 10px", borderRadius: "15px", color: "white", fontSize: "12px", fontWeight: "bold", display: "inline-block" },
        table: { width: "100%", borderCollapse: "collapse", marginTop: "20px", display: isMobile ? 'none' : 'table' },
        tableHeader: { backgroundColor: "#343a40", color: "white" },
        tableCell: { padding: "15px", verticalAlign: "middle", borderBottom: "1px solid #eee", fontSize: "14px", textAlign: "left" },
        mobileList: { display: isMobile ? 'flex' : 'none', flexDirection: 'column', gap: '15px' },
        card: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #ddd' },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' },
        cardTitle: { fontWeight: 'bold', fontSize: '1.1rem', color: DARK_BG },
        cardRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: '#555' },
        cardImg: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' },
        modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
        modal: { backgroundColor: "white", padding: "20px", borderRadius: "8px", width: isMobile ? "95%" : "700px", maxHeight: "90vh", overflowY: "auto", boxSizing: 'border-box' },
        formGroup: { marginBottom: "15px" },
        label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
        input: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" },
        select: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "white", cursor: "pointer" },
        modalActions: { marginTop: "20px", textAlign: "right", display: 'flex', justifyContent: 'flex-end', gap: '10px' },
        checkboxGroup: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "5px", border: "1px solid #eee", padding: "10px", borderRadius: "4px", backgroundColor: "#f9f9f9" },
        checkboxItem: { display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", cursor: "pointer", width: isMobile ? "100%" : "45%" },
        galleryContainer: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px", borderTop: "1px dashed #eee", paddingTop: "10px" },
        galleryItem: { position: "relative", width: "80px", height: "60px", border: "1px solid #ddd", borderRadius: "4px", overflow: "hidden" },
        galleryImg: { width: "100%", height: "100%", objectFit: "cover" },
        removeBtn: { position: "absolute", top: 0, right: 0, background: "rgba(255,0,0,0.8)", color: "white", border: "none", cursor: "pointer", width: "20px", height: "20px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }
    };

    if (loading && !rooms.length) return <div style={{ padding: "30px", textAlign: "center" }}>⏳ Đang tải dữ liệu phòng...</div>;
    if (error) return <div style={{ padding: "30px", color: "red", textAlign: 'center' }}>{error}</div>;

    const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div style={styles.container}>
            <h2 style={{color: DARK_BG, fontWeight:'bold'}}>📦 Quản Lý Phòng Khách Sạn</h2>
            <hr />

            <div style={styles.headerControls}>
                <input type="text" placeholder="Tìm kiếm theo tên phòng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchBox} />
                <button style={{ ...styles.button, backgroundColor: "#28a745", color: "white" }} onClick={handleAddClick}>
                    <FaPlus /> Thêm Phòng Mới
                </button>
            </div>

            {/* BẢNG DESKTOP */}
            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeader}>
                        <th style={styles.tableCell}>#</th>
                        <th style={styles.tableCell}>Tên Phòng</th>
                        <th style={styles.tableCell}>Giá/Đêm</th>
                        <th style={styles.tableCell}>Trạng Thái</th>
                        <th style={styles.tableCell}>Sức chứa</th>
                        <th style={styles.tableCell}>Ảnh chính</th>
                        <th style={styles.tableCell}>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRooms.map((room, index) => (
                        <tr key={room.id}>
                            <td style={styles.tableCell}>{index + 1}</td>
                            <td style={styles.tableCell}><strong>{room.name}</strong></td>
                            <td style={styles.tableCell}>{Number(room.price_per_night).toLocaleString()} đ</td>
                            <td style={styles.tableCell}>{renderStatusBadge(room.status)}</td>
                            <td style={styles.tableCell}>{room.max_guests} khách</td>
                            <td style={styles.tableCell}>
                                {room.main_image_url && <img src={room.main_image_url.startsWith('http') ? room.main_image_url : `/images/${room.main_image_url}`} alt="room" width="60" style={{ borderRadius: "4px", objectFit:'cover' }} />}
                            </td>
                            <td style={styles.tableCell}>
                                <div style={{display:'flex', gap:'5px'}}>
                                    <button style={{ ...styles.button, backgroundColor: "#007bff", color: "white" }} onClick={() => handleEditClick(room)}><FaEdit/> Sửa</button>
                                    <button style={{ ...styles.button, backgroundColor: "#dc3545", color: "white" }} onClick={() => handleDeleteRoom(room.id)}><FaTrash/> Xóa</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* DANH SÁCH MOBILE */}
            <div style={styles.mobileList}>
                {filteredRooms.map((room) => (
                    <div key={room.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <span style={styles.cardTitle}>{room.name}</span>
                            {renderStatusBadge(room.status)}
                        </div>
                        {room.main_image_url && (
                            <img src={room.main_image_url.startsWith('http') ? room.main_image_url : `/images/${room.main_image_url}`} alt="room" style={styles.cardImg} />
                        )}
                        <div style={styles.cardRow}><span style={{fontWeight:'bold', color: '#e8491d'}}>{Number(room.price_per_night).toLocaleString()} đ</span> / đêm</div>
                        <div style={styles.cardRow}><FaUser/> Sức chứa: {room.max_guests} khách</div>
                        <div style={styles.cardRow}><FaExpandArrowsAlt/> Diện tích: {room.area} m²</div>
                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                            <button style={{ ...styles.button, backgroundColor: "#007bff", color: "white", flex: 1 }} onClick={() => handleEditClick(room)}><FaEdit/> Sửa</button>
                            <button style={{ ...styles.button, backgroundColor: "#dc3545", color: "white", flex: 1 }} onClick={() => handleDeleteRoom(room.id)}><FaTrash/> Xóa</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL THÊM/SỬA */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={{ marginTop: 0, borderBottom:'1px solid #eee', paddingBottom:'10px' }}>{isEditing ? "Cập Nhật Thông Tin Phòng" : "Thêm Phòng Mới"}</h3>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}><label style={styles.label}>Tên phòng:</label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} style={styles.input} /></div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Trạng thái hiện tại:</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} style={styles.select}>
                                    <option value="available">✅ Sẵn sàng đón khách</option>
                                    <option value="booked">📅 Đang có khách ở</option>
                                    <option value="maintenance">🛠️ Đang bảo trì / sửa chữa</option>
                                </select>
                            </div>

                            <div style={{ display: "flex", flexDirection: isMobile ? 'column' : 'row', gap: "15px" }}>
                                <div style={{ ...styles.formGroup, flex: 1 }}><label style={styles.label}>Giá thuê (VNĐ):</label><input type="number" name="price_per_night" required value={formData.price_per_night} onChange={handleInputChange} style={styles.input} /></div>
                                <div style={{ ...styles.formGroup, flex: 1 }}><label style={styles.label}>Sức chứa tối đa:</label><input type="number" name="max_guests" value={formData.max_guests} onChange={handleInputChange} style={styles.input} /></div>
                                <div style={{ ...styles.formGroup, flex: 1 }}><label style={styles.label}>Diện tích (m²):</label><input type="number" name="area" value={formData.area} onChange={handleInputChange} style={styles.input} /></div>
                            </div>

                            {/* Tiện nghi và Đặc điểm */}
                            <div style={{display:'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', marginTop:'15px'}}>
                                <div style={{...styles.formGroup, flex:1}}>
                                    <label style={styles.label}>Trang bị Tiện nghi:</label>
                                    <div style={styles.checkboxGroup}>
                                        {allFacilities.map(fac => (
                                            <label key={fac.id} style={styles.checkboxItem}><input type="checkbox" checked={formData.facility_ids.includes(fac.id)} onChange={() => handleCheckboxChange("facility_ids", fac.id)} /> {fac.name}</label>
                                        ))}
                                    </div>
                                </div>
                                <div style={{...styles.formGroup, flex:1}}>
                                    <label style={styles.label}>Đặc điểm nổi bật:</label>
                                    <div style={styles.checkboxGroup}>
                                        {allFeatures.map(feat => (
                                            <label key={feat.id} style={styles.checkboxItem}><input type="checkbox" checked={formData.feature_ids.includes(feat.id)} onChange={() => handleCheckboxChange("feature_ids", feat.id)} /> {feat.name}</label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '15px'}}>
                                <div style={styles.formGroup}><label style={styles.label}>URL Ảnh Đại Diện:</label><input type="text" name="main_image_url" value={formData.main_image_url} onChange={handleInputChange} style={styles.input} placeholder="https://..." /></div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Thư viện ảnh (Gallery):</label>
                                    <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                                        <input type="text" value={tempImgUrl} onChange={(e) => setTempImgUrl(e.target.value)} style={styles.input} placeholder="Dán link ảnh vào đây..." />
                                        <button type="button" onClick={handleAddGalleryImage} style={{...styles.button, backgroundColor: '#17a2b8', color: 'white'}}>Thêm</button>
                                    </div>
                                    <div style={styles.galleryContainer}>
                                        {formData.gallery_images.map((url, index) => (
                                            <div key={index} style={styles.galleryItem}>
                                                <img src={url.startsWith('http') ? url : `/images/${url}`} alt="gallery" style={styles.galleryImg} />
                                                <button type="button" style={styles.removeBtn} onClick={() => handleRemoveGalleryImage(index)}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.formGroup}><label style={styles.label}>Mô tả chi tiết phòng:</label><textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} style={{ ...styles.input, resize: "vertical" }} /></div>

                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.button, backgroundColor: "#6c757d", color: "white" }}>Hủy bỏ</button>
                                <button type="submit" style={{ ...styles.button, backgroundColor: "#007bff", color: "white" }}>{isEditing ? "Cập nhật ngay" : "Tạo phòng mới"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManager;