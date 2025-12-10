import React from 'react';
import { Link } from 'react-router-dom';
// Đã loại bỏ import 'react-icons/fa' để khắc phục lỗi biên dịch

// 🎨 CÁC HẰNG SỐ THEME
const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";
const LIGHT_TEXT = "#ccc";
const DEFAULT_TEXT = "#ADB2BD"; // Màu chữ mặc định cho footer

const styles = {
    footerArea: {
        backgroundColor: DARK_BG,
        padding: '80px 0 30px 0',
        fontFamily: 'serif',
        color: LIGHT_TEXT,
    },
    container: {
        maxWidth: '1170px',
        margin: '0 auto',
        padding: '0 15px',
    },
    row: {
        display: 'flex',
        flexWrap: 'wrap',
        margin: '0 -15px',
        justifyContent: 'space-between',
    },
    col: {
        padding: '0 15px',
        width: '25%', // 4 cột trên desktop
        boxSizing: 'border-box',
        '@media (maxWidth: 992px)': {
            width: '50%',
            marginBottom: '40px',
        },
        '@media (maxWidth: 576px)': {
            width: '100%',
        }
    },
    widget: {
        marginBottom: '30px',
    },
    title: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#fff',
        marginBottom: '25px',
        position: 'relative',
    },
    paragraph: {
        fontSize: '14px',
        lineHeight: 1.8,
        color: DEFAULT_TEXT,
        marginBottom: '15px', // Thêm margin bottom cho mỗi đoạn
    },
    listStyle: {
        listStyle: 'none',
        padding: 0,
    },
    link: {
        color: DEFAULT_TEXT,
        textDecoration: 'none',
        fontSize: '14px',
        lineHeight: '2.5em',
        transition: 'color 0.3s',
    },
    // Newsletter & InstaFeed
    input: {
        padding: '12px',
        border: 'none',
        borderRadius: '0',
        width: 'calc(100% - 40px)',
        backgroundColor: '#1e293b',
        color: LIGHT_TEXT,
        borderTopLeftRadius: '4px',
        borderBottomLeftRadius: '4px',
    },
    subBtn: {
        padding: '12px 15px',
        backgroundColor: ROYAL_COLOR,
        color: DARK_BG,
        border: 'none',
        cursor: 'pointer',
        borderTopRightRadius: '4px',
        borderBottomRightRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    instafeedList: {
        listStyle: 'none',
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px',
    },
    instafeedItem: {
        width: 'calc(25% - 4px)', // 4 items per row
        height: '60px',
        overflow: 'hidden',
    },
    instafeedImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    // Footer Bottom
    borderLine: {
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        margin: '30px 0',
    },
    footerBottom: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    footerText: {
        fontSize: '14px',
        color: DEFAULT_TEXT,
        margin: 0,
    },
    socialLink: {
        color: DEFAULT_TEXT,
        fontSize: '16px',
        marginLeft: '15px',
        transition: 'color 0.3s',
    },
    socialIcon: {
        fontSize: '20px', // Tăng kích thước icon
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
};

const Footer = () => {

    const currentYear = new Date().getFullYear();

    // Dữ liệu giả định cho InstaFeed (sử dụng placeholder)
    const instaImages = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        url: `https://img.freepik.com/vector-mien-phi/thiet-ke-logo-gradient-chu-a-day-mau-sac_474888-2309.jpg?semt=ais_hybrid&w=740&q=80`
    }));

    // Dữ liệu Navigation Links đã được cập nhật
    const navLinks = [
        { to: "/", label: "Trang chủ" },
        { to: "/hotels", label: "Phòng" },
        { to: "/cart", label: "Giỏ hàng" },
        { to: "/userbookings", label: "Lịch sử ĐH" },
        // Giữ nguyên các link giả định
        { to: "#", label: "Tính năng" },
        { to: "#", label: "Dịch vụ" },
        { to: "#", label: "Liên hệ" },
        { to: "#", label: "Blog" }
    ];

    const LinkItem = ({ to, children }) => (
        <Link 
            to={to} 
            style={styles.link}
            onMouseEnter={(e) => e.currentTarget.style.color = ROYAL_COLOR}
            onMouseLeave={(e) => e.currentTarget.style.color = DEFAULT_TEXT}
        >
            {children}
        </Link>
    );

    return (
        <footer style={styles.footerArea}>
            <div style={styles.container}>
                <div style={styles.row}>
                    
                    {/* Cột 1: About Agency -> Về Khách sạn (Nội dung mở rộng) */}
                    <div style={{...styles.col, width: styles.col['@media (maxWidth: 992px)'] ? '50%' : styles.col.width}}>
                        <div style={styles.widget}>
                            <h6 style={styles.title}>Về Khách sạn</h6>
                            <p style={styles.paragraph}>
                                Kinh nghiệm và Đổi mới: Với hơn một thập kỷ hoạt động trong ngành dịch vụ lưu trú, chúng tôi cam kết mang đến những trải nghiệm độc đáo và tiện nghi nhất cho mỗi khách hàng. Chúng tôi không ngừng đổi mới để đáp ứng mọi nhu cầu nghỉ dưỡng, dù là ngắn hạn hay dài hạn.
                            </p>
                            <p style={styles.paragraph}>
                                Sứ mệnh: Sứ mệnh của chúng tôi là trở thành điểm đến lý tưởng, nơi bạn có thể thư giãn hoàn toàn, cảm nhận sự thoải mái như ở nhà và tạo ra những kỷ niệm đáng nhớ bên gia đình và bạn bè.
                            </p>
                            <p style={styles.paragraph}>
                                Cam kết: Chúng tôi tin rằng dịch vụ xuất sắc nằm ở sự tận tâm và chi tiết. Đội ngũ nhân viên chuyên nghiệp, thân thiện của chúng tôi luôn sẵn sàng phục vụ 24/7 để đảm bảo kỳ nghỉ của bạn diễn ra suôn sẻ và hoàn hảo nhất.
                            </p>
                        </div>
                    </div>

                    {/* Cột 2: Navigation Links */}
                    <div style={styles.col}>
                        <div style={styles.widget}>
                            <h6 style={styles.title}>Đường dẫn</h6>
                            <div style={styles.row}>
                                {/* Chia 8 link thành 2 cột 4 */}
                                <div style={{width: '50%'}}>
                                    <ul style={styles.listStyle}>
                                        {navLinks.slice(0, 4).map((link, index) => (
                                            <li key={index}><LinkItem to={link.to}>{link.label}</LinkItem></li>
                                        ))}
                                    </ul>
                                </div>
                                <div style={{width: '50%'}}>
                                    <ul style={styles.listStyle}>
                                        {navLinks.slice(4).map((link, index) => (
                                            <li key={index}><LinkItem to={link.to}>{link.label}</LinkItem></li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột 3: Newsletter */}
                    <div style={styles.col}>
                        <div style={styles.widget}>
                            <h6 style={styles.title}>Đăng ký nhận tin</h6>
                            <p style={styles.paragraph}>Nhận các ưu đãi đặc biệt và tin tức mới nhất từ chúng tôi.</p>
                            <div id="mc_embed_signup">
                                <form action="#" method="post">
                                    <div style={{display: 'flex', flexDirection: 'row', marginTop: '15px'}}>
                                        <input 
                                            name="EMAIL" 
                                            placeholder="Địa chỉ Email" 
                                            required 
                                            type="email"
                                            style={styles.input}
                                        />
                                        <button className="btn sub-btn" style={styles.subBtn}>
                                            <span style={{fontSize: '18px'}}>➤</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Cột 4: InstaFeed */}
                    <div style={styles.col}>
                        <div style={styles.widget}>
                            <h6 style={styles.title}>InstaFeed</h6>
                            <ul style={styles.instafeedList}>
                                {instaImages.map(img => (
                                    <li key={img.id} style={styles.instafeedItem}>
                                        <img src={img.url} alt={`InstaFeed ${img.id}`} style={styles.instafeedImg} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div style={styles.borderLine}></div>
                
                {/* Footer Bottom */}
                <div style={styles.footerBottom}>
                    <p style={styles.footerText}>
                        Copyright &copy; {currentYear} All rights reserved | 
                        <span style={{color: '#e8491d', margin: '0 5px', fontSize: '18px'}} aria-hidden="true">♥</span> bởi 
                        <a href="https://colorlib.com" target="_blank" rel="noopener noreferrer" style={{color: ROYAL_COLOR, marginLeft: '5px'}}>
                            ThaiTruongAnn
                        </a>
                    </p>
                    <div style={{display: 'flex', gap: '15px'}}>
                        <a href="#" style={{...styles.socialLink, ...styles.socialIcon}}>f</a> {/* Facebook */}
                        <a href="#" style={{...styles.socialLink, ...styles.socialIcon}}>t</a> {/* Twitter */}
                        <a href="#" style={{...styles.socialLink, ...styles.socialIcon}}>d</a> {/* Dribbble */}
                        <a href="#" style={{...styles.socialLink, ...styles.socialIcon}}>b</a> {/* Behance */}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;