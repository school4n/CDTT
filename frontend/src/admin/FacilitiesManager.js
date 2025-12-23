import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios"; // Đã thay thế bằng axiosClient
import axiosClient from "../api/config"; 
import { FaEdit, FaTrash, FaPlus, FaSearch, FaCogs } from "react-icons/fa";

const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";

const FacilitiesManager = () => {
    // 📱 1. STATE CHECK MOBILE
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: "", description: "", icon_url: ""
    });

    // 🚀 TẢI DỮ LIỆU TẬP TRUNG
    const fetchFacilities = useCallback(async () => {
        try {
            setLoading(true);
            // SỬ DỤNG axiosClient: Header Authorization đã được tự động thêm trong config.js
            const res = await axiosClient.get("/admin/facilities");
            setFacilities(res.data.data || res.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi load dữ liệu:", err);
            setError("Không thể tải danh sách tiện ích. Vui lòng kiểm tra quyền Admin.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFacilities();
    }, [fetchFacilities]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ name: "", description: "", icon_url: "" });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setIsEditing(true);
        setCurrentId(item.id);
        setFormData({
            name: item.name, description: item.description || "", icon_url: item.icon_url || ""
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // SỬ DỤNG axiosClient cho PUT
                await axiosClient.put(`/admin/facilities/${currentId}`, formData);
                alert("Cập nhật thành công!");
            } else {
                // SỬ DỤNG axiosClient cho POST
                await axiosClient.post("/admin/facilities", formData);
                alert("Thêm tiện ích thành công!");
            }
            setShowModal(false);
            fetchFacilities();
        } catch (err) {
            alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu!");
        }
    };

    const deleteFacility = async (id) => {
        if (!window.confirm("Xác nhận xóa tiện ích này?")) return;
        try {
            // SỬ DỤNG axiosClient cho DELETE
            await axiosClient.delete(`/admin/facilities/${id}`);
            alert("Đã xóa thành công!");
            fetchFacilities();
        } catch (err) {
            alert("Xóa thất bại!");
        }
    };

    const filteredFacilities = facilities.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 🎨 STYLES (Responsive)
    const styles = {
        container: { padding: isMobile ? "15px" : "30px", fontFamily: "serif", backgroundColor: "#f4f6f8", minHeight: "100%", boxSizing: 'border-box' },
        title: { color: DARK_BG, marginBottom: '20px', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold' },
        headerControls: {
            display: "flex", flexDirection: isMobile ? 'column' : 'row', justifyContent: "space-between", 
            alignItems: isMobile ? 'stretch' : "center", marginBottom: "15px", gap: '10px'
        },
        searchBox: { padding: "10px", border: "1px solid #ccc", borderRadius: "5px", width: isMobile ? "100%" : "300px", boxSizing: 'border-box' },
        addButton: { 
            padding: "10px 14px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "14px", 
            backgroundColor: "#28a745", color: "white", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' 
        },
        tableContainer: { display: isMobile ? 'none' : 'block', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' },
        table: { width: "100%", borderCollapse: "collapse" },
        tableHeader: { backgroundColor: "#343a40", color: "white" },
        tableCell: { padding: "15px", verticalAlign: "middle", borderBottom: "1px solid #eee", fontSize: "14px", textAlign: "left" },
        mobileList: { display: isMobile ? 'flex' : 'none', flexDirection: 'column', gap: '15px' },
        card: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #ddd' },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' },
        cardTitle: { fontWeight: 'bold', fontSize: '1.1rem', color: DARK_BG, display: 'flex', alignItems: 'center', gap: '8px' },
        cardRow: { marginBottom: '8px', fontSize: '0.9rem', color: '#555', display: 'flex', gap: '10px' },
        actionGroup: { display: 'flex', gap: '10px', marginTop: '15px' },
        btnMobile: { flex: 1, padding: '10px', borderRadius: '4px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' },
        modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
        modal: { backgroundColor: "white", padding: "25px", borderRadius: "8px", width: isMobile ? "95%" : "450px", maxWidth: "95%", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", boxSizing: 'border-box' },
        formGroup: { marginBottom: "15px" },
        label: { fontWeight: "bold", marginBottom: "5px", display: "block" },
        input: { width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" },
        modalActions: { marginTop: "20px", textAlign: "right", display: 'flex', justifyContent: 'flex-end', gap: '10px' }
    };

    if (loading) return <div style={{ padding: "30px", textAlign: "center" }}>⏳ Đang tải tiện ích...</div>;
    if (error) return <div style={{ padding: "30px", color: "red", textAlign: 'center' }}>{error}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>⚙️ Quản lý Tiện Ích</h2>
            
            <div style={styles.headerControls}>
                <input
                    type="text" placeholder="Tìm kiếm tiện ích..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchBox}
                />
                <button style={styles.addButton} onClick={openAddModal}>
                    <FaPlus /> Thêm Tiện Ích
                </button>
            </div>

            {/* BẢNG DESKTOP */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={{...styles.tableCell, width: '5%'}}>#</th>
                            <th style={{...styles.tableCell, width: '25%'}}>Tên</th>
                            <th style={{...styles.tableCell, width: '40%'}}>Mô tả</th>
                            <th style={{...styles.tableCell, width: '10%'}}>Icon</th>
                            <th style={{...styles.tableCell, width: '20%'}}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFacilities.map((item, idx) => (
                            <tr key={item.id}>
                                <td style={styles.tableCell}>{idx + 1}</td>
                                <td style={styles.tableCell}><b>{item.name}</b></td>
                                <td style={styles.tableCell}>{item.description}</td>
                                <td style={styles.tableCell}>
                                    {item.icon_url ? <img src={item.icon_url} alt="icon" width="30" height="30" style={{objectFit:'cover'}} /> : '-'}
                                </td>
                                <td style={styles.tableCell}>
                                    <button style={{ ...styles.addButton, backgroundColor: "#007bff", display:'inline-flex', padding: '6px 10px', marginRight:'5px' }} onClick={() => openEditModal(item)}>
                                        <FaEdit /> Sửa
                                    </button>
                                    <button style={{ ...styles.addButton, backgroundColor: "#dc3545", display:'inline-flex', padding: '6px 10px' }} onClick={() => deleteFacility(item.id)}>
                                        <FaTrash /> Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* DANH SÁCH MOBILE */}
            <div style={styles.mobileList}>
                {filteredFacilities.map((item) => (
                    <div key={item.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={styles.cardTitle}>
                                {item.icon_url ? <img src={item.icon_url} alt="icon" width="24" height="24" /> : <FaCogs color="#666"/>}
                                {item.name}
                            </div>
                            <span style={{color:'#888', fontSize:'0.8rem'}}>#{item.id}</span>
                        </div>
                        
                        <div style={styles.cardRow}>
                            <span style={{fontWeight:'bold', minWidth:'60px'}}>Mô tả:</span>
                            <span>{item.description || "Không có mô tả"}</span>
                        </div>

                        <div style={styles.actionGroup}>
                            <button style={{...styles.btnMobile, backgroundColor: '#007bff'}} onClick={() => openEditModal(item)}>
                                <FaEdit /> Sửa
                            </button>
                            <button style={{...styles.btnMobile, backgroundColor: '#dc3545'}} onClick={() => deleteFacility(item.id)}>
                                <FaTrash /> Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL THÊM/SỬA */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={{ marginTop: 0, color: DARK_BG }}>
                            {isEditing ? "Cập Nhật Tiện Ích" : "Thêm Tiện Ích Mới"}
                        </h3>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tên tiện ích:</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} style={styles.input} placeholder="Ví dụ: Wifi, Bể bơi..." />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Mô tả:</label>
                                <input type="text" name="description" value={formData.description} onChange={handleInputChange} style={styles.input} placeholder="Mô tả ngắn gọn..." />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Link Icon (URL):</label>
                                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                    <input type="text" name="icon_url" value={formData.icon_url} onChange={handleInputChange} style={styles.input} placeholder="https://..." />
                                    {formData.icon_url && <img src={formData.icon_url} alt="preview" width="40" height="40" style={{borderRadius:'4px', objectFit:'cover'}} />}
                                </div>
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.addButton, backgroundColor: "#6c757d" }}>Hủy</button>
                                <button type="submit" style={{ ...styles.addButton, backgroundColor: "#007bff" }}>{isEditing ? "Lưu Lại" : "Tạo Mới"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacilitiesManager;