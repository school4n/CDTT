import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar'; // Đảm bảo đường dẫn đúng

const AdminLayout = ({ children }) => {
    // 📱 Check Mobile giống hệt bên Sidebar
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        
        // Chạy ngay khi mount để xác định đúng trạng thái ban đầu
        handleResize(); 

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const styles = {
        wrapper: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f4f6f8',
            position: 'relative',
            overflowX: 'hidden', // Ngăn cuộn ngang
        },
        mainContent: {
            flexGrow: 1,
            // 🛠️ FIX LỖI QUAN TRỌNG NHẤT TẠI ĐÂY:
            // - Desktop: Cách trái 250px để nhường chỗ cho Sidebar cố định
            // - Mobile: Cách trái 0px (tràn màn hình) để lấp đầy khoảng trắng
            marginLeft: isMobile ? 0 : '250px', 
            
            // Đảm bảo nội dung luôn vừa khung hình
            width: isMobile ? '100%' : 'calc(100% - 250px)',
            
            padding: '20px',
            
            // Mobile: Thêm padding-top để nội dung không bị nút Menu (3 gạch) che mất
            paddingTop: isMobile ? '60px' : '20px', 
            
            transition: 'margin-left 0.3s ease-in-out', // Hiệu ứng co giãn mượt mà
            minHeight: '100vh',
            boxSizing: 'border-box',
        }
    };

    return (
        <div style={styles.wrapper}>
            {/* Sidebar (Code đã fix ở bước trước) */}
            <AdminSidebar />

            {/* Nội dung chính sẽ thay đổi tùy trang */}
            <div style={styles.mainContent}>
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;