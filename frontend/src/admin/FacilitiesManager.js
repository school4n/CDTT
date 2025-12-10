import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

const API_FAC_URL = "http://localhost:3001/api/admin/facilities";

const styles = {
    container: { padding: "20px", fontFamily: "Arial, sans-serif" },
    headerControls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px"
    },
    button: {
        padding: "8px 14px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px"
    },
    searchBox: {
        padding: "8px 15px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        width: "280px"
    },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
    tableHeader: { backgroundColor: "#343a40", color: "white" },
    tableCell: {
        padding: "15px",
        borderBottom: "1px solid #eee",
        textAlign: "left"
    },
    modalOverlay: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999
    },
    modal: {
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "8px",
        width: "450px",
        maxWidth: "90%",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    },
    formGroup: { marginBottom: "15px" },
    label: { fontWeight: "bold", marginBottom: "5px", display: "block" },
    input: {
        width: "100%",
        padding: "8px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        boxSizing: "border-box"
    },
    modalActions: { marginTop: "20px", textAlign: "right" }
};

const FacilitiesManager = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        icon_url: ""
    });

    const ADMIN_TOKEN = useMemo(() => localStorage.getItem("adminToken"), []);

    const fetchFacilities = useCallback(async () => {
        try {
            const res = await axios.get(API_FAC_URL, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
            });
            setFacilities(res.data.data || res.data);
        } catch (err) {
            console.error("Lỗi load dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    }, [ADMIN_TOKEN]);

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
            name: item.name,
            description: item.description,
            icon_url: item.icon_url
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_FAC_URL}/${currentId}`, formData, {
                    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
                });
                alert("Cập nhật thành công!");
            } else {
                await axios.post(API_FAC_URL, formData, {
                    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
                });
                alert("Thêm tiện ích thành công!");
            }
            setShowModal(false);
            fetchFacilities();
        } catch (err) {
            alert(err.response?.data?.message || "Có lỗi xảy ra!");
        }
    };

    const deleteFacility = async (id) => {
        if (!window.confirm("Xác nhận xóa tiện ích?")) return;
        try {
            await axios.delete(`${API_FAC_URL}/${id}`, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
            });
            fetchFacilities();
        } catch (err) {
            alert("Xóa thất bại!");
        }
    };

    const filteredFacilities = facilities.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={styles.container}>⏳ Đang tải...</div>;

    return (
        <div style={styles.container}>
            <h2>⚙️ Quản lý Tiện Ích (Facilities)</h2>
            <hr />

            {/* Header controls */}
            <div style={styles.headerControls}>
                <input
                    type="text"
                    placeholder="Tìm kiếm tiện ích..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchBox}
                />
                <button
                    style={{ ...styles.button, backgroundColor: "#28a745", color: "white" }}
                    onClick={openAddModal}
                >
                    ➕ Thêm Tiện Ích
                </button>
            </div>

            {/* Table */}
            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeader}>
                        <th style={styles.tableCell}>#</th>
                        <th style={styles.tableCell}>Tên</th>
                        <th style={styles.tableCell}></th>
                        <th style={styles.tableCell}></th>
                        <th style={styles.tableCell}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredFacilities.map((item, idx) => (
                        <tr key={item.id}>
                            <td style={styles.tableCell}>{idx + 1}</td>
                            <td style={styles.tableCell}><b>{item.name}</b></td>
                            <td style={styles.tableCell}>{item.description}</td>
                            <td style={styles.tableCell}>
                                {item.icon_url && (
                                    <img src={item.icon_url} alt="icon" width="40" />
                                )}
                            </td>
                            <td style={styles.tableCell}>
                                <button
                                    style={{ ...styles.button, backgroundColor: "#007bff", color: "white", marginRight: "8px" }}
                                    onClick={() => openEditModal(item)}
                                >
                                    ✏️ Sửa
                                </button>
                                <button
                                    style={{ ...styles.button, backgroundColor: "#dc3545", color: "white" }}
                                    onClick={() => deleteFacility(item.id)}
                                >
                                    🗑️ Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={{ marginTop: 0 }}>
                            {isEditing ? "Cập Nhật Tiện Ích" : "Thêm Tiện Ích Mới"}
                        </h3>

                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tên tiện ích:</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    style={{ ...styles.button, backgroundColor: "#6c757d", color: "white", marginRight: "10px" }}
                                    onClick={() => setShowModal(false)}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    style={{ ...styles.button, backgroundColor: "#007bff", color: "white" }}
                                >
                                    {isEditing ? "Lưu thay đổi" : "Tạo mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacilitiesManager;
