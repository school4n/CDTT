import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Hỗ trợ chuyển trang
import axios from 'axios';

const styles = {
    container: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 2000, fontFamily: 'sans-serif' },
    button: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' },
    window: { width: '350px', height: '500px', backgroundColor: '#f8f9fa', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', marginBottom: '15px', overflow: 'hidden' },
    header: { backgroundColor: '#007bff', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    body: { flexGrow: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' },
    inputArea: { display: 'flex', padding: '12px', borderTop: '1px solid #eee', backgroundColor: '#fff' },
    input: { flexGrow: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '20px', marginRight: '8px', outline: 'none' },
    sendButton: { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
    messageBase: { maxWidth: '85%', padding: '10px 14px', borderRadius: '15px', marginBottom: '10px', fontSize: '0.95rem', lineHeight: 1.5 },
    messageBot: { backgroundColor: '#f0f2f5', color: '#1c1e21', alignSelf: 'flex-start', borderBottomLeftRadius: '2px' },
    messageUser: { backgroundColor: '#007bff', color: 'white', alignSelf: 'flex-end', borderBottomRightRadius: '2px' }
};

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const navigate = useNavigate(); 
    const [lastRoomId, setLastRoomId] = useState(null); 
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Tôi là Bot hỗ trợ.\nBạn có thể hỏi: "Tìm phòng 2 khách từ 20/12/2025 đến 21/12/2025" nhé!' },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const chatBodyRef = useRef(null);

    const getMessageStyle = (sender) => {
        return sender === 'bot' ? 
            { ...styles.messageBase, ...styles.messageBot } : 
            { ...styles.messageBase, ...styles.messageUser };
    };

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const sendMessage = async () => {
        const text = inputMessage.trim();
        if (!text) return;

        setMessages(prev => [...prev, { sender: 'user', text }]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const res = await axios.post("http://localhost:3001/api/chatbot", { message: text });
            
            // Xử lý điều hướng nếu bot yêu cầu và có ID phòng lưu trữ
            if (res.data.action === "REDIRECT_LAST_ROOM" && lastRoomId) {
                setTimeout(() => {
                    navigate(`/rooms/${lastRoomId}`);
                    setIsOpen(false);
                }, 800);
            }

            // Cập nhật ID phòng mới nhất nếu tìm thấy
            if (res.data.lastRoomId) {
                setLastRoomId(res.data.lastRoomId);
            }

            setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
                setIsTyping(false);
            }, 700);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, tôi đang bận xử lý dữ liệu. Thử lại sau nhé!' }]);
            setIsTyping(false);
        }
    };

    return (
        <div style={styles.container}>
            {isOpen && (
                <div style={styles.window}>
                    <div style={styles.header}>
                        <h4 style={{ margin: 0 }}>🤖 Bot Trợ Lý</h4>
                        <span style={{ cursor: 'pointer', fontSize: '20px' }} onClick={() => setIsOpen(false)}>×</span>
                    </div>
                    
                    <div style={styles.body} ref={chatBodyRef}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ ...getMessageStyle(msg.sender), whiteSpace: 'pre-line' }}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ ...styles.messageBase, ...styles.messageBot, fontStyle: 'italic', opacity: 0.6 }}>
                                Đang xử lý...
                            </div>
                        )}
                    </div>

                    <div style={styles.inputArea}>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="Nhập câu hỏi..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button style={styles.sendButton} onClick={sendMessage}>Gửi</button>
                    </div>
                </div>
            )}
            
            {!isOpen && (
                <div style={styles.button} onClick={() => setIsOpen(true)}>
                    <span style={{fontSize: '30px'}}>💬</span>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;