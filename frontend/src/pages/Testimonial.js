import React from "react";

// 🎨 Dữ liệu testimonial
const testimonials = [
  {
    name: "John Doe",
    img: "https://media.istockphoto.com/id/2073254261/photo/an-adult-man-is-using-his-smartphone.jpg?b=1&s=612x612&w=0&k=20&c=WqE36908Y0tOVPpa5mea8dAGkm7v3CojRWcsXUGHxZk=",
    text: "Dịch vụ tại khách sạn tuyệt vời, không gian ấm cúng và nhân viên thân thiện khiến kỳ nghỉ của tôi thật đáng nhớ.",
    rating: 5
  },
  {
    name: "Văn Hậu",
    img: "https://images.pexels.com/photos/1339536/pexels-photo-1339536.jpeg?cs=srgb&dl=pexels-baphi-1339536.jpg&fm=jpg",
    text: "Phòng ốc sạch sẽ, tiện nghi hiện đại, mọi thứ đều hoàn hảo cho kỳ nghỉ thư giãn của gia đình tôi.",
    rating: 5
  },
  {
    name: "Toàn Nguyễn",
    img: "https://pepsilan.com/wp-content/uploads/2022/12/full-bo-anh-dan-ong-trung-nien-viet-nam-dep-nhat-vn-34.jpg",
    text: "Trải nghiệm tuyệt vời! Tôi chắc chắn sẽ quay lại và giới thiệu cho bạn bè.",
    rating: 4
  }
];

// 🎨 Màu sắc & Style
const ROYAL_COLOR = "#f3c300";
const DARK_BG = "#0f172a";
const TEXT_COLOR = "#333";
const SECONDARY_TEXT = "#6c757d";

const styles = {
  section: {
    padding: '80px 0',
    backgroundColor: '#f9f9ff',
    fontFamily: 'serif',
  },
  container: {
    maxWidth: '1170px',
    margin: '0 auto',
    padding: '0 15px',
  },
  titleContainer: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: DARK_BG,
    marginBottom: '10px',
  },
  subtext: {
    fontSize: '1rem',
    color: SECONDARY_TEXT,
  },
  slider: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '30px',
    flexWrap: 'wrap', // Cho responsive xuống dòng trên mobile
  },
  itemCard: {
    flex: '1 1 30%', // Mỗi testimonial chiếm ~1/3
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '250px',
    boxSizing: 'border-box',
  },
  image: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '15px',
    border: `3px solid ${ROYAL_COLOR}`,
  },
  text: {
    fontSize: '0.95rem',
    lineHeight: 1.6,
    color: TEXT_COLOR,
    marginBottom: '15px',
  },
  name: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: DARK_BG,
    textDecoration: 'none',
    marginBottom: '5px',
  },
  star: {
    color: ROYAL_COLOR,
    fontSize: '1.1rem',
  }
};

// 🎨 Hàm hiển thị số sao (Unicode/Emoji)
const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={i} style={{marginRight: '3px'}}>★</span>);
  }
  if (halfStar) {
    stars.push(<span key="half" style={{marginRight: '3px'}}>★</span>);
  }
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} style={{marginRight: '3px', opacity: 0.5}}>☆</span>);
  }
  return stars;
};

const Testimonial = () => {
  return (
    <section style={styles.section} className="testimonial_area section_gap">
      <div style={styles.container}>
        <div style={styles.titleContainer}>
          <h2 style={styles.heading}>Đánh Giá Từ Khách Hàng</h2>
          <p style={styles.subtext}>Khách hàng của chúng tôi luôn có những trải nghiệm đáng nhớ tại khách sạn.</p>
        </div>
        
        <div style={styles.slider} className="testimonial_slider">
          {testimonials.map((item, index) => (
            <div style={styles.itemCard} key={index} className="media testimonial_item">
              <img style={styles.image} src={item.img} alt={item.name} className="rounded-circle" />
              <div style={{width: '100%'}} className="media-body">
                <p style={styles.text}>{item.text}</p>
                <h4 style={styles.name} className="sec_h4">{item.name}</h4>
                <div style={styles.star} className="star">{renderStars(item.rating)}</div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default Testimonial;
