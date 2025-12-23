const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const app = express();
app.use(cors());
app.use(express.json());

// ==========================
// Cấu hình CSDL TiDB Cloud
// ==========================
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', // Lấy từ HOST
    port: process.env.DB_PORT || 4000,                                             // Lấy từ PORT
    user: process.env.DB_USER || '3qhZS3hkjF2gDVy.root',                           // Lấy từ USERNAME
    password: process.env.DB_PASS || 'ZVPPWHnjwITbQw1P',                      // Mật khẩu khi nhấn Generate
    database: process.env.DB_NAME || 'khachsan',                                   // Lấy từ DATABASE
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true // TiDB Cloud yêu cầu SSL an toàn
    }
});

db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối TiDB Cloud:', err);
        return;
    }
    console.log('Đã kết nối thành công đến TiDB Cloud (khachsan)!');
});

// ==========================
// Cấu hình JWT & Middleware Xác thực
// ==========================
const JWT_SECRET = process.env.JWT_SECRET || "your_new_secret_for_rooms";
const SALT_ROUNDS = 10;

// Middleware xác thực Token Người dùng (user_cred)
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Không có token" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return res.status(401).json({ message: "Token sai định dạng" });

    const token = parts[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token không hợp lệ" });
        req.userId = decoded.id; // ID người dùng
        req.user = decoded;
        next();
    });
}

// Middleware MỚI: Xác thực Token Admin (admin_cred)
function verifyAdminToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Không có token Admin" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return res.status(401).json({ message: "Token Admin sai định dạng" });
    
    const token = parts[1];
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token không hợp lệ hoặc hết hạn" });
        
        req.adminId = decoded.id; // Lấy ID của Admin

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền truy cập Admin." });
        }
        
        db.query("SELECT id FROM admin_cred WHERE id = ?", [decoded.id], (err2, rows) => {
            if (err2 || rows.length === 0) {
                return res.status(403).json({ message: "Bạn không có quyền truy cập Admin." });
            }
            next();
        });
    });
}





/* ==========================================================
   I. USER AUTH ENDPOINTS (user_cred)
========================================================== */
app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Thiếu username hoặc password" });
        
        const emailToCheck = email || null; 
        
        const checkQuery = `
            SELECT u.id 
            FROM user_cred u 
            LEFT JOIN user_info i ON u.id = i.user_id 
            WHERE u.username = ? 
            ${emailToCheck ? 'OR i.email = ?' : ''}
        `;
        
        const params = [username];
        if (emailToCheck) {
            params.push(emailToCheck);
        }

        db.query(checkQuery, params, async (err, rows) => {
            if (err) return res.status(500).json({ message: "DB error", error: err });
            if (rows.length > 0) return res.status(409).json({ message: "Username hoặc email đã tồn tại" });

            const hash = await bcrypt.hash(password, SALT_ROUNDS);
            db.query("INSERT INTO user_cred (username, password) VALUES (?, ?)", [username, hash], (err2, result) => {
                if (err2) return res.status(500).json({ message: "DB error on user_cred insert", error: err2 });
                const userId = result.insertId;
                
                db.query("INSERT INTO user_info (user_id, email) VALUES (?, ?)", [userId, emailToCheck], (err3) => {
                    if (err3) console.warn("Không chèn được vào user_info:", err3);
                    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
                    res.json({ message: "Đăng ký thành công", token, userId, username });
                });
            });
        });
    } catch (e) { res.status(500).json({ message: "Lỗi server" }); }
});

app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Thiếu username hoặc password" });

    // 1. CẬP NHẬT SQL: Thêm `c.status` vào SELECT để lấy dữ liệu trạng thái
    // Lưu ý: Giả sử cột 'status' nằm trong bảng 'user_cred' (c). 
    // Nếu nó nằm ở bảng 'user_info' thì sửa thành 'i.status'.
    const query = "SELECT c.id, c.username, c.password, c.status, i.email FROM user_cred c LEFT JOIN user_info i ON c.id = i.user_id WHERE c.username = ?";

    db.query(query, [username], async (err, rows) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        if (rows.length === 0) return res.status(401).json({ message: "Sai username hoặc password" });

        const user = rows[0];

        // So sánh mật khẩu
        bcrypt.compare(password, user.password).then(match => {
            if (!match) return res.status(401).json({ message: "Sai username hoặc password" });

            // 2. KIỂM TRA STATUS
            // Nếu status KHÁC 'active' (ví dụ: 'inactive', 'banned', null...) thì chặn lại
            if (user.status !== 'active') {
                return res.status(403).json({ 
                    message: "Tài khoản chưa được kích hoạt hoặc đã bị khóa.",
                    status: user.status // Trả về status để Frontend biết nếu cần
                });
            }

            // 3. NẾU ACTIVE -> TẠO TOKEN VÀ CHO ĐĂNG NHẬP
            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
            
            res.json({ 
                message: "Đăng nhập thành công", 
                token, 
                userId: user.id, 
                username: user.username, 
                email: user.email,
                status: user.status // Trả về 'active'
            });
        });
    });
});


/* ==========================================================
   V. ADMIN AUTH ENDPOINTS (admin_cred)
========================================================== */

// 1. POST /api/admin/auth/register (Đăng ký Admin)
app.post("/api/admin/auth/register", async (req, res) => {
    try {
        const { username, password, full_name } = req.body;
        if (!username || !password) 
            return res.status(400).json({ message: "Thiếu username hoặc password" });

        db.query("SELECT id FROM admin_cred WHERE username = ?", [username], async (err, rows) => {
            if (err) return res.status(500).json({ message: "DB error", error: err });
            if (rows.length > 0) 
                return res.status(409).json({ message: "Username Admin đã tồn tại" });

            const hash = await bcrypt.hash(password, SALT_ROUNDS);
            
            // Chèn vào bảng admin_cred
            db.query("INSERT INTO admin_cred (username, password, full_name) VALUES (?, ?, ?)", 
                [username, hash, full_name || 'Admin'], 
                (err2, result) => {
                    if (err2) return res.status(500).json({ message: "DB error on admin_cred insert", error: err2 });
                    
                    const adminId = result.insertId;
                    const token = jwt.sign({ id: adminId, role: 'admin' }, JWT_SECRET, { expiresIn: "7d" });
                    
                    res.status(201).json({ 
                        message: "Đăng ký Admin thành công", 
                        token, 
                        adminId, 
                        username 
                    });
                }
            );
        });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ message: "Lỗi server" }); 
    }
});


// 2. POST /api/admin/auth/login (Đăng nhập Admin)
app.post("/api/admin/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) 
        return res.status(400).json({ message: "Thiếu username hoặc password" });

    db.query("SELECT id, username, password FROM admin_cred WHERE username = ?", [username], async (err, rows) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        if (rows.length === 0) 
            return res.status(401).json({ message: "Sai username hoặc password Admin" });

        const adminUser = rows[0];
        bcrypt.compare(password, adminUser.password).then(match => {
            if (!match) 
                return res.status(401).json({ message: "Sai username hoặc password Admin" });

            const token = jwt.sign({ id: adminUser.id, role: 'admin' }, JWT_SECRET, { expiresIn: "7d" });
            
            res.json({ 
                message: "Đăng nhập Admin thành công", 
                token, 
                adminId: adminUser.id, 
                username: adminUser.username 
            });
        });
    });
});


/* ==========================================================
   II. ROOMS ENDPOINTS (CRUD PHÒNG)
========================================================== */

// GET /api/rooms (Read All - Chỉ lấy phòng còn trống tại thời điểm hiện tại)
app.get("/api/rooms", (req, res) => {
    // Lấy ngày hiện tại định dạng YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const sql = `
        SELECT r.*, GROUP_CONCAT(rf.facility_id) AS facility_ids
        FROM rooms r
        LEFT JOIN room_facilities rf ON r.id = rf.room_id
        
        -- Kỹ thuật loại trừ phòng đang bận ngay hôm nay
        LEFT JOIN (
            SELECT DISTINCT b.room_id
            FROM booking_order b
            JOIN booking_details d ON b.id = d.booking_id
            WHERE 
                b.order_status IN ('confirmed', 'checked_in') 
                AND (DATE(?) BETWEEN DATE(d.check_in_date) AND DATE_SUB(DATE(d.check_out_date), INTERVAL 1 DAY))
        ) AS busy ON r.id = busy.room_id

        WHERE 
            r.status IN ('active', 'available') -- Chỉ lấy phòng đang hoạt động
            AND busy.room_id IS NULL             -- Phòng KHÔNG nằm trong danh sách bận
            
        GROUP BY r.id
        ORDER BY r.price_per_night ASC
    `;

    db.query(sql, [today], (err, rows) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        res.json(rows);
    });
});

// GET /api/rooms/search
// Phiên bản "Siêu Cứng": Ép kiểu ngày tháng và in log chi tiết
app.get("/api/rooms/search", (req, res) => {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
        return res.status(400).json({ message: "Vui lòng chọn ngày Check-in và Check-out" });
    }

    console.log(`\n🔍 --- DEBUG SEARCH ---`);
    console.log(`📅 Khách tìm: ${checkIn} -> ${checkOut}`);

    // LOGIC: Tìm ID các phòng đang bận, sau đó loại trừ ra.
    // Sử dụng DATE() để cắt bỏ giờ phút giây, chỉ so sánh ngày.
    
    const sql = `
        SELECT r.*, GROUP_CONCAT(rf.facility_id) AS facility_ids
        FROM rooms r
        LEFT JOIN room_facilities rf ON r.id = rf.room_id
        
        -- KỸ THUẬT ANTI-JOIN
        LEFT JOIN (
            SELECT DISTINCT b.room_id
            FROM booking_order b
            JOIN booking_details d ON b.id = d.booking_id
            WHERE 
                -- 1. CHẶN MỌI TRẠNG THÁI (Dùng TRIM và LOWER để tránh lỗi chính tả trong DB)
                TRIM(LOWER(b.order_status)) IN ('confirmed', 'checked_in', 'paid', 'success', 'booked', 'pending', 'waiting') 
            AND (
                -- 2. SO SÁNH NGÀY (Ép kiểu DATE để chính xác tuyệt đối)
                (DATE(d.check_in_date) < DATE(?) AND DATE(d.check_out_date) > DATE(?))
            )
        ) AS busy ON r.id = busy.room_id

        WHERE 
            r.status IN ('active', 'available', 'booked') 
            AND busy.room_id IS NULL -- Chỉ lấy phòng KHÔNG nằm trong danh sách bận
        
        GROUP BY r.id
        ORDER BY r.price_per_night ASC
    `;

    // In câu lệnh SQL ra để kiểm tra nếu cần (Optional)
    // console.log("SQL Query:", sql); 

    db.query(sql, [checkOut, checkIn], (err, rows) => {
        if (err) {
            console.error("❌ Lỗi Backend:", err);
            return res.status(500).json({ message: "Lỗi Server", error: err });
        }
        
        console.log(`✅ Kết quả: Tìm thấy ${rows.length} phòng trống.`);
        // In danh sách ID phòng tìm được để bạn đối chiếu
        const foundIds = rows.map(r => r.id);
        console.log(`📋 Danh sách ID phòng hiển thị: [${foundIds.join(", ")}]`);

        // Kiểm tra xem phòng bạn vừa đặt (ví dụ ID 47) có nằm trong này không
        // Nếu có -> Lỗi. Nếu không -> Code chạy đúng.
        
        res.json({
            message: "Thành công",
            count: rows.length,
            data: rows
        });
    });
});

















// GET /api/rooms/:id (Lấy chi tiết phòng - Đã sửa lỗi thiếu tiện nghi)
app.get("/api/rooms/:id", (req, res) => {
    const roomId = req.params.id;

    // 1. Lấy thông tin cơ bản của phòng
    const sqlRoom = "SELECT * FROM rooms WHERE id = ?";
    
    // 2. Lấy danh sách ảnh
    const sqlImages = "SELECT image_url, is_thumbnail FROM room_images WHERE room_id = ?";
    
    // 3. Lấy danh sách Tiện nghi (Facilities) - Truy vấn riêng biệt để không bị mất dữ liệu
    const sqlFacilities = `
        SELECT f.name 
        FROM facilities f 
        JOIN room_facilities rf ON f.id = rf.facility_id 
        WHERE rf.room_id = ?
    `;

    // 4. Lấy danh sách Đặc điểm (Features) - Truy vấn riêng biệt
    const sqlFeatures = `
        SELECT f.name 
        FROM features f 
        JOIN room_features rf ON f.id = rf.feature_id 
        WHERE rf.room_id = ?
    `;

    db.query(sqlRoom, [roomId], (err, roomRows) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        if (roomRows.length === 0) return res.status(404).json({ message: "Không tìm thấy phòng" });

        const room = roomRows[0];

        // Chạy song song 3 truy vấn phụ (Ảnh, Tiện nghi, Đặc điểm)
        Promise.all([
            new Promise((resolve) => db.query(sqlImages, [roomId], (e, r) => resolve(r || []))),
            new Promise((resolve) => db.query(sqlFacilities, [roomId], (e, r) => resolve(r || []))),
            new Promise((resolve) => db.query(sqlFeatures, [roomId], (e, r) => resolve(r || [])))
        ])
        .then(([images, facilities, features]) => {
            
            // Backend tự nối mảng thành chuỗi "Wifi, Tivi, ..." để Frontend không cần sửa code cũ
            // Đảm bảo lấy đủ tất cả các dòng tìm được
            const facilitiesStr = facilities.map(item => item.name).join(', ');
            const featuresStr = features.map(item => item.name).join(', ');

            res.json({
                ...room,
                gallery: images,
                facilities: facilitiesStr, // Trả về chuỗi đầy đủ
                features: featuresStr      // Trả về chuỗi đầy đủ
            });
        })
        .catch(error => {
            console.error("Lỗi lấy chi tiết:", error);
            res.status(500).json({ message: "Lỗi server khi lấy chi tiết phòng" });
        });
    });
});

// GET /api/admin/rooms (Lấy danh sách phòng + tìm kiếm)
app.get("/api/admin/rooms", verifyAdminToken, (req, res) => {
    try {
        const keyword = req.query.search ? req.query.search.trim() : "";

        // Nếu không có từ khóa → trả về tất cả phòng
        const sql = `
            SELECT * 
            FROM rooms 
            ${keyword ? "WHERE name LIKE ?" : ""}
            ORDER BY id DESC
        `;

        const params = keyword ? [`%${keyword}%`] : [];

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error("DB ERROR:", err);
                return res.status(500).json({ message: "Lỗi database", error: err });
            }

            return res.json({
                success: true,
                total: results.length,
                data: results
            });
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ message: "Lỗi server", error });
    }
});


// POST /api/admin/rooms (Create New Room - Xử lý nhiều bảng)
app.post("/api/admin/rooms", verifyAdminToken, (req, res) => {
    const { name, description, price_per_night, area, max_guests, status, main_image_url, facility_ids, feature_ids, gallery_images } = req.body;

    if (!name || !price_per_night) return res.status(400).json({ message: "Thiếu thông tin cơ bản" });

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: "Lỗi DB transaction" });

        // 1. Chèn bảng Rooms
        const sqlRoom = "INSERT INTO rooms (name, description, price_per_night, area, max_guests, main_image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(sqlRoom, [name, description, price_per_night, area, max_guests, main_image_url, status], (errRoom, result) => {
            if (errRoom) return db.rollback(() => res.status(500).json({ message: "Lỗi thêm phòng", error: errRoom }));
            const roomId = result.insertId;

            const promises = [];

            // 2. Chèn Tiện nghi
            if (facility_ids && facility_ids.length > 0) {
                const values = facility_ids.map(id => [roomId, id]);
                promises.push(new Promise((resolve, reject) => {
                    db.query("INSERT INTO room_facilities (room_id, facility_id) VALUES ?", [values], err => err ? reject(err) : resolve());
                }));
            }

            // 3. Chèn Đặc điểm
            if (feature_ids && feature_ids.length > 0) {
                const values = feature_ids.map(id => [roomId, id]);
                promises.push(new Promise((resolve, reject) => {
                    db.query("INSERT INTO room_features (room_id, feature_id) VALUES ?", [values], err => err ? reject(err) : resolve());
                }));
            }

            // 4. Chèn Ảnh phụ (Gallery) - Nhận mảng tên file ["a.jpg", "b.jpg"]
            if (gallery_images && gallery_images.length > 0) {
                const values = gallery_images.map(imgName => [roomId, imgName, 0]);
                promises.push(new Promise((resolve, reject) => {
                    db.query("INSERT INTO room_images (room_id, image_url, is_thumbnail) VALUES ?", [values], err => err ? reject(err) : resolve());
                }));
            }

            Promise.all(promises)
                .then(() => {
                    db.commit(errCommit => {
                        if (errCommit) return db.rollback(() => res.status(500).json({ message: "Lỗi commit" }));
                        res.status(201).json({ message: "Thêm thành công", roomId });
                    });
                })
                .catch(errP => {
                    db.rollback(() => res.status(500).json({ message: "Lỗi lưu chi tiết", error: errP.message }));
                });
        });
    });
});

// PUT: Sửa phòng (Nhận JSON thuần)
app.put("/api/admin/rooms/:id", verifyAdminToken, (req, res) => {
    const roomId = req.params.id;
    const { name, description, price_per_night, area, max_guests, status, main_image_url, facility_ids, feature_ids, gallery_images } = req.body;

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: "Lỗi DB transaction" });

        const sqlUpdate = "UPDATE rooms SET name=?, description=?, price_per_night=?, area=?, max_guests=?, status=?, main_image_url=? WHERE id=?";
        db.query(sqlUpdate, [name, description, price_per_night, area, max_guests, status, main_image_url, roomId], (errUpd, result) => {
            if (errUpd) return db.rollback(() => res.status(500).json({ message: "Lỗi update", error: errUpd }));

            const promises = [];

            // Xóa cũ -> Thêm mới (Facilities)
            promises.push(new Promise((resolve, reject) => {
                db.query("DELETE FROM room_facilities WHERE room_id=?", [roomId], (errDel) => {
                    if (errDel) return reject(errDel);
                    if (facility_ids && facility_ids.length > 0) {
                        const values = facility_ids.map(id => [roomId, id]);
                        db.query("INSERT INTO room_facilities (room_id, facility_id) VALUES ?", [values], err => err ? reject(err) : resolve());
                    } else resolve();
                });
            }));

            // Xóa cũ -> Thêm mới (Features)
            promises.push(new Promise((resolve, reject) => {
                db.query("DELETE FROM room_features WHERE room_id=?", [roomId], (errDel) => {
                    if (errDel) return reject(errDel);
                    if (feature_ids && feature_ids.length > 0) {
                        const values = feature_ids.map(id => [roomId, id]);
                        db.query("INSERT INTO room_features (room_id, feature_id) VALUES ?", [values], err => err ? reject(err) : resolve());
                    } else resolve();
                });
            }));

            // Xóa cũ -> Thêm mới (Gallery)
            // Lưu ý: Ở đây ta xóa hết ảnh cũ và thêm lại danh sách mới client gửi lên
            promises.push(new Promise((resolve, reject) => {
                db.query("DELETE FROM room_images WHERE room_id=?", [roomId], (errDel) => {
                    if (errDel) return reject(errDel);
                    if (gallery_images && gallery_images.length > 0) {
                        const values = gallery_images.map(imgName => [roomId, imgName, 0]);
                        db.query("INSERT INTO room_images (room_id, image_url, is_thumbnail) VALUES ?", [values], err => err ? reject(err) : resolve());
                    } else resolve();
                });
            }));

            Promise.all(promises)
                .then(() => {
                    db.commit(errCommit => {
                        if (errCommit) return db.rollback(() => res.status(500).json({ message: "Lỗi commit" }));
                        res.json({ message: "Cập nhật thành công" });
                    });
                })
                .catch(errP => {
                    db.rollback(() => res.status(500).json({ message: "Lỗi cập nhật chi tiết", error: errP.message }));
                });
        });
    });
});

// DELETE /api/admin/rooms/:id (Delete Room)
app.delete("/api/admin/rooms/:id", verifyAdminToken, (req, res) => { 
    const roomId = req.params.id;
    db.query("DELETE FROM rooms WHERE id = ?", [roomId], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi DB khi xóa", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy phòng" });
        res.json({ message: "Xóa phòng thành công" });
    });
});

/* ==========================================================
   III. CART ENDPOINTS (Đơn đặt đang chờ: booking_order + 'pending')
========================================================== */

// GET /api/cart (Lấy đơn đặt đang chờ - KHÔNG LẤY NGÀY THÁNG)
app.get("/api/cart", verifyToken, (req, res) => {
    const userId = req.userId;
    const sql = `
        SELECT 
            b.id AS cart_id, b.quantity,
            r.id AS room_id, r.name, r.main_image_url AS image, r.price_per_night AS price
        FROM booking_order b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.user_id = ? AND b.order_status = 'pending'
        ORDER BY b.created_at DESC
    `;
    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        res.json(rows);
    });
});


// POST /api/cart (Tạo đơn chờ & Đổi trạng thái phòng sang 'booked')
app.post("/api/cart", verifyToken, (req, res) => {
    const userId = req.userId;
    const { room_id, quantity } = req.body;

    if (!room_id || !quantity) return res.status(400).json({ message: "Thiếu room_id hoặc quantity" });

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: "Lỗi khởi tạo giao dịch" });

        // BƯỚC 1: Kiểm tra xem User này có đơn 'pending' cũ nào không?
        // Nếu có, phải trả phòng đó về trạng thái 'available' trước khi xóa đơn.
        const sqlFindOld = "SELECT room_id FROM booking_order WHERE user_id = ? AND order_status = 'pending'";
        db.query(sqlFindOld, [userId], (errFind, oldOrders) => {
            if (errFind) return db.rollback(() => res.status(500).json({ message: "Lỗi tìm đơn cũ" }));

            const clearOldOrderPromise = new Promise((resolve, reject) => {
                if (oldOrders.length > 0) {
                    const oldRoomId = oldOrders[0].room_id;
                    // 1.1 Trả phòng cũ về 'available'
                    db.query("UPDATE rooms SET status = 'available' WHERE id = ?", [oldRoomId], (errUpdateOld) => {
                        if (errUpdateOld) return reject(errUpdateOld);
                        // 1.2 Xóa đơn cũ
                        db.query("DELETE FROM booking_order WHERE user_id = ? AND order_status = 'pending'", [userId], (errDel) => {
                            if (errDel) return reject(errDel);
                            resolve();
                        });
                    });
                } else {
                    resolve(); // Không có đơn cũ, đi tiếp
                }
            });

            clearOldOrderPromise
                .then(() => {
                    // BƯỚC 2: Cập nhật phòng MỚI sang 'booked'
                    // Điều kiện: Phòng phải đang 'available' mới cho đặt
                    const sqlBookRoom = "UPDATE rooms SET status = 'booked' WHERE id = ? AND status = 'available'";
                    db.query(sqlBookRoom, [room_id], (errBook, resultBook) => {
                        if (errBook) return db.rollback(() => res.status(500).json({ message: "Lỗi cập nhật trạng thái phòng" }));
                        
                        // Nếu affectedRows = 0 nghĩa là phòng không 'available' (đã bị đặt hoặc bảo trì)
                        if (resultBook.affectedRows === 0) {
                            return db.rollback(() => res.status(400).json({ message: "Phòng này không khả dụng hoặc đã được người khác giữ chỗ." }));
                        }

                        // BƯỚC 3: Tạo đơn đặt phòng mới
                        const sqlInsert = `INSERT INTO booking_order (user_id, room_id, quantity, order_status, created_at) VALUES (?, ?, ?, 'pending', NOW())`;
                        db.query(sqlInsert, [userId, room_id, quantity], (errIns, resultIns) => {
                            if (errIns) return db.rollback(() => res.status(500).json({ message: "Lỗi tạo đơn mới", error: errIns }));

                            // BƯỚC 4: Commit giao dịch
                            db.commit((errCommit) => {
                                if (errCommit) return db.rollback(() => res.status(500).json({ message: "Lỗi commit" }));
                                res.json({ message: "Đã thêm vào giỏ & giữ chỗ phòng", cartId: resultIns.insertId });
                            });
                        });
                    });
                })
                .catch(err => {
                    db.rollback(() => res.status(500).json({ message: "Lỗi xử lý đơn cũ", error: err }));
                });
        });
    });
});
// DELETE /api/cart/:id (Xóa đơn chờ & Trả trạng thái phòng về 'available')
app.delete("/api/cart/:id", verifyToken, (req, res) => {
    const userId = req.userId;
    const cartId = req.params.id;

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: "Lỗi khởi tạo giao dịch" });

        // BƯỚC 1: Lấy thông tin đơn hàng để biết room_id nào cần nhả ra
        const sqlGetOrder = "SELECT room_id FROM booking_order WHERE id = ? AND user_id = ? AND order_status = 'pending'";
        db.query(sqlGetOrder, [cartId, userId], (errGet, orders) => {
            if (errGet) return db.rollback(() => res.status(500).json({ message: "Lỗi truy vấn đơn hàng" }));
            
            if (orders.length === 0) {
                return db.rollback(() => res.status(404).json({ message: "Không tìm thấy đơn đặt hàng" }));
            }

            const roomIdToRelease = orders[0].room_id;

            // BƯỚC 2: Trả phòng về trạng thái 'available'
            const sqlReleaseRoom = "UPDATE rooms SET status = 'available' WHERE id = ?";
            db.query(sqlReleaseRoom, [roomIdToRelease], (errRelease) => {
                if (errRelease) return db.rollback(() => res.status(500).json({ message: "Lỗi cập nhật trạng thái phòng" }));

                // BƯỚC 3: Xóa đơn hàng
                const sqlDelete = "DELETE FROM booking_order WHERE id = ?";
                db.query(sqlDelete, [cartId], (errDel) => {
                    if (errDel) return db.rollback(() => res.status(500).json({ message: "Lỗi xóa đơn hàng" }));

                    // BƯỚC 4: Commit
                    db.commit((errCommit) => {
                        if (errCommit) return db.rollback(() => res.status(500).json({ message: "Lỗi commit" }));
                        res.json({ message: "Đã xóa đơn và phòng đã sẵn sàng trở lại" });
                    });
                });
            });
        });
    });
});

/* ==========================================================
   IV. PAYMENTS/BOOKINGS ENDPOINTS
========================================================== */

// POST /api/payments (Hoàn tất thanh toán, cập nhật trạng thái và chi tiết - CHÈN NGÀY THÁNG VÀ KIỂM TRA TRÙNG LẶP)
app.post("/api/payments", verifyToken, (req, res) => {
    const userId = req.userId;
    // BẮT BUỘC có checkIn và checkOut
    const { checkIn, checkOut, name, address, phone, method, cccd, totalPrice } = req.body; 
    
    // Kiểm tra đầu vào
    if (!checkIn || !checkOut || !name || !cccd || totalPrice == null) 
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc (Ngày thuê, Tên, CCCD, Tổng tiền)." });

    // Kiểm tra Ngày thuê hợp lệ
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
         return res.status(400).json({ message: "Ngày check-out phải sau ngày check-in." });
    }

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: "DB error starting transaction" });

        // 1. LẤY ĐƠN ĐẶT PENDING ĐẦU TIÊN (Phải lấy thêm room_id)
        const sqlSelectOrder = `
            SELECT id, room_id
            FROM booking_order 
            WHERE user_id = ? AND order_status = 'pending' LIMIT 1
        `;
        db.query(sqlSelectOrder, [userId], (errOrder, orderItems) => {
            if (errOrder) return db.rollback(() => res.status(500).json({ message: "DB error on order select", error: errOrder }));
            if (orderItems.length === 0) return db.rollback(() => res.status(400).json({ message: "Không tìm thấy đơn đặt đang chờ. Vui lòng thêm phòng vào giỏ hàng." }));

            const bookingId = orderItems[0].id; 
            const roomId = orderItems[0].room_id; 

            // =========================================================
            //  ✅ BƯỚC MỚI: KIỂM TRA TRÙNG NGÀY ĐẶT (QUAN TRỌNG NHẤT)
            // =========================================================
            const sqlCheckOverlap = `
                SELECT 
                    d.booking_id
                FROM booking_details d
                JOIN booking_order b ON d.booking_id = b.id
                WHERE b.room_id = ?
                AND b.order_status IN ('confirmed', 'checked_in')
                AND (
                    (d.check_in_date < ? AND d.check_out_date > ?) OR
                    (? BETWEEN d.check_in_date AND DATE_SUB(d.check_out_date, INTERVAL 1 DAY)) OR
                    (? BETWEEN d.check_in_date AND DATE_SUB(d.check_out_date, INTERVAL 1 DAY)) 
                )
                LIMIT 1
            `;

            // Tham số: [roomId, checkOut, checkIn, checkIn, checkOut]
            const checkParams = [
                roomId, checkOut, checkIn, checkIn, checkOut
            ];

            db.query(sqlCheckOverlap, checkParams, (errOverlap, overlapRows) => {
                if (errOverlap) return db.rollback(() => res.status(500).json({ message: "Lỗi DB khi kiểm tra trùng ngày", error: errOverlap }));
                
                if (overlapRows.length > 0) {
                    // Nếu trùng ngày: Phải trả phòng về trạng thái 'available' vì nó đang là 'booked'
                    db.query("UPDATE rooms SET status = 'available' WHERE id = ?", [roomId], (errRevert) => {
                        if (errRevert) console.error("Lỗi hoàn tác trạng thái phòng:", errRevert); 
                        
                        return db.rollback(() => res.status(409).json({ 
                            message: "Phòng này đã được đặt trong khoảng ngày bạn chọn. Vui lòng chọn ngày khác.",
                            roomId: roomId
                        }));
                    });
                    return; 
                }
                
                // =========================================================
                //  BƯỚC 2: CHÈN CHI TIẾT VÀO booking_details (Nếu không trùng ngày)
                // =========================================================
                const sqlInsertDetails = `
                    INSERT INTO booking_details (booking_id, check_in_date, check_out_date, client_name, client_phone, client_address, cccd, payment_method, total_price) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(sqlInsertDetails, [
                    bookingId, checkIn, checkOut, name, phone || null, address || null, cccd, method || "cash", totalPrice
                ], (errDetails) => {
                    if (errDetails) return db.rollback(() => res.status(500).json({ message: "DB error on details insert", error: errDetails }));

                    // BƯỚC 3. CẬP NHẬT TRẠNG THÁI ORDER SANG 'confirmed' VÀ LƯU NGÀY THUÊ
                    const sqlUpdateStatus = "UPDATE booking_order SET order_status = 'confirmed', check_in_date = ?, check_out_date = ?, updated_at = NOW() WHERE id = ?";
                    db.query(sqlUpdateStatus, [checkIn, checkOut, bookingId], (errUpdate) => {
                        if (errUpdate) return db.rollback(() => res.status(500).json({ message: "DB error on status update", error: errUpdate }));

                        // BƯỚC 4. COMMIT TRANSACTION VÀ TRẢ VỀ KẾT QUẢ
                        db.commit(errCommit => {
                            if (errCommit) return db.rollback(() => res.status(500).json({ message: "DB error on commit", error: errCommit }));
                            res.json({ message: "Đặt phòng thành công", paymentId: bookingId });
                        });
                    });
                });
            }); // Đóng CheckOverlap Query
        }); // Đóng SelectOrder Query
    }); // Đóng BeginTransaction
});

// 🎯 API MỚI: GET /api/bookings/:id (Chi tiết đơn đặt phòng)
app.get("/api/bookings/:id", verifyToken, (req, res) => {
    const userId = req.userId;
    const bookingId = req.params.id; 

    const sql = `
        SELECT 
            b.id AS booking_id, b.room_id, b.quantity AS num_rooms, b.created_at, b.order_status,
            r.name AS room_name, r.price_per_night, r.main_image_url AS image,
            d.check_in_date, d.check_out_date, d.client_name, d.client_phone, 
            d.client_address, d.cccd, d.payment_method, d.total_price
        FROM booking_order b
        JOIN rooms r ON b.room_id = r.id
        JOIN booking_details d ON b.id = d.booking_id
        WHERE b.id = ? AND b.user_id = ? AND b.order_status != 'pending' -- Đảm bảo không lấy đơn pending
    `;

    db.query(sql, [bookingId, userId], (err, rows) => {
        if (err) {
            console.error("Lỗi DB khi lấy chi tiết booking:", err);
            return res.status(500).json({ message: "DB error", error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng này." });
        }
        res.json(rows[0]); // Trả về chi tiết của 1 đơn hàng
    });
});

// 🚨 API MỚI: DELETE /api/bookings/:id (Hủy và xóa vĩnh viễn đơn đặt phòng)
app.delete("/api/bookings/:id", verifyToken, (req, res) => {
    const userId = req.userId;
    const bookingId = req.params.id;

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: "DB error starting transaction" });

        // 1. KIỂM TRA & XÓA KHỎI booking_details
        const sqlDeleteDetails = "DELETE FROM booking_details WHERE booking_id = ?";
        db.query(sqlDeleteDetails, [bookingId], (errDelDetails) => {
            if (errDelDetails) {
                // Nếu không tìm thấy details, vẫn tiếp tục xóa order chính (vì order có thể là 'pending' chưa có details)
                console.warn(`Cảnh báo: Không tìm thấy booking_details cho ID ${bookingId}, tiếp tục xóa booking_order.`);
            }

            // 2. XÓA KHỎI booking_order
            const sqlDeleteOrder = "DELETE FROM booking_order WHERE id = ? AND user_id = ?";
            db.query(sqlDeleteOrder, [bookingId, userId], (errDelOrder, result) => {
                if (errDelOrder) {
                    return db.rollback(() => res.status(500).json({ message: "Lỗi DB khi xóa đơn hàng chính", error: errDelOrder }));
                }

                if (result.affectedRows === 0) {
                    // Nếu không tìm thấy order chính (hoặc không thuộc user)
                    return db.rollback(() => res.status(404).json({ message: "Không tìm thấy đơn đặt phòng hợp lệ để xóa." }));
                }

                // 3. COMMIT TRANSACTION
                db.commit(errCommit => {
                    if (errCommit) return db.rollback(() => res.status(500).json({ message: "Lỗi DB khi commit", error: errCommit }));
                    res.json({ message: "Đơn đặt phòng đã được xóa vĩnh viễn.", bookingId });
                });
            });
        });
    });
});


// GET /api/bookings (Lịch sử đặt phòng chi tiết)
app.get("/api/bookings", verifyToken, (req, res) => {
    const userId = req.userId;
    const sql = `
        SELECT 
            b.id AS booking_id, b.quantity AS num_rooms, b.created_at, b.order_status,
            r.name AS room_name, r.price_per_night, r.main_image_url AS image,
            d.check_in_date, d.check_out_date, d.client_name, d.cccd, d.total_price
        FROM booking_order b
        JOIN rooms r ON b.room_id = r.id
        JOIN booking_details d ON b.id = d.booking_id
        WHERE b.user_id = ? AND b.order_status = 'confirmed'
        ORDER BY b.created_at DESC
    `;
    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        res.json(rows);
    });
});


/* ==========================================================
    V. ADMIN ENDPOINTS (Quản lý Đơn đặt phòng)
    ========================================================== */

// 1. GET /api/admin/bookings (Lấy danh sách đơn đặt đã xác nhận cho trang Admin)
app.get("/api/admin/bookings", verifyAdminToken, (req, res) => {
    // Chỉ lấy các đơn đã 'confirmed' hoặc 'checked_in' (Giả định trạng thái confirmed là cần quản lý)
    const sql = `
        SELECT
            b.id AS booking_id,
            b.room_id,
            b.quantity AS num_rooms,
            b.created_at,
            b.check_in_date,
            b.check_out_date,
            b.order_status,
            r.name AS room_name,
            r.price_per_night,
            d.client_name AS client_name,
            d.client_phone AS client_phone,
            d.total_price
        FROM booking_order b
        JOIN rooms r ON b.room_id = r.id
        JOIN booking_details d ON b.id = d.booking_id
        JOIN user_cred u ON b.user_id = u.id 
        WHERE b.order_status IN ('confirmed', 'checked_in') 
        ORDER BY b.check_in_date DESC
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });

        // Tính toán Thời gian còn lại (Giả định: đã check-in thì mới tính)
        const formattedRows = rows.map(row => {
            const checkOut = new Date(row.check_out_date);
            const checkIn = new Date(row.check_in_date);
            const now = new Date();
            let timeRemaining = null;

            if (row.order_status === 'checked_in') {
                if (checkOut > now) {
                    const diffTime = Math.abs(checkOut - now);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    timeRemaining = `${diffDays} ngày`;
                } else {
                    timeRemaining = "Đã quá hạn trả phòng";
                }
            } else if (row.order_status === 'confirmed') {
                if (checkIn > now) {
                    timeRemaining = "Chưa đến ngày Check-in";
                } else {
                    timeRemaining = "Cần Check-in ngay";
                }
            }
            
            return {
                ...row,
                time_remaining: timeRemaining
            };
        });

        res.json(formattedRows);
    });
});

// 2. PUT /api/admin/bookings/:id/confirm (Xác nhận Check-in/Thanh toán Trả phòng)
app.put("/api/admin/bookings/:id/confirm", verifyAdminToken, (req, res) => {
    const bookingId = req.params.id;
    const action = req.body.action; // Lấy action từ frontend ('check_in' hoặc 'pay')

    let newStatus;
    let successMessage;
    let releaseRoom = false; // Biến cờ để quyết định có trả phòng về available hay không

    if (action === 'check_in') {
        newStatus = 'checked_in'; 
        successMessage = "Đã Xác nhận Check-in thành công.";
    } else if (action === 'pay') {
        newStatus = 'paid'; 
        successMessage = "Đã Xác nhận Thanh toán Trả phòng thành công.";
        releaseRoom = true; // Kích hoạt cờ trả phòng
    } else {
        return res.status(400).json({ message: "Action không hợp lệ. Chỉ chấp nhận 'check_in' hoặc 'pay'." });
    }
    
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: "Lỗi khởi tạo giao dịch" });
        
        // 1. Cập nhật trạng thái Đơn hàng
        const sqlUpdateOrder = "UPDATE booking_order SET order_status = ?, updated_at = NOW() WHERE id = ?";
        db.query(sqlUpdateOrder, [newStatus, bookingId], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ message: "Lỗi DB khi cập nhật trạng thái đơn hàng", error: err.message }));
            if (result.affectedRows === 0) return db.rollback(() => res.status(404).json({ message: "Không tìm thấy đơn đặt phòng để cập nhật." }));

            // 2. Nếu là action 'pay' (Trả phòng), cần cập nhật trạng thái phòng
            if (releaseRoom) {
                // Lấy room_id từ đơn hàng
                db.query("SELECT room_id FROM booking_order WHERE id = ?", [bookingId], (errGetRoom, rows) => {
                    if (errGetRoom || rows.length === 0) {
                        console.warn("Cảnh báo: Không tìm thấy room_id để giải phóng.");
                        // Vẫn commit đơn hàng đã trả tiền, nhưng log cảnh báo
                        return db.commit(() => res.json({ message: successMessage + " (Lỗi: Không giải phóng được phòng)", bookingId, new_status: newStatus }));
                    }

                    const roomId = rows[0].room_id;
                    
                    // Giải phóng phòng: Cập nhật status trong bảng rooms về 'available'
                    const sqlReleaseRoom = "UPDATE rooms SET status = 'available' WHERE id = ?";
                    db.query(sqlReleaseRoom, [roomId], (errRelease) => {
                        if (errRelease) return db.rollback(() => res.status(500).json({ message: "Lỗi DB khi giải phóng phòng", error: errRelease.message }));

                        // 3. Commit Giao dịch thành công
                        db.commit(errCommit => {
                            if (errCommit) return db.rollback(() => res.status(500).json({ message: "Lỗi commit sau khi giải phóng phòng", error: errCommit.message }));
                            res.json({ message: successMessage + " Phòng đã được giải phóng.", bookingId, new_status: newStatus });
                        });
                    });
                });
            } else {
                // Nếu là action 'check_in', chỉ commit cập nhật trạng thái đơn hàng (không giải phóng phòng)
                db.commit(errCommit => {
                    if (errCommit) return db.rollback(() => res.status(500).json({ message: "Lỗi commit sau check-in", error: errCommit.message }));
                    res.json({ message: successMessage, bookingId, new_status: newStatus });
                });
            }
        });
    });
});

// 3. DELETE /api/admin/bookings/:id/cancel (Hủy đơn đặt phòng)
app.delete("/api/admin/bookings/:id/cancel", verifyAdminToken, (req, res) => {
    const bookingId = req.params.id;

    db.query("UPDATE booking_order SET order_status = 'cancelled', updated_at = NOW() WHERE id = ?", 
    [bookingId], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng" });
        
        res.json({ message: "Đã Hủy Đơn Đặt Phòng thành công", bookingId });
    });
});
/* ==========================================================
   IV. ADMIN CRUD ENDPOINTS (Cấu hình: Facilities & Features)
========================================================== */

// --- 4.1 CRUD cho FACILITIES (Tiện nghi) ---
app.get("/api/admin/facilities", (req, res) => {
    db.query("SELECT * FROM facilities ORDER BY name", (err, rows) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        res.json(rows);
    });
});
app.post("/api/admin/facilities", verifyAdminToken, (req, res) => { 
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Thiếu tên tiện nghi" });
    db.query("INSERT INTO facilities (name) VALUES (?)", [name], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi DB khi thêm", error: err });
        res.status(201).json({ message: "Thêm tiện nghi thành công", id: result.insertId });
    });
});
app.put("/api/admin/facilities/:id", verifyAdminToken, (req, res) => { 
    const { name } = req.body;
    const id = req.params.id;
    if (!name) return res.status(400).json({ message: "Thiếu tên tiện nghi" });
    db.query("UPDATE facilities SET name = ? WHERE id = ?", [name, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi DB khi sửa", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy tiện nghi" });
        res.json({ message: "Cập nhật tiện nghi thành công" });
    });
});
app.delete("/api/admin/facilities/:id", verifyAdminToken, (req, res) => { 
    const id = req.params.id;
    db.query("DELETE FROM facilities WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi DB khi xóa", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy tiện nghi" });
        res.json({ message: "Xóa tiện nghi thành công" });
    });
});

// --- 4.2 CRUD cho FEATURES (Đặc điểm) ---
app.get("/api/admin/features", (req, res) => {
    db.query("SELECT * FROM features ORDER BY name", (err, rows) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });
        res.json(rows);
    });
});
app.post("/api/admin/features", verifyAdminToken, (req, res) => { 
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Thiếu tên đặc điểm" });
    db.query("INSERT INTO features (name) VALUES (?)", [name], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi DB khi thêm", error: err });
        res.status(201).json({ message: "Thêm đặc điểm thành công", id: result.insertId });
    });
});
app.put("/api/admin/features/:id", verifyAdminToken, (req, res) => { 
    const { name } = req.body;
    const id = req.params.id;
    if (!name) return res.status(400).json({ message: "Thiếu tên đặc điểm" });
    db.query("UPDATE features SET name = ? WHERE id = ?", [name, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi DB khi sửa", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy đặc điểm" });
        res.json({ message: "Cập nhật đặc điểm thành công" });
    });
});
app.delete("/api/admin/features/:id", verifyAdminToken, (req, res) => { 
    const id = req.params.id;
    db.query("DELETE FROM features WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi DB khi xóa", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy đặc điểm" });
        res.json({ message: "Xóa đặc điểm thành công" });
    });
});
// Thêm đoạn code này vào file Express Backend của bạn (trong phần ADMIN ENDPOINTS)

// 🚨 API MỚI: GET /api/admin/dashboard/stats (Lấy tất cả số liệu thống kê)
app.get("/api/admin/dashboard/stats", verifyAdminToken, (req, res) => {
    
    // 1. Tổng số Khách hàng (User)
    const countUsers = "SELECT COUNT(id) AS total_users FROM user_cred";
    // 2. Tổng số Phòng
    const countRooms = "SELECT COUNT(id) AS total_rooms FROM rooms";
    // 3. Tổng số Tiện nghi (Facilities)
    const countFacilities = "SELECT COUNT(id) AS total_facilities FROM facilities";
    // 4. Tổng số Tiền đã thu (Chỉ tính các đơn đã 'paid' hoặc 'confirmed' có tổng tiền)
    const totalRevenue = "SELECT SUM(d.total_price) AS total_revenue FROM booking_order b JOIN booking_details d ON b.id = d.booking_id WHERE b.order_status IN ('confirmed', 'paid', 'checked_in')";
    // 5. Số đơn hàng mới (Trạng thái 'confirmed')
    const newBookings = "SELECT COUNT(id) AS new_bookings FROM booking_order WHERE order_status = 'confirmed'"; 

    // Chạy tất cả truy vấn đồng thời
    Promise.all([
        new Promise((resolve, reject) => db.query(countUsers, (err, rows) => err ? reject(err) : resolve(rows[0]))),
        new Promise((resolve, reject) => db.query(countRooms, (err, rows) => err ? reject(err) : resolve(rows[0]))),
        new Promise((resolve, reject) => db.query(countFacilities, (err, rows) => err ? reject(err) : resolve(rows[0]))),
        new Promise((resolve, reject) => db.query(totalRevenue, (err, rows) => err ? reject(err) : resolve(rows[0]))),
        new Promise((resolve, reject) => db.query(newBookings, (err, rows) => err ? reject(err) : resolve(rows[0]))),
    ])
    .then(results => {
        const stats = {
            totalUsers: results[0].total_users,
            totalRooms: results[1].total_rooms,
            totalFacilities: results[2].total_facilities,
            // Đảm bảo trả về 0 nếu không có doanh thu
            totalRevenue: results[3].total_revenue || 0, 
            newBookings: results[4].new_bookings,
        };
        res.json(stats);
    })
    .catch(dbErr => {
        console.error("Lỗi DB khi lấy Dashboard Stats:", dbErr);
        res.status(500).json({ message: "DB error on stats retrieval", error: dbErr.message });
    });
});
// Thêm đoạn code này vào file Express Backend của bạn (trong phần ADMIN ENDPOINTS)

// 🚨 API MỚI: GET /api/admin/bookings/pending (Lấy danh sách đơn đặt đang chờ xử lý)
app.get("/api/admin/bookings/pending", verifyAdminToken, (req, res) => {
    
    // Truy vấn join giữa booking_order (để lấy trạng thái pending), rooms và user_info/user_cred
    const sql = `
        SELECT 
            b.id AS booking_id,
            b.room_id,
            b.quantity AS num_rooms,
            b.created_at,
            r.name AS room_name,
            r.price_per_night,
            r.main_image_url AS room_image,
            u.username AS client_username,
            ui.email AS client_email,
            b.order_status
        FROM booking_order b
        JOIN rooms r ON b.room_id = r.id
        JOIN user_cred u ON b.user_id = u.id
        LEFT JOIN user_info ui ON u.id = ui.user_id 
        WHERE b.order_status = 'pending'
        ORDER BY b.created_at DESC
    `;
    
    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Lỗi DB khi lấy đơn đặt Pending:", err);
            return res.status(500).json({ message: "DB error", error: err });
        }

        const formattedRows = rows.map(row => {
            // Giả định đơn pending là đơn đặt 1 đêm (hoặc tính giá cơ bản)
            const estimatedPrice = row.price_per_night * row.num_rooms; 
            
            return {
                ...row,
                estimated_price: estimatedPrice,
                // Giả định ngày đặt là ngày hiện tại vì đơn pending chưa chọn ngày thuê chính thức
                check_in_date_temp: "Chưa xác định", 
                duration: "Chưa xác định"
            };
        });

        res.json(formattedRows);
    });
});
app.get("/api/admin/bookings/history", verifyAdminToken, (req, res) => {

    const sql = `
        SELECT 
            b.id AS booking_id,
            b.room_id,
            b.quantity AS num_rooms,
            b.created_at,
            b.updated_at,
            b.order_status,
            r.name AS room_name,
            r.price_per_night,
            d.client_name,
            d.client_phone,
            d.check_in_date,
            d.check_out_date,
            d.total_price
        FROM booking_order b
        JOIN rooms r ON b.room_id = r.id
        LEFT JOIN booking_details d ON b.id = d.booking_id
        -- 🚨 ĐIỀU CHỈNH: Bao gồm các đơn bị hủy ('cancelled') VÀ các đơn có trạng thái trống/NULL
        WHERE b.order_status = 'cancelled' OR b.order_status IS NULL OR b.order_status = ''
        ORDER BY b.updated_at DESC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Lỗi DB khi lấy lịch sử đặt phòng:", err);
            return res.status(500).json({ message: "DB error", error: err });
        }

        const formattedRows = rows.map(row => {
            let duration = 'N/A';

            // Logic tính thời gian thuê chỉ áp dụng nếu có ngày tháng hợp lệ
            if (
                row.check_in_date &&
                row.check_out_date &&
                (row.order_status === 'paid' || row.order_status === 'checked_in') // Vẫn giữ logic cũ để tính duration nếu status có giá trị
            ) {
                const checkIn = new Date(row.check_in_date);
                const checkOut = new Date(row.check_out_date);
                const diff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

                duration = `${diff} ngày`;
            } else if (row.order_status === 'cancelled') {
                duration = 'Đã hủy';
            } else if (!row.order_status) {
                duration = 'Trạng thái không xác định';
            }

            return {
                ...row,
                duration
            };
        });

        res.json(formattedRows);
    });
});
// TRONG FILE INDEX.JS HOẶC APP.JS

// ==========================================================
// THIẾT LẬP CHUNG (CẦN CÓ)
// ==========================================================
// Giả định: db (đối tượng kết nối MySQL), bcrypt, jwt, SALT_ROUNDS, verifyAdminToken đã được định nghĩa.

// Hàm Promisify db.query
const dbQueryAsync = (sql, values) => new Promise((resolve, reject) => {
    // SỬA: Thay thế 'db' bằng đối tượng kết nối MySQL thực tế của bạn
    db.query(sql, values, (err, result) => { 
        if (err) return reject(err);
        resolve(result);
    });
});

// Hàm Fetch dữ liệu User hiện tại (cũ) - Dùng trong PUT
const fetchCurrentUser = async (userId) => {
    const sql = `
        SELECT 
            c.username, 
            i.email,
            i.name,         /* FIX: Lấy tên cột chính xác là 'name' */
            i.phone
        FROM user_cred c
        LEFT JOIN user_info i ON c.id = i.user_id
        WHERE c.id = ?
    `;
    const result = await dbQueryAsync(sql, [userId]);
    // Trả về đối tượng user hoặc undefined.
    return result[0] ? result[0] : undefined; 
};



/* ==========================================================
 VI. ADMIN CRUD ENDPOINTS 
 ========================================================== */

// 1. GET /api/admin/users
app.get("/api/admin/users", verifyAdminToken, async (req, res) => {
    const sql = `
        SELECT 
            c.id, 
            c.username, 
            c.status,           
            i.email,
            i.name,             
            i.phone             
        FROM user_cred c
        LEFT JOIN user_info i ON c.id = i.user_id
        ORDER BY c.id DESC
    `;
    try {
        const rows = await dbQueryAsync(sql);
        const usersWithStatus = rows.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            full_name: user.name, 
            isActive: user.status === 'active' 
        }));
        res.json(usersWithStatus);
    } catch (err) {
        console.error("Lỗi DB khi lấy danh sách user:", err);
        return res.status(500).json({ message: "DB error", error: err.message });
    }
});


// ==========================================================
// API GỘP: CẬP NHẬT THÔNG TIN & TRẠNG THÁI (ACTIVE/INACTIVE)
// PUT /api/admin/users/:id
// ==========================================================
app.put("/api/admin/users/:id", verifyAdminToken, async (req, res) => {
    const userId = req.params.id;
    // Nhận tất cả các trường: username, password, info... VÀ isActive
    const { username, password, full_name, email, phone, isActive } = req.body; 

    // Kiểm tra xem có dữ liệu nào được gửi lên không
    if (!username && !password && full_name === undefined && email === undefined && phone === undefined && isActive === undefined) {
        return res.status(400).json({ message: "Thiếu dữ liệu cần cập nhật." });
    }

    db.beginTransaction(async (err) => {
        if (err) return res.status(500).json({ message: "DB error starting transaction" });

        try {
            // 1. Lấy thông tin user hiện tại để so sánh
            const currentUser = await fetchCurrentUser(userId);
            if (!currentUser) throw new Error("User không tồn tại.");

            const currentAdminId = req.user?.id || req.userId; // Lấy ID admin đang đăng nhập

            // 2. Xử lý STATUS (Nếu có gửi isActive)
            let newStatus = undefined;
            if (isActive !== undefined) {
                // Chuyển đổi sang boolean cho chắc chắn
                const isActiveBool = String(isActive) === 'true' || isActive === true;
                
                // BẢO VỆ: Không cho phép Admin tự vô hiệu hóa chính mình
                if (!isActiveBool && String(userId) === String(currentAdminId)) {
                     return db.rollback(() =>
                         res.status(403).json({ message: "Bạn không thể vô hiệu hóa tài khoản Admin hiện tại của chính mình." })
                     );
                }
                
                newStatus = isActiveBool ? 'active' : 'inactive';
            }

            // =======================================================
            // BƯỚC 1: KIỂM TRA TRÙNG LẶP (Username & Email)
            // =======================================================
            
            if (username && username !== currentUser.username) {
                const checkUserSql = "SELECT id FROM user_cred WHERE username = ? AND id != ?";
                const existingUser = await dbQueryAsync(checkUserSql, [username, userId]);
                if (existingUser && existingUser.length > 0) throw new Error("Tên người dùng đã tồn tại.");
            }
            
            let finalEmail = undefined;
            if (email !== undefined) {
                finalEmail = email ? email.trim() : null;
                if (finalEmail !== currentUser.email && finalEmail !== null) {
                    const checkEmailSql = "SELECT user_id FROM user_info WHERE email = ? AND user_id != ?";
                    const existingEmail = await dbQueryAsync(checkEmailSql, [finalEmail, userId]);
                    if (existingEmail && existingEmail.length > 0) throw new Error("Địa chỉ email đã được sử dụng.");
                }
            }

            // ==================================
            // BƯỚC 2: THỰC THI UPDATE
            // ==================================
            
            // A. Update bảng user_cred (Username, Password, Status)
            let credUpdates = [];
            let credValues = [];

            if (username && username !== currentUser.username) {
                credUpdates.push("username = ?");
                credValues.push(username.trim());
            }
            if (password) {
                const hash = await bcrypt.hash(password, SALT_ROUNDS);
                credUpdates.push("password = ?");
                credValues.push(hash);
            }
            // Tích hợp update Status vào đây
            if (newStatus !== undefined && newStatus !== currentUser.status) {
                 credUpdates.push("status = ?");
                 credValues.push(newStatus);
            }

            if (credUpdates.length > 0) {
                const sqlCred = `UPDATE user_cred SET ${credUpdates.join(", ")} WHERE id = ?`;
                await dbQueryAsync(sqlCred, [...credValues, userId]);
            }

            // B. Update bảng user_info (Name, Email, Phone)
            let infoData = {};
            if (full_name !== undefined) {
                const cleanName = full_name.trim() === '' ? null : full_name.trim();
                if (cleanName !== currentUser.name) infoData.name = cleanName;
            }
            if (phone !== undefined) {
                const cleanPhone = phone.trim() === '' ? null : phone.trim();
                if (cleanPhone !== currentUser.phone) infoData.phone = cleanPhone;
            }
            if (finalEmail !== undefined && finalEmail !== currentUser.email) {
                infoData.email = finalEmail;
            }

            let infoUpdates = [];
            let infoValues = [];
            Object.keys(infoData).forEach((key) => {
                infoUpdates.push(`${key} = ?`);
                infoValues.push(infoData[key]); 
            });

            if (infoUpdates.length > 0) {
                const columns = infoUpdates.map((u) => u.split(" ")[0]);
                const sqlInfo = `
                    INSERT INTO user_info (user_id, ${columns.join(", ")})
                    VALUES (?, ${columns.map(() => "?").join(", ")})
                    ON DUPLICATE KEY UPDATE ${infoUpdates.join(", ")}
                `;
                await dbQueryAsync(sqlInfo, [userId, ...infoValues, ...infoValues]);
            }

            // Nếu không có gì thay đổi cả
            if (credUpdates.length === 0 && infoUpdates.length === 0) {
                 return db.rollback(() => res.status(200).json({ message: "Không có thay đổi nào cần cập nhật.", userId }));
            }

            // COMMIT
            db.commit((errCommit) => {
                if (errCommit) return db.rollback(() => res.status(500).json({ message: "Lỗi commit", error: errCommit.message }));
                res.json({ message: "Cập nhật thành công", userId });
            });

        } catch (e) {
            db.rollback(() => {
                console.error("UPDATE ERROR:", e);
                const msg = e.message.includes("tồn tại") || e.message.includes("sử dụng") ? e.message : "Lỗi hệ thống khi cập nhật.";
                res.status(500).json({ message: msg, error: e.message });
            });
        }
    });
});


// 4. DELETE /api/admin/users/:id (Xóa User và dữ liệu liên quan)
app.delete("/api/admin/users/:id", verifyAdminToken, async (req, res) => {
    const userId = req.params.id;

    db.beginTransaction(async (err) => {
        if (err) return res.status(500).json({ message: "DB error starting transaction" });

        try {
            // Xóa booking_details (bảng con) qua subquery
            const sqlDeleteDetails = `
                DELETE FROM booking_details 
                WHERE booking_id IN (
                    SELECT id FROM booking_order WHERE user_id = ?
                )
            `;
            await dbQueryAsync(sqlDeleteDetails, [userId]); 

            // Xóa các bảng phụ TRỰC TIẾP trỏ đến user_cred
            const directDeleteMap = [
                { table: "booking_order", fk_column: "user_id" }, 
                { table: "user_info", fk_column: "user_id" }, 
            ];

            for (const item of directDeleteMap) {
                const sql = `DELETE FROM ${item.table} WHERE ${item.fk_column} = ?`;
                await dbQueryAsync(sql, [userId]);
            }

            // Xóa user chính (user_cred)
            const sqlUser = "DELETE FROM user_cred WHERE id = ?";
            const result = await dbQueryAsync(sqlUser, [userId]);

            if (result.affectedRows === 0) {
                return db.rollback(() => res.status(404).json({ message: "User không tồn tại." }));
            }

            // COMMIT TRANSACTION
            db.commit((errCommit) => {
                if (errCommit) {
                    return db.rollback(() =>
                        res.status(500).json({ message: "Lỗi commit transaction", error: errCommit.message })
                    );
                }
                res.json({ message: "Xóa user thành công", userId });
            });
        } catch (e) {
            // ROLLBACK VÀ TRẢ VỀ LỖI
            db.rollback(() => {
                console.error("Lỗi giao dịch xóa user cuối cùng:", e);
                res.status(500).json({ 
                    message: "Lỗi khi xóa user và dữ liệu liên quan. Vui lòng kiểm tra log server.", 
                    error: e.message
                });
            });
        }
    });
});
// 5.1 GET: Lấy danh sách đánh giá theo Room ID (ĐÃ CẬP NHẬT LẤY TÊN)
app.get("/api/reviews/room/:roomId", (req, res) => {
    const roomId = req.params.roomId;
    
    // Query này JOIN với bảng user_cred và user_info để lấy tên
    const sql = `
        SELECT r.*, u.username, i.name AS full_name
        FROM rating_review r
        JOIN user_cred u ON r.user_id = u.id
        LEFT JOIN user_info i ON u.id = i.user_id
        WHERE r.room_id = ? 
        ORDER BY r.created_at DESC
    `;

    db.query(sql, [roomId], (err, rows) => {
        if (err) return res.status(500).json({ message: "Lỗi DB", error: err });
        res.json(rows);
    });
});
// --- THÊM ĐOẠN NÀY VÀO index.js ---

// GET /api/admin/reviews (Lấy tất cả đánh giá để Admin xem)
app.get("/api/admin/reviews", verifyAdminToken, (req, res) => {
    // Câu lệnh SQL: Lấy thông tin review + tên phòng + tên khách hàng
    const sql = `
        SELECT 
            r.id, 
            r.rating_point, 
            r.review_text, 
            r.created_at,
            rm.name AS room_name,
            u.username,
            i.name AS full_name
        FROM rating_review r
        JOIN rooms rm ON r.room_id = rm.id
        JOIN user_cred u ON r.user_id = u.id
        LEFT JOIN user_info i ON u.id = i.user_id
        ORDER BY r.created_at DESC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Lỗi lấy danh sách review:", err);
            return res.status(500).json({ message: "Lỗi DB", error: err });
        }
        res.json(rows);
    });
});

// 5.2 POST: Thêm đánh giá mới (CHỈ CHO PHÉP NẾU ĐÃ ĐẶT PHÒNG)
app.post("/api/reviews", verifyToken, (req, res) => {
    const { room_id, rating_point, review_text } = req.body;

    // Lấy user_id chuẩn từ token
    const user_id = (req.user && req.user.id) ? req.user.id : req.userId;

    if (!user_id) return res.status(401).json({ message: "Chưa đăng nhập." });
    if (!room_id || !rating_point) return res.status(400).json({ message: "Thiếu thông tin đánh giá." });

    // BƯỚC 1: KIỂM TRA LỊCH SỬ ĐẶT PHÒNG
    // Chỉ cho phép đánh giá nếu user đã có đơn hàng ở trạng thái: confirmed, checked_in, paid, success
    const sqlCheckBooking = `
        SELECT id 
        FROM booking_order 
        WHERE user_id = ? 
        AND room_id = ? 
        AND order_status IN ('confirmed', 'checked_in', 'paid', 'success')
        LIMIT 1
    `;

    db.query(sqlCheckBooking, [user_id, room_id], (errCheck, rows) => {
        if (errCheck) {
            console.error("Lỗi kiểm tra booking:", errCheck);
            return res.status(500).json({ message: "Lỗi hệ thống khi kiểm tra quyền đánh giá." });
        }

        // Nếu không tìm thấy đơn đặt phòng hợp lệ
        if (rows.length === 0) {
            return res.status(403).json({ 
                message: "Bạn chưa trải nghiệm phòng này (hoặc đơn chưa được xác nhận), nên không thể đánh giá." 
            });
        }

        // BƯỚC 2: NẾU HỢP LỆ -> LƯU ĐÁNH GIÁ
        const sqlInsert = "INSERT INTO rating_review (room_id, user_id, rating_point, review_text, created_at) VALUES (?, ?, ?, ?, NOW())";
        
        db.query(sqlInsert, [room_id, user_id, rating_point, review_text], (err, result) => {
            if (err) {
                console.error("Lỗi thêm review:", err);
                return res.status(500).json({ message: "Lỗi khi lưu đánh giá", error: err });
            }
            
            res.status(201).json({ 
                message: "Cảm ơn bạn! Đánh giá đã được đăng thành công.", 
                id: result.insertId,
                data: { room_id, user_id, rating_point, review_text }
            });
        });
    });
});

// 5.3 PUT: Sửa đánh giá
app.put("/api/reviews/:id", verifyToken, (req, res) => {
    const reviewId = req.params.id;
    const userId = req.user.id || req.user.userId;
    const { rating_point, review_text } = req.body;

    const sql = `
        UPDATE rating_review 
        SET rating_point = ?, review_text = ? 
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [rating_point, review_text, reviewId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi DB khi sửa", error: err });
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "Không tìm thấy đánh giá hoặc bạn không có quyền sửa" });
        }

        res.json({ message: "Cập nhật đánh giá thành công" });
    });
});

// 5.4 DELETE: Xóa đánh giá
app.delete("/api/reviews/:id", verifyToken, (req, res) => {
    const reviewId = req.params.id;
    const userId = req.user.id || req.user.userId;
    const isAdmin = req.user.role === 'admin'; 

    let sql = "";
    let params = [];

    if (isAdmin) {
        sql = "DELETE FROM rating_review WHERE id = ?";
        params = [reviewId];
    } else {
        sql = "DELETE FROM rating_review WHERE id = ? AND user_id = ?";
        params = [reviewId, userId];
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi DB khi xóa", error: err });

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "Không xóa được (Không tìm thấy hoặc không có quyền)" });
        }

        res.json({ message: "Xóa đánh giá thành công" });
    });
});

/* ==========================================================
   API TÌM KIẾM PHÒNG NÂNG CAO (PHIÊN BẢN FIX TRIỆT ĐỂ)
   GET /api/rooms/search/advanced

========================================================== */
app.get("/api/rooms/search/advanced", (req, res) => {
    const { checkIn, checkOut, maxPrice, guests } = req.query;
    const queryParams = [];

    // Lấy các phòng đang hoạt động
    let sql = `SELECT r.* FROM rooms r WHERE r.status IN ('active', 'available', 'booked') `;

    // Lọc ngày trống: Phòng KHÔNG được có đơn đặt nào trùng vào khoảng ngày này
    if (checkIn && checkOut) {
        sql += `
            AND NOT EXISTS (
                SELECT 1 FROM booking_order b
                JOIN booking_details d ON b.id = d.booking_id
                WHERE b.room_id = r.id
                AND b.order_status IN ('confirmed', 'checked_in', 'paid')
                AND (DATE(?) < DATE(d.check_out_date) AND DATE(?) > DATE(d.check_in_date))
            )
        `;
        queryParams.push(checkIn, checkOut); 
    }

    if (maxPrice) {
        sql += " AND r.price_per_night <= ?";
        queryParams.push(parseFloat(maxPrice));
    }

    if (guests) {
        sql += " AND r.max_guests >= ?";
        queryParams.push(parseInt(guests));
    }

    sql += " ORDER BY r.price_per_night ASC";

    db.query(sql, queryParams, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows); // Trả về mảng trực tiếp cho Frontend dễ map
    });
});

// Thêm vào file index.js của bạn

app.post("/api/chatbot", (req, res) => {
    const userMessage = req.body.message.toLowerCase();
    
    // 1. Phân tích ý định người dùng (Simple NLP bằng từ khóa)
    let maxPrice = null;
    let guests = 1;
    
    // Quét giá tiền
    if (userMessage.includes("dưới 500") || userMessage.includes("500k")) maxPrice = 500000;
    else if (userMessage.includes("dưới 1 triệu") || userMessage.includes("1tr")) maxPrice = 1000000;
    else if (userMessage.includes("dưới 5 triệu") || userMessage.includes("5tr")) maxPrice = 5000000;

    // Quét số lượng khách
    const guestMatch = userMessage.match(/(\d+)\s*khách/) || userMessage.match(/cho\s*(\d+)\s*người/);
    if (guestMatch) guests = parseInt(guestMatch[1]);

    // 2. Nếu người dùng hỏi về tìm phòng
    if (userMessage.includes("tìm phòng") || userMessage.includes("còn phòng") || userMessage.includes("phòng trống")) {
        let sql = `SELECT name, price_per_night, max_guests FROM rooms WHERE status = 'available'`;
        let params = [];

        if (maxPrice) {
            sql += " AND price_per_night <= ?";
            params.push(maxPrice);
        }
        sql += " AND max_guests >= ?";
        params.push(guests);

        db.query(sql, params, (err, rows) => {
            if (err) return res.json({ reply: "Xin lỗi, tôi gặp lỗi khi truy cập dữ liệu." });
            
            if (rows.length === 0) {
                return res.json({ reply: `Rất tiếc, tôi không tìm thấy phòng nào phù hợp cho ${guests} khách${maxPrice ? ` với giá dưới ${maxPrice.toLocaleString()}đ` : ""}.` });
            }

            let reply = `Tôi tìm thấy ${rows.length} phòng phù hợp cho bạn: \n`;
            rows.slice(0, 3).forEach(room => {
                reply += `- ${room.name}: ${parseFloat(room.price_per_night).toLocaleString()}đ/đêm \n`;
            });
            reply += "\nBạn có muốn xem chi tiết không?";
            res.json({ reply });
        });
    } 
    // 3. Các câu hỏi thông thường khác
    else if (userMessage.includes("xin chào") || userMessage.includes("hi")) {
        res.json({ reply: "Xin chào! Tôi là trợ lý ảo của HotelBooking. Tôi có thể giúp bạn tìm phòng theo giá và số lượng người." });
    }
    else if (userMessage.includes("địa chỉ") || userMessage.includes("ở đâu")) {
        res.json({ reply: "Khách sạn chúng tôi nằm tại trung tâm Quận 1, TP. Hồ Chí Minh." });
    }
    else {
        res.json({ reply: "Xin lỗi, tôi chưa hiểu ý bạn. Bạn có thể hỏi ví dụ: 'Tìm phòng cho 2 người giá dưới 1tr' không?" });
    }
});

/* ==========================
   START SERVER
========================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
