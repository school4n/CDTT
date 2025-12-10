import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const styles = {
    // Style chung cho widget
    container: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 2000, // Đảm bảo nổi trên tất cả
        fontFamily: 'Arial, sans-serif',
    },
    // Nút bong bóng
    button: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s',
    },
    // Cửa sổ chat chính
    window: {
        width: '350px',
        height: '450px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '10px',
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeBtn: {
        cursor: 'pointer',
        fontSize: '1.5em',
    },
    body: {
        flexGrow: 1,
        padding: '10px',
        overflowY: 'auto',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
    },
    inputArea: {
        display: 'flex',
        padding: '10px',
        borderTop: '1px solid #ccc',
    },
    input: {
        flexGrow: 1,
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginRight: '5px',
    },
    sendButton: {
        padding: '8px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    messageBase: {
        maxWidth: '80%',
        padding: '8px 12px',
        borderRadius: '18px',
        marginBottom: '8px',
        lineHeight: 1.4,
    },
    messageBot: {
        backgroundColor: '#e2e6ea',
        alignSelf: 'flex-start',
        marginRight: 'auto',
    },
    messageUser: {
        backgroundColor: '#007bff',
        color: 'white',
        alignSelf: 'flex-end',
        marginLeft: 'auto',
    }
};

const API_CHATBOT_URL = "http://localhost:3001/api/chatbot";

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Tôi là Bot hỗ trợ đặt phòng. Bạn cần giúp gì?' },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const chatBodyRef = useRef(null);

    // Tự động cuộn xuống dưới
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        const message = inputMessage.trim();
        if (!message) return;

        // 1. Thêm tin nhắn người dùng vào danh sách
        setMessages(prev => [...prev, { sender: 'user', text: message }]);
        setInputMessage('');

        try {
            // 2. Gọi API Backend
            const res = await axios.post(API_CHATBOT_URL, { message });
            
            // 3. Thêm phản hồi của Bot
            setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
            
        } catch (error) {
            console.error("Lỗi Chatbot API:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại.' }]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const getMessageStyle = (sender) => {
        return sender === 'bot' ? 
            { ...styles.messageBase, ...styles.messageBot } : 
            { ...styles.messageBase, ...styles.messageUser };
    };

    return (
        <div style={styles.container}>
            {/* Cửa sổ Chat */}
            {isOpen && (
                <div style={styles.window}>
                    <div style={styles.header}>
                        <h4>Hỗ trợ Đặt phòng</h4>
                        <span style={styles.closeBtn} onClick={() => setIsOpen(false)}>×</span>
                    </div>
                    <div style={styles.body} ref={chatBodyRef}>
                        {messages.map((msg, index) => (
                            <div key={index} style={getMessageStyle(msg.sender)}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div style={styles.inputArea}>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="Nhập tin nhắn..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button style={styles.sendButton} onClick={sendMessage}>Gửi</button>
                    </div>
                </div>
            )}
            
            {/* Nút Bong bóng mở/đóng */}
            {!isOpen && (
                <div style={styles.button} onClick={() => setIsOpen(true)}>
                    <img src="/images/chat_icon.png" alt="Chat" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;