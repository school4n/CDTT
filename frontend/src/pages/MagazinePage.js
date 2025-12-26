import React from 'react';

// 🎨 HỆ THỐNG MÀU SẮC & THEME
const COLORS = {
  primary: "#1e293b",    // Slate 800 (Sâu lắng, sang trọng)
  accent: "#c5a059",     // Gold (Điểm nhấn cao cấp)
  bg: "#fdfdfd",         // Nền giấy báo
  text: "#334155",       // Màu chữ nội dung
  border: "#e2e8f0"      // Viền nhạt
};

const styles = {
  wrapper: {
    backgroundColor: COLORS.bg,
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    color: COLORS.text,
    lineHeight: '1.8',
    paddingBottom: '100px'
  },
  // Header phong cách báo chí
  header: {
    textAlign: 'center',
    padding: '80px 20px',
    borderBottom: `1px solid ${COLORS.border}`,
    maxWidth: '1000px',
    margin: '0 auto 50px'
  },
  category: {
    textTransform: 'uppercase',
    letterSpacing: '4px',
    fontSize: '0.75rem',
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: '15px',
    display: 'block'
  },
  title: {
    fontFamily: "'Playfair Display', serif", // Bạn nên thêm font này vào index.html
    fontSize: '3.5rem',
    color: COLORS.primary,
    margin: '10px 0',
    fontWeight: '700',
    lineHeight: '1.1'
  },
  // Bố cục bài viết
  articleContainer: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '60px'
  },
  heroImage: {
    width: '100%',
    height: '550px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '40px'
  },
  dropcap: {
    float: 'left',
    fontSize: '5rem',
    lineHeight: '1',
    margin: '10px 15px 0 0',
    fontFamily: "'Playfair Display', serif",
    color: COLORS.primary
  },
  sectionHeading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2rem',
    color: COLORS.primary,
    marginTop: '40px',
    marginBottom: '20px',
    borderLeft: `4px solid ${COLORS.accent}`,
    paddingLeft: '20px'
  },
  pullQuote: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.6rem',
    fontStyle: 'italic',
    color: COLORS.accent,
    textAlign: 'center',
    padding: '40px 0',
    margin: '50px 0',
    borderTop: `1px solid ${COLORS.border}`,
    borderBottom: `1px solid ${COLORS.border}`,
    lineHeight: '1.4'
  },
  // Grid điểm đến (Dựa trên ảnh bạn cung cấp)
  destGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    margin: '30px 0'
  },
  destCard: {
    position: 'relative',
    height: '180px',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer'
  },
  destImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease'
  },
  destName: {
    position: 'absolute',
    bottom: '15px',
    left: '15px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '1.1rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  },
  // Sidebar
  sidebar: {
    backgroundColor: '#f8fafc',
    padding: '30px',
    borderRadius: '16px',
    height: 'fit-content',
    position: 'sticky',
    top: '20px'
  },
  sidebarTitle: {
    fontSize: '0.9rem',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: `2px solid ${COLORS.primary}`,
    paddingBottom: '10px',
    marginBottom: '20px'
  },
  roomMiniCard: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    textDecoration: 'none',
    color: 'inherit'
  }
};

const MagazinePage = () => {
  return (
    <div style={styles.wrapper}>
      {/* HEADER SECTION */}
      <header style={styles.header}>
        <span style={styles.category}>The Art of Living · Trải nghiệm thượng lưu</span>
        <h1 style={styles.title}>Định Nghĩa Lại Sự Sang Trọng Tại Luxury Hotel</h1>
        <p style={{ color: COLORS.textMuted, fontStyle: 'italic' }}>
          Bài viết bởi Editorial Team | Cập nhật ngày 26 tháng 12, 2025
        </p>
      </header>

      <div style={styles.articleContainer}>
        {/* NỘI DUNG CHÍNH (TRÁI) */}
        <main>
          <img 
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080" 
            alt="Main Hero" 
            style={styles.heroImage}
          />

          <section>
            <p><span style={styles.dropcap}>T</span>rong thế giới nghỉ dưỡng hiện đại, sự xa xỉ không còn chỉ đong đếm bằng những mảng dát vàng, mà nằm ở trải nghiệm cá nhân hóa và sự tĩnh lặng tuyệt đối. Luxury Hotel tự hào là nơi kết nối tinh hoa kiến trúc với công nghệ quản lý phòng nghỉ tiên tiến nhất hiện nay.</p>
            
            <h2 style={styles.sectionHeading}>Hệ sinh thái VIP & Công nghệ đặt phòng</h2>
            <p>Như đã được giới thiệu trong chuyên mục trải nghiệm, hệ thống phòng <strong>VIP Cao Cấp 1</strong> với mức giá niêm yết 2.400.000 VNĐ mang đến một chuẩn mực mới về sự tiện nghi. Điểm đột phá nằm ở quy trình xác nhận đặt phòng tức thì và tích hợp thanh toán mã VietQR thông minh, giúp khách hàng lược bỏ mọi thủ tục rườm rà.</p>
            
            <div style={styles.pullQuote}>
              "Chúng tôi không bán một căn phòng, chúng tôi bán sự an tâm và những khoảnh khắc vô giá tại những thành phố đẹp nhất thế giới."
            </div>

            <h2 style={styles.sectionHeading}>Những Điểm Đến Phổ Biến</h2>
            <p>Từ vẻ đẹp cổ kính của Florence đến sự tráng lệ của Dubai, mạng lưới khách sạn của chúng tôi luôn tọa lạc tại những vị trí đắc địa nhất:</p>
            
            <div style={styles.destGrid}>
              {[
                { name: 'Florence', img: 'https://images.unsplash.com/photo-1548107774-b51a4b21893e?w=500' },
                { name: 'Dubai', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500' },
                { name: 'Luân Đôn', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500' },
                { name: 'Bắc Kinh', img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=500' }
              ].map((dest, idx) => (
                <div key={idx} style={styles.destCard}>
                  <img src={dest.img} alt={dest.name} style={styles.destImg} />
                  <span style={styles.destName}>{dest.name}</span>
                </div>
              ))}
            </div>

            <p>Mỗi khách sạn trong hệ thống đều tuân thủ nghiêm ngặt quy trình quản lý lịch sử đặt phòng, đảm bảo tính minh bạch và dịch vụ hậu mãi chu đáo cho mọi du khách.</p>
          </section>
        </main>

        {/* SIDEBAR (PHẢI) */}
        <aside>
          <div style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Phòng Đang Hot</h3>
            {[
              { name: 'VIP Cao Cấp 1', price: '2,400,000 VNĐ', img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=200' },
              { name: 'Premium Suite', price: '3,500,000 VNĐ', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200' }
            ].map((room, idx) => (
              <div key={idx} style={styles.roomMiniCard}>
                <img src={room.img} alt={room.name} style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{room.name}</div>
                  <div style={{ color: COLORS.accent, fontSize: '0.8rem', fontWeight: 'bold' }}>{room.price}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '40px' }}>
              <h3 style={styles.sidebarTitle}>Ưu Điểm Nổi Bật</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: COLORS.text }}>
                <li>Thanh toán VietQR tích hợp.</li>
                <li>Lịch sử đặt phòng bảo mật.</li>
                <li>Hỗ trợ 24/7 trực tuyến.</li>
                <li>Hủy phòng linh hoạt.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MagazinePage;
