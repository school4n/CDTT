import React from 'react';

// 🎨 CÁC ĐỊNH NGHĨA STYLE (Sử dụng lớp utility giống Tailwind trong CSS-in-JS)
const styles = {
    sectionGap: {
        paddingTop: '80px',
        paddingBottom: '80px',
    },
    container: {
        maxWidth: '1170px',
        margin: '0 auto',
        paddingLeft: '15px',
        paddingRight: '15px',
    },
    row: {
        display: 'flex',
        flexWrap: 'wrap',
        margin: '0 -15px',
        alignItems: 'center',
    },
    colMd6: {
        padding: '0 15px',
        width: '50%',
        boxSizing: 'border-box',
        '@media (maxWidth: 768px)': {
            width: '100%',
        }
    },
    dFlex: {
        display: 'flex',
        alignItems: 'center',
    },
    aboutContent: {
        paddingRight: '30px', // Khoảng cách giữa chữ và ảnh
    },
    title: {
        fontSize: '2rem',
        fontWeight: '600',
        lineHeight: 1.2,
        color: '#0f172a', // Giả định màu nền tối
        marginBottom: '20px',
    },
    paragraph: {
        fontSize: '15px',
        lineHeight: 1.8,
        color: '#6c757d',
        marginBottom: '25px',
    },
    buttonHover: {
        backgroundColor: '#f3c300', // Giả định màu chủ đạo
        color: '#0f172a',
        border: 'none',
        padding: '12px 25px',
        borderRadius: '5px',
        textDecoration: 'none',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        cursor: 'pointer',
    },
    imgFluid: {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '8px',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
        display: 'block',
    }
};

const AboutHistory = () => {
    // 💡 Ghi chú: Trong React thực tế, bạn sẽ dùng thư viện CSS-in-JS (như styled-components) 
    // hoặc Tailwind CSS để responsive và hover tốt hơn, thay vì object styles cơ bản này.
    
    // Giả lập Media Query cho Responsive (chỉ minh họa)
    const handleResize = () => {
        const isMobile = window.innerWidth <= 768;
        // Logic phức tạp hơn nếu dùng CSS-in-JS
    };

    return (
        <section style={styles.sectionGap} className="about_history_area">
            <div style={styles.container}>
                <div style={styles.row}>
                    
                    {/* Phần Nội dung */}
                    <div style={styles.colMd6}>
                        <div style={{ ...styles.dFlex, height: '100%' }}>
                            <div style={styles.aboutContent}>
                                <h2 style={styles.title}>
                                    Về Chúng Tôi <br />
                                    Lịch Sử Hoạt Động<br />
                                    Sứ Mệnh & Tầm Nhìn
                                </h2>
                                <p style={styles.paragraph}>
                                   Khách sạn của chúng tôi được thành lập với mục tiêu mang đến một không gian nghỉ dưỡng thoải mái, 
                                   sang trọng và thân thiện dành cho mọi du khách. 
Chúng tôi cam kết mang đến dịch vụ lưu trú chất lượng cao, 
an toàn và tiện nghi. Sứ mệnh của chúng tôi là đảm bảo mỗi du khách đều cảm thấy thoải mái như đang ở chính ngôi nhà của mình – 
với sự phục vụ tận tâm, chuyên nghiệp và chu đáo.

Trở thành một trong những khách sạn được yêu thích và tin tưởng nhất tại khu vực, 
nơi du khách luôn nghĩ đến khi cần một nơi nghỉ ngơi lý tưởng. Chúng tôi hướng đến việc phát triển bền vững,
 nâng cao chất lượng cơ sở vật chất, ứng dụng công nghệ vào quản lý và cung cấp trải nghiệm lưu trú vượt xa mong đợi.
                                </p>
                                <a 
                                    href="http://localhost:3000/rooms" 
                                    style={styles.buttonHover}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d6ad00'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3c300'}
                                    className="button_hover theme_btn_two"
                                >
                                    Xem chi tiết
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    {/* Phần Hình ảnh */}
                    <div style={styles.colMd6}>
                        <img 
                            style={styles.imgFluid} 
                            src="https://hotel.oxu.vn/wp-content/uploads/2015/09/quan-ly-khach-san-hotel-grand.jpg" 
                            alt="Về Chúng Tôi"
                        />
                        {/* 💡 Ghi chú: Thay URL placeholder bằng đường dẫn hình ảnh thực tế */}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutHistory;
