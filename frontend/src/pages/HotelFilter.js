import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ROYAL_COLOR = "#f3c300";
const BUTTON_GREEN = "#27ae60";

const HotelFilter = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [localFilters, setLocalFilters] = useState({
        checkIn: "",
        checkOut: "",
        maxPrice: "",
        guests: 1
    });

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setLocalFilters({
            checkIn: params.get("checkIn") || "",
            checkOut: params.get("checkOut") || "",
            maxPrice: params.get("maxPrice") || "",
            guests: parseInt(params.get("guests")) || 1
        });
    }, [location.search]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplySearch = () => {
        if (!localFilters.checkIn || !localFilters.checkOut) {
            alert("Vui lòng chọn ngày nhận và trả phòng để tìm kiếm!");
            return;
        }

        const params = new URLSearchParams();
        params.set("checkIn", localFilters.checkIn); 
        params.set("checkOut", localFilters.checkOut);
        if (localFilters.maxPrice) params.set("maxPrice", localFilters.maxPrice);
        params.set("guests", localFilters.guests);

        // Chuyển hướng đến URL có tham số lọc
        navigate(`/rooms?${params.toString()}`, { replace: true });
    };

    return (
        <div style={styles.container}>
            <h3 style={{ marginBottom: "20px", fontSize: "1.1rem" }}>🔎 Bộ Lọc Tìm Kiếm</h3>
            
            <label style={styles.label}>📅 Ngày Nhận Phòng</label>
            <input type="date" name="checkIn" min={today} value={localFilters.checkIn} onChange={handleInputChange} style={styles.input} />
            
            <label style={styles.label}>📅 Ngày Trả Phòng</label>
            <input type="date" name="checkOut" min={localFilters.checkIn || today} value={localFilters.checkOut} onChange={handleInputChange} style={styles.input} />

            <label style={styles.label}>💰 Ngân sách tối đa</label>
            <select name="maxPrice" value={localFilters.maxPrice} onChange={handleInputChange} style={styles.input}>
                <option value="">Tất cả mức giá</option>
                <option value="500000">Dưới 500k</option>
                <option value="1000000">Dưới 1tr</option>
                <option value="5000000">Dưới 5tr</option>
            </select>

            <label style={styles.label}>👥 Số lượng khách</label>
            <select name="guests" value={localFilters.guests} onChange={handleInputChange} style={styles.input}>
                {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Khách</option>)}
            </select>

            <button onClick={handleApplySearch} style={styles.btn}>TÌM PHÒNG NGAY</button>
        </div>
    );
};

const styles = {
    container: { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", borderTop: `4px solid ${ROYAL_COLOR}`, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
    label: { display: "block", fontSize: "12px", fontWeight: "bold", color: "#666", marginBottom: "8px", textTransform: "uppercase" },
    input: { width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box" },
    btn: { width: "100%", padding: "14px", backgroundColor: BUTTON_GREEN, color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }
};

export default HotelFilter;