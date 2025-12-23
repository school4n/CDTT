import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Sử dụng Link thay vì thẻ a

const AboutHistory = () => {
    // 📱 1. THÊM STATE CHECK MOBILE
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 🎨 STYLES (Đưa vào trong component để dùng biến isMobile)
    const styles = {
        sectionGap: {
            paddingTop: isMobile ? '40px' : '80px', // Mobile giảm padding
            paddingBottom: isMobile ? '40px' : '80px',
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
            // Mobile: Có thể đảo ngược thứ tự nếu muốn ảnh lên đầu (flexDirection: 'column-reverse')
            // Ở đây giữ nguyên Text trên, Ảnh dưới
            flexDirection: 'row', 
        },
        colMd6: {
            padding: '0 15px',
            // 📱 Mobile: 100% chiều rộng, Desktop: 50%
            width: isMobile ? '100%' : '50%',
            boxSizing: 'border-box',
            marginBottom: isMobile ? '30px' : '0', // Mobile thêm khoảng cách dưới
        },
        aboutContent: {
            // Mobile: Bỏ padding phải để chữ tràn đều
            paddingRight: isMobile ? '0' : '30px', 
            textAlign: isMobile ? 'left' : 'left', // Có thể để center trên mobile nếu thích
        },
        title: {
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '600',
            lineHeight: 1.2,
            color: '#0f172a',
            marginBottom: '20px',
        },
        paragraph: {
            fontSize: '15px',
            lineHeight: 1.8,
            color: '#6c757d',
            marginBottom: '25px',
            textAlign: 'justify', // Canh đều văn bản cho đẹp
        },
        buttonHover: {
            backgroundColor: '#f3c300',
            color: '#0f172a',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
            cursor: 'pointer',
            display: 'inline-block',
        },
        imgFluid: {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
            display: 'block',
            // Mobile: Căn giữa ảnh
            margin: isMobile ? '0 auto' : '0', 
        }
    };

    return (
        <section style={styles.sectionGap} className="about_history_area">
            <div style={styles.container}>
                <div style={styles.row}>
                    
                    {/* Phần Nội dung */}
                    <div style={styles.colMd6}>
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
                                <br/><br/>
                                Trở thành một trong những khách sạn được yêu thích và tin tưởng nhất tại khu vực, 
                                nơi du khách luôn nghĩ đến khi cần một nơi nghỉ ngơi lý tưởng. Chúng tôi hướng đến việc phát triển bền vững,
                                nâng cao chất lượng cơ sở vật chất, ứng dụng công nghệ vào quản lý và cung cấp trải nghiệm lưu trú vượt xa mong đợi.
                            </p>
                            <Link 
                                to="/rooms" 
                                style={styles.buttonHover}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d6ad00'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3c300'}
                            >
                                Xem chi tiết
                            </Link>
                        </div>
                    </div>
                    
                    {/* Phần Hình ảnh */}
                    <div style={styles.colMd6}>
                        <img 
                            style={styles.imgFluid} 
                            src="https://hotel.oxu.vn/wp-content/uploads/2015/09/quan-ly-khach-san-hotel-grand.jpg" 
                            alt="Về Chúng Tôi"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutHistory;