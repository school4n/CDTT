import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 🎨 MÀU SẮC THEO PHONG CÁCH TRIP.COM
const TRIP_BLUE = "#2b56cc"; 
const TRIP_ORANGE = "#ff9500"; 
const TEXT_DARK = "#0f294d"; // Màu chữ tiêu đề đậm
const TEXT_GRAY = "#455873"; // Màu chữ nội dung
const BG_COLOR = "#ffffff"; // Nền trắng
const BG_GRAY = "#f5f7fa"; // Nền xám nhạt cho phần dưới cùng

const Footer = () => {
    const currentYear = new Date().getFullYear();

    // 📱 Check Mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 🎨 STYLES
    const styles = {
        footerArea: {
            backgroundColor: BG_COLOR,
            padding: '60px 0 0 0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
            borderTop: '1px solid #e0e0e0', // Đường kẻ nhẹ bên trên
        },
        container: {
            maxWidth: '1170px',
            margin: '0 auto',
            padding: '0 20px',
        },
        // Grid Layout: Mobile 1 cột, Desktop 4 cột
        row: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr 1.2fr',
            gap: '30px',
            marginBottom: '40px',
        },
        // Widget
        title: {
            fontSize: '16px',
            fontWeight: '700',
            color: TEXT_DARK,
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        paragraph: {
            fontSize: '14px',
            lineHeight: 1.6,
            color: TEXT_GRAY,
            marginBottom: '15px',
        },
        // List Link
        listStyle: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        linkItem: {
            marginBottom: '10px',
            display: 'block',
        },
        link: {
            color: TEXT_GRAY,
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.2s',
            cursor: 'pointer',
        },
        
        // Logo Trip.com ở Footer
        logoText: {
            fontSize: '28px',
            fontWeight: '800',
            color: TRIP_BLUE,
            textDecoration: 'none',
            marginBottom: '15px',
            display: 'inline-block',
        },
        logoDot: {
            color: TRIP_ORANGE,
        },

        // Footer Bottom (Copyright)
        footerBottom: {
            backgroundColor: BG_GRAY,
            padding: '20px 0',
            borderTop: '1px solid #e0e0e0',
            marginTop: '20px',
        },
        bottomContent: {
            maxWidth: '1170px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            textAlign: isMobile ? 'center' : 'left',
        },
        copyright: {
            fontSize: '13px',
            color: '#8592a6',
        },
        
        // Button giả lập tải app
        appBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#0f294d',
            color: 'white',
            padding: '8px 15px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '12px',
            marginRight: '10px',
            marginBottom: '10px',
        }
    };

    // Component Link nhỏ
    const FooterLink = ({ to, children }) => (
        <li style={styles.linkItem}>
            <Link 
                to={to} 
                style={styles.link}
                onMouseEnter={(e) => e.target.style.color = TRIP_BLUE}
                onMouseLeave={(e) => e.target.style.color = TEXT_GRAY}
            >
                {children}
            </Link>
        </li>
    );

    return (
        <footer style={styles.footerArea}>
            <div style={styles.container}>
                <div style={styles.row}>
                    
                    {/* CỘT 1: THÔNG TIN LIÊN HỆ */}
                    <div>
                        <Link to="/" style={styles.logoText}>
                            HotelBooking<span style={styles.logoDot}>.</span>com
                        </Link>
                        <p style={styles.paragraph}>
                            Một trong những công ty du lịch trực tuyến hàng đầu thế giới.
                        </p>
                        <div style={{marginTop: '20px'}}>
                            <h6 style={{...styles.title, marginBottom: '10px', fontSize: '14px'}}>HỖ TRỢ KHÁCH HÀNG</h6>
                            <p style={{color: TRIP_BLUE, fontSize: '18px', fontWeight: 'bold', margin: 0}}>
                                1900 1234
                            </p>
                            <p style={styles.paragraph}>Hỗ trợ 24/7 (Tiếng Việt)</p>
                        </div>
                    </div>

                    {/* CỘT 2: VỀ CHÚNG TÔI */}
                    <div>
                        <h6 style={styles.title}>Về Chúng Tôi</h6>
                        <ul style={styles.listStyle}>
                            <FooterLink to="/about">Giới thiệu HotelBooking.com</FooterLink>
                            <FooterLink to="#">Tin tức</FooterLink>
                            <FooterLink to="#">Tuyển dụng</FooterLink>
                            <FooterLink to="#">Chính sách quyền riêng tư</FooterLink>
                            <FooterLink to="#">Điều khoản sử dụng</FooterLink>
                        </ul>
                    </div>

                    {/* CỘT 3: DỊCH VỤ */}
                    <div>
                        <h6 style={styles.title}>Dịch Vụ</h6>
                        <ul style={styles.listStyle}>
                            <FooterLink to="/hotels">Khách sạn & Chỗ nghỉ</FooterLink>
                            <FooterLink to="#">Vé máy bay</FooterLink>
                            <FooterLink to="#">Vé tàu hỏa</FooterLink>
                            <FooterLink to="#">Tour & Hoạt động</FooterLink>
                            <FooterLink to="#">Đối tác Doanh nghiệp</FooterLink>
                        </ul>
                    </div>

                    {/* CỘT 4: THANH TOÁN & ỨNG DỤNG */}
                    <div>
                        <h6 style={styles.title}>Thanh Toán</h6>
                        <div style={{display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
                            {/* Giả lập icon thanh toán bằng text box cho nhẹ */}
                            {['VISA', 'MasterCard', 'JCB', 'Momo'].map((card, i) => (
                                <div key={i} style={{
                                    border: '1px solid #ddd', 
                                    padding: '5px 10px', 
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#555',
                                    fontWeight: 'bold',
                                    backgroundColor: '#fff'
                                }}>
                                    {card}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* COPYRIGHT BAR */}
            <div style={styles.footerBottom}>
                <div style={styles.bottomContent}>
                    <div style={styles.copyright}>
                        Copyright © {currentYear} HotelBooking.com Travel VietNam Pte. Ltd. All rights reserved.
                    </div>
                    <div style={{display: 'flex', gap: '20px'}}>
                        <a href="#" style={{color: '#8592a6', textDecoration: 'none', fontSize: '18px'}}>f</a>
                        <a href="#" style={{color: '#8592a6', textDecoration: 'none', fontSize: '18px'}}>t</a>
                        <a href="#" style={{color: '#8592a6', textDecoration: 'none', fontSize: '18px'}}>in</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;