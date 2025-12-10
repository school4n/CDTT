import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import HotelDetail from './pages/HotelDetail';
import HotelList from './pages/HotelList';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import UserBookings from './pages/UserBookings';
import AboutHistory from './pages/AboutHistory';
import Testimonial from './pages/Testimonial';
import Footer from './components/Footer';

// Admin Components
import AdminLogin from './admin/AdminLogin';
import AdminSidebar from './admin/AdminSidebar'; 
import Dashboard from './admin/Dashboard';
import NewBookings from './admin/NewBookings';
import PaymentConfirmation from './admin/PaymentConfirmation';
import BookingHistory from './admin/BookingHistory';
import AdminUserManagement from './admin/AdminUserManagement';
import RoomManager from './admin/RoomManager';
import FacilitiesManager from './admin/FacilitiesManager';
import AdminReview from './admin/AdminReview';
// Thêm component giả định cho Admin Dashboard và Room Management
const AdminDashboard = () => <div>Trang Thống Kê</div>;
const AdminRoomList = () => <div>Quản Lý Phòng</div>; 
const AdminBookingPayment = () => <div>Xác Nhận Thanh Toán</div>;


// =========================================================
// 1. TẠO ADMIN LAYOUT: Xử lý logic Sidebar + Content
// =========================================================
const AdminRootLayout = () => {
    // 🚨 Áp dụng logic layout từ câu trả lời trước
    const SIDEBAR_WIDTH = '250px';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Sidebar chỉ hiển thị nếu KHÔNG phải trang login */}
            {useLocation().pathname !== '/admin/login' && <AdminSidebar />}
            
            <div style={{ 
                // Đẩy nội dung ra ngoài trừ trang login
                marginLeft: useLocation().pathname !== '/admin/login' ? SIDEBAR_WIDTH : '0', 
                flexGrow: 1, 
                padding: '20px'
            }}>
                {/* 🚨 Outlet sẽ render các component trang Admin (Dashboard, Rooms, Payment...) */}
                <Outlet /> 
            </div>
        </div>
    );
}

// =========================================================
// 2. TẠO USER LAYOUT: Chứa Navbar, Footer và Outlet
// =========================================================
const UserRootLayout = () => {
    const location = useLocation();

    return (
        <>
            <Navbar />
            
            {/* 🚨 Outlet sẽ render các component trang người dùng */}
            <Outlet /> 

            {/* Khắc phục lỗi: Chỉ render các component bổ sung nếu đang ở trang chủ */}
            {location.pathname === '/' && (
                <>
                    <AboutHistory />
                    <Testimonial />
                </>
            )}
            
            <Footer />
        </>
    )
}

// =========================================================
// 3. TÁI CẤU TRÚC APP: Định nghĩa tất cả Routes tại đây
// =========================================================
function App() {
  return (
    <Router>
      <Routes>
        
        {/* ============ USER ROUTES (Sử dụng UserRootLayout) ============ */}
        <Route element={<UserRootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<HotelList />} />
            <Route path="/rooms/:id" element={<HotelDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/bookings" element={<UserBookings />} />
            <Route path="/about" element={<AboutHistory />} />
            {/* Nếu AboutHistory và Testimonial là trang riêng, đặt chúng ở đây */}
            {/* <Route path="/about" element={<AboutHistory />} /> */}
            {/* <Route path="/reviews" element={<Testimonial />} /> */}
        </Route>

        {/* ============ ADMIN ROUTES (Sử dụng AdminRootLayout) ============ */}
        <Route path="/admin" element={<AdminRootLayout />}>
            {/* Trang Login không có Sidebar */}
            <Route path="login" element={<AdminLogin />} /> 

            {/* Trang chính của Admin (có Sidebar) */}
            <Route path="dashboard" element={<Dashboard />} /> 
            <Route path="bookings/new" element={<NewBookings />} />
            <Route path="bookings/payment" element={<PaymentConfirmation />} />
            <Route path="bookings/history" element={<BookingHistory />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="rooms" element={<RoomManager />} />
            <Route path="facilities" element={<FacilitiesManager />} />
            <Route path="reviews" element={<AdminReview />} />
            {/* Thêm các route admin khác... */}

            {/* Đặt đường dẫn mặc định cho /admin (ví dụ: chuyển hướng đến dashboard) */}
            <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;