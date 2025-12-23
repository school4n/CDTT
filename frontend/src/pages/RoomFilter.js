import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ROYAL_COLOR = "#f3c300";

export default function RoomFilter() {
    const navigate = useNavigate();
    const location = useLocation();

    const [filters, setFilters] = useState({
        checkIn: "",
        checkOut: "",
        maxPrice: "",
        guests: 1
    });

    const today = new Date().toISOString().split('T')[0];

    // 1. Đồng bộ URL vào State khi load hoặc thay đổi thanh địa chỉ
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setFilters({
            checkIn: params.get("checkIn") || "",
            checkOut: params.get("checkOut") || "",
            maxPrice: params.get("maxPrice") || "",
            guests: parseInt(params.get("guests")) || 1
        });
    }, [location.search]);

    // 2. Hàm thay đổi - Đẩy dữ liệu lên URL chuẩn hóa (Fix triệt để lỗi phòng bận)
    const handleFilterChange = (field, value) => {
        const params = new URLSearchParams(location.search);
        
        // Cập nhật giá trị mới vào Params
        if (value && value !== "") {
            params.set(field, value);
        } else {
            params.delete(field);
        }

        // ĐỘ ƯU TIÊN 1: Logic ngày tháng để chặn phòng bận tại Backend
        if (field === "checkIn" && value) {
            const checkInDate = new Date(value);
            const currentCheckOut = params.get("checkOut") ? new Date(params.get("checkOut")) : null;

            // Nếu ngày trả trống hoặc nhỏ hơn/bằng ngày nhận, tự dời ngày trả lên +1
            if (!currentCheckOut || currentCheckOut <= checkInDate) {
                const nextDay = new Date(checkInDate);
                nextDay.setDate(nextDay.getDate() + 1);
                params.set("checkOut", nextDay.toISOString().split('T')[0]);
            }
        }

        // Đảm bảo tham số guests luôn có trên URL để API lọc max_guests chính xác
        if (!params.has("guests")) {
            params.set("guests", filters.guests);
        }

        // Dọn dẹp các tham số rác/lỗi (như checkn trong ảnh lỗi của bạn)
        params.delete("checkn"); 

        /**
         * LỆNH QUAN TRỌNG: Điều hướng thay đổi URL trên trình duyệt.
         * Điều này sẽ kích hoạt useEffect trong file Rooms.js để gọi lại API Search Advanced.
         */
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    return (
        <div style={styles.sidebar}>
            <h3 style={styles.header}>🔎 Lọc Phòng Trống</h3>
            
            <div style={styles.filterGroup}>
                <label style={styles.label}>📅 1. Ngày Nhận & Trả (Ưu tiên 1)</label>
                <input 
                    type="date" 
                    min={today} 
                    value={filters.checkIn} 
                    onChange={e => handleFilterChange("checkIn", e.target.value)} 
                    style={styles.input} 
                />
                <input 
                    type="date" 
                    min={filters.checkIn || today} 
                    value={filters.checkOut} 
                    onChange={e => handleFilterChange("checkOut", e.target.value)} 
                    style={styles.inputSpacing} // Fix lỗi marginTop
                />
            </div>

            <div style={styles.filterGroup}>
                <label style={styles.label}>💰 2. Ngân sách tối đa (Ưu tiên 2)</label>
                <select 
                    value={filters.maxPrice} 
                    onChange={e => handleFilterChange("maxPrice", e.target.value)} 
                    style={styles.input}
                >
                    <option value="">Tất cả mức giá</option>
                    <option value="500000">Dưới 500.000 VNĐ</option>
                    <option value="1000000">Dưới 1.000.000 VNĐ</option>
                    <option value="2000000">Dưới 2.000.000 VNĐ</option>
                    <option value="5000000">Dưới 5.000.000 VNĐ</option>
                </select>
            </div>

            <div style={styles.filterGroup}>
                <label style={styles.label}>👥 3. Số lượng khách (Ưu tiên 3)</label>
                <select 
                    value={filters.guests} 
                    onChange={e => handleFilterChange("guests", e.target.value)} 
                    style={styles.input}
                >
                    {[1,2,3,4,5,6,8,10].map(n => (
                        <option key={n} value={n}>{n} Khách (Lớn & Trẻ em)</option>
                    ))}
                </select>
            </div>

            <div style={styles.note}>
                * Kết quả hiển thị được lọc tự động dựa trên lịch phòng trống tại Database.
            </div>
        </div>
    );
}

const styles = {
    sidebar: { 
        width: '300px', 
        backgroundColor: '#fff', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        borderTop: `4px solid ${ROYAL_COLOR}`, 
        boxSizing: 'border-box' 
    },
    header: { 
        borderBottom: '1px solid #eee', 
        paddingBottom: '15px', 
        marginBottom: '20px', 
        color: '#1e293b', 
        fontSize: '1.1rem', 
        fontWeight: 'bold' 
    },
    filterGroup: { marginBottom: '20px' },
    label: { 
        display: 'block', 
        marginBottom: '10px', 
        fontWeight: 'bold', 
        fontSize: '13px', 
        color: '#64748b',
        textTransform: 'uppercase'
    },
    input: { 
        width: '100%', 
        padding: '12px', 
        borderRadius: '6px', 
        border: '1px solid #e2e8f0', 
        fontSize: '14px', 
        outline: 'none',
        boxSizing: 'border-box',
        backgroundColor: '#f8fafc'
    },
    inputSpacing: {
        width: '100%', 
        padding: '12px', 
        borderRadius: '6px', 
        border: '1px solid #e2e8f0', 
        fontSize: '14px', 
        outline: 'none',
        boxSizing: 'border-box',
        marginTop: '10px',
        backgroundColor: '#f8fafc'
    },
    note: { 
        marginTop: '20px', 
        fontStyle: 'italic', 
        fontSize: '11px', 
        color: '#94a3b8', 
        lineHeight: '1.6' 
    }
};