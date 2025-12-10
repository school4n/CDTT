import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// --- Cấu hình API và Styles ---
const API_BASE_URL = 'http://localhost:3001/api/admin/users'; 

const styles = {
    // ... (Styles giữ nguyên)
    container: { padding: '30px', fontFamily: 'Arial, sans-serif' },
    title: { color: '#0f172a', marginBottom: '20px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    tableHeader: { backgroundColor: '#343a40', color: 'white' },
    tableCell: { 
        padding: '15px', 
        verticalAlign: 'middle',
        borderBottom: '1px solid #eee', 
        fontSize: '14px',
        textAlign: 'left'
    },
    statusActive: { color: 'white', backgroundColor: '#28a745', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
    statusInactive: { color: 'white', backgroundColor: '#ffc107', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },

    button: (color) => ({
        padding: '8px 12px',
        margin: '5px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: color,
        color: 'white',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        minWidth: '70px',
    }),
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000
    },
    modalContent: {
        backgroundColor: 'white', padding: '30px', borderRadius: '8px',
        width: '90%', 
        maxWidth: '400px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    input: {
        width: '100%', padding: '10px', margin: '8px 0',
        boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px'
    },
    actionContainer: { display: 'flex', gap: '5px', justifyContent: 'center' }
};

// ----------------------------------------------------
// Component chính
// ----------------------------------------------------
function AdminUserManagement() {
    const ADMIN_TOKEN = useMemo(() => localStorage.getItem('adminToken'), []);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalUser, setModalUser] = useState(null); 
    const [editData, setEditData] = useState({
        username: '',
        email: '',
        full_name: '',
        phone: '',
        password: '',
        isActive: false, 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const headersConfig = useMemo(() => ({
        headers: { 
            'Authorization': `Bearer ${ADMIN_TOKEN}`, 
            'Content-Type': 'application/json' 
        }
    }), [ADMIN_TOKEN]);


    // ------------------
    // TẢI DỮ LIỆU USERS
    // ------------------
    const fetchUsers = useCallback(async () => {
        if (!ADMIN_TOKEN) return; 
        
        try {
            setLoading(true);
            const response = await axios.get(API_BASE_URL, headersConfig);
            setUsers(Array.isArray(response.data) ? response.data : response.data.users || []);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải danh sách user:", err);
            setError("Không thể tải danh sách user. Lỗi: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [ADMIN_TOKEN, headersConfig]); 

    useEffect(() => {
        if (ADMIN_TOKEN) {
            fetchUsers();
        } else {
            setLoading(false);
            setError("Lỗi xác thực: Không tìm thấy Token Admin. Vui lòng đăng nhập lại.");
        }
    }, [fetchUsers, ADMIN_TOKEN]);


    // ------------------
    // XỬ LÝ CHỈNH SỬA TỪ MODAL
    // ------------------
    const handleEditClick = (user) => {
        setModalUser(user);
        setEditData({
            username: user.username || '',
            email: user.email || '',
            full_name: user.full_name || '', 
            phone: user.phone || '',
            isActive: user.isActive,
            password: ''
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (userId, statusChangeOnly = false, currentStatus = false) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const payload = {};
        
        const normalizeValue = (value) => {
            const trimmed = value?.trim();
            return trimmed === '' ? null : trimmed;
        };
        
        // --- LOGIC CẬP NHẬT TRẠNG THÁI (Nếu chỉ là toggle) ---
        if (statusChangeOnly) {
            payload.isActive = !currentStatus;
        } else {
            // --- LOGIC CẬP NHẬT TỪ MODAL ---
            
            // 1. Username
            const newUsername = normalizeValue(editData.username);
            if (newUsername === null) {
                alert("Username không được để trống.");
                setIsSubmitting(false);
                return;
            }
            if (newUsername !== modalUser.username) {
                payload.username = newUsername;
            }

            // 2. Email
            const newEmail = normalizeValue(editData.email);
            if (newEmail !== modalUser.email) {
                payload.email = newEmail;
            }

            // 3. Tên Đầy Đủ (full_name)
            const newFullName = normalizeValue(editData.full_name);
            if (newFullName !== modalUser.full_name) {
                payload.full_name = newFullName;
            }

            // 4. Số Điện Thoại (phone)
            const newPhone = normalizeValue(editData.phone);
            if (newPhone !== modalUser.phone) {
                payload.phone = newPhone;
            }
            
            // 5. Mật khẩu
            if (editData.password.trim() !== '') payload.password = editData.password.trim();
        }

        if (Object.keys(payload).length === 0) {
             alert("Không có thay đổi nào được thực hiện.");
             setIsSubmitting(false);
             if (!statusChangeOnly) setModalUser(null);
             return;
        }

        try {
            const response = await axios.put(`${API_BASE_URL}/${userId}`, payload, headersConfig);
            alert(response.data.message || "Cập nhật thành công!");
            setModalUser(null);
            fetchUsers();
        } catch (err) {
            alert("Lỗi cập nhật: " + (err.response?.data?.message || "Lỗi Server 500 không xác định."));
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // ------------------
    // XỬ LÝ TOGGLE STATUS (Dùng lại handleEditSubmit)
    // ------------------
    const handleToggleStatus = (user) => {
        const newStatus = !user.isActive;
        const action = newStatus ? 'KÍCH HOẠT' : 'VÔ HIỆU HÓA';

        if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản ${user.username} (ID: ${user.id})?`)) {
            return;
        }
        
        // Gọi handleEditSubmit với cờ statusChangeOnly = true
        handleEditSubmit(user.id, true, user.isActive);
    };


    // ------------------
    // XỬ LÝ XÓA
    // ------------------
    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Bạn có chắc chắn muốn XÓA tài khoản ${username} (ID: ${userId})? Thao tác này KHÔNG thể hoàn tác, và có thể xóa tất cả dữ liệu liên quan.`)) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/${userId}`, headersConfig);
            alert(`Đã xóa tài khoản ${username} thành công.`);
            fetchUsers();
        } catch (err) {
            alert("Lỗi xóa: " + (err.response?.data?.message || err.message));
        }
    };

    const handleCloseModal = () => {
        setModalUser(null);
    };


    // ----------------------------------------------------
    // RENDERING
    // ----------------------------------------------------
    if (!ADMIN_TOKEN || error) {
        return (
            <div style={styles.container}>
                <p style={{ color: 'red', fontWeight: 'bold' }}>
                    ❌ {error || "Lỗi xác thực: Không tìm thấy Token Admin. Vui lòng đăng nhập Admin."}
                </p>
            </div>
        );
    }
    
    if (loading) return <div style={styles.container}>⏳ Đang tải danh sách người dùng...</div>;
    
    return (
        <div style={styles.container}>
            <h2 style={styles.title}>👨‍💼 Quản Lý Tài Khoản Người Dùng ({users.length})</h2>
            <p>Chức năng này cho phép Admin xem, chỉnh sửa, **kích hoạt/vô hiệu hóa** và xóa tài khoản khách hàng.</p>
            <hr/>

            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeader}>
                        <th style={styles.tableCell}>ID</th>
                        <th style={styles.tableCell}>Username</th>
                        <th style={styles.tableCell}>Tên Đầy Đủ</th> 
                        <th style={styles.tableCell}>Email</th>
                        <th style={styles.tableCell}>SĐT</th>
                        <th style={{...styles.tableCell, textAlign: 'center'}}>Trạng Thái</th> 
                        <th style={{...styles.tableCell, textAlign: 'center'}}>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? users.map(user => (
                        <tr key={user.id}>
                            <td style={styles.tableCell}>{user.id}</td>
                            <td style={styles.tableCell}>{user.username}</td>
                            <td style={styles.tableCell}>{user.full_name || 'N/A'}</td> 
                            <td style={styles.tableCell}>{user.email}</td>
                            <td style={styles.tableCell}>{user.phone || 'N/A'}</td>

                            <td style={{...styles.tableCell, textAlign: 'center'}}>
                                <span style={user.isActive ? styles.statusActive : styles.statusInactive}>
                                    {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </td>

                            <td style={{ ...styles.tableCell, ...styles.actionContainer }}> 
                                <button 
                                    style={styles.button(user.isActive ? '#ffc107' : '#28a745')} 
                                    onClick={() => handleToggleStatus(user)}
                                >
                                    {user.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                                </button>
                                
                                <button 
                                    style={styles.button('#007bff')} 
                                    onClick={() => handleEditClick(user)}
                                >
                                    Sửa
                                </button>
                                <button 
                                    style={styles.button('#dc3545')} 
                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    )) : (
                         <tr>
                            <td colSpan="7" style={{...styles.tableCell, textAlign: 'center', color: '#6c757d'}}>
                                Không tìm thấy người dùng nào.
                            </td>
                         </tr>
                    )}
                </tbody>
            </table>

            {/* Modal Chỉnh Sửa */}
            {modalUser && (
                <div style={styles.modalOverlay} onClick={handleCloseModal}>
                    <div 
                        style={styles.modalContent} 
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <h3>Chỉnh sửa User: {modalUser.username} (ID: {modalUser.id})</h3>
                        <label>Username:</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="username"
                            value={editData.username}
                            onChange={handleEditChange}
                            disabled={isSubmitting}
                        />
                        <label>Email:</label>
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            value={editData.email}
                            onChange={handleEditChange}
                            disabled={isSubmitting}
                        />
                        <label>Tên Đầy Đủ:</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="full_name"
                            value={editData.full_name}
                            onChange={handleEditChange}
                            disabled={isSubmitting}
                        />
                        <label>Số Điện Thoại:</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="phone"
                            value={editData.phone}
                            onChange={handleEditChange}
                            disabled={isSubmitting}
                        />
                        <label>Mật khẩu MỚI (Để trống nếu không đổi):</label>
                        <input
                            style={styles.input}
                            type="password"
                            name="password"
                            value={editData.password}
                            onChange={handleEditChange}
                            placeholder="Nhập mật khẩu mới..."
                            disabled={isSubmitting}
                        />
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button 
                                style={styles.button('#6c757d')} 
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button 
                                style={styles.button('#28a745')} 
                                onClick={() => handleEditSubmit(modalUser.id)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUserManagement;