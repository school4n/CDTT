import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';

// --- USER COMPONENTS ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import HotelDetail from './pages/HotelDetail';
import HotelList from './pages/HotelList';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import UserBookings from './pages/UserBookings';
import AboutHistory from './pages/AboutHistory';
import Testimonial from './pages/Testimonial';
import MagazinePage from './pages/MagazinePage.js';

// --- ADMIN COMPONENTS ---
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout'; // 👈 IMPORT FILE LAYOUT ĐÃ FIX
import Dashboard from './admin/Dashboard';
import NewBookings from './admin/NewBookings';
import PaymentConfirmation from './admin/PaymentConfirmation';
import BookingHistory from './admin/BookingHistory';
import AdminUserManagement from './admin/AdminUserManagement';
import RoomManager from './admin/RoomManager';
import FacilitiesManager from './admin/FacilitiesManager';
import AdminReview from './admin/AdminReview';


// =========================================================
// 1. ADMIN LAYOUT WRAPPER
// Nhiệm vụ: Bọc các trang con (Outlet) vào trong khung AdminLayout
// =========================================================
const AdminLayoutWrapper = () => {
    return (
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    );
};

// =========================================================
// 2. USER LAYOUT
// =========================================================
const UserRootLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <>
            <Navbar />
            
            {/* Nội dung thay đổi của trang */}
            <div style={{minHeight: '60vh'}}>
                <Outlet />
            </div>

            {/* Chỉ hiện phần Giới thiệu & Review ở trang chủ */}
            {isHomePage && (
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
// 3. MAIN APP ROUTER
// =========================================================
function App() {
  return (
    <Router>
      <Routes>
        
        {/* ============ USER ROUTES ============ */}
        <Route element={<UserRootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<HotelList />} />
            <Route path="/rooms/:id" element={<HotelDetail />} />
            <Route path="/hotels/:id" element={<HotelDetail />} /> {/* Dự phòng link cũ */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/bookings" element={<UserBookings />} />
            <Route path="/about" element={<AboutHistory />} />
            <Route path="/welcome" element={<MagazinePage />} />
        </Route>

        {/* ============ ADMIN ROUTES ============ */}
        
        {/* 1. Trang Login (Nằm RIÊNG, không có Sidebar) */}
        <Route path="/admin/login" element={<AdminLogin />} /> 

        {/* 2. Các trang Quản trị (Được bọc bởi AdminLayout) */}
        <Route path="/admin" element={<AdminLayoutWrapper />}>
            
            {/* Nếu vào /admin thì tự động chuyển hướng đến dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} /> 
            <Route path="bookings/new" element={<NewBookings />} />
            <Route path="bookings/payment" element={<PaymentConfirmation />} />
            <Route path="bookings/history" element={<BookingHistory />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="rooms" element={<RoomManager />} />
            <Route path="facilities" element={<FacilitiesManager />} />
            <Route path="reviews" element={<AdminReview />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<div style={{padding: 50, textAlign: 'center'}}>404 - Trang không tồn tại</div>} />
      </Routes>
    </Router>
  );
}

export default App;
