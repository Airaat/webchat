import React, {useState} from 'react';
import {Container, CssBaseline} from "@mui/material";
import {useAuth} from "../../hooks/useAuth.ts";
import {useNavigate} from "react-router-dom";
import {ChatWindow} from "../../components/chat/ChatWindow.tsx";
import {SideBar} from "../../components/chat/SideBar";
import type {Message, ChatItem} from "../../types/chat.ts";

export const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);

    React.useEffect(() => {
        if (!authContext.isLoading && authContext.user === null) {
            navigate('/login');
        }
    }, [authContext.isLoading, authContext.user, navigate]);

    const currentUser = authContext.user;
    if (currentUser === null) return null;

    const handleChatSelect = (chat: ChatItem) => {
        setSelectedChat(chat);
    }

    const handleSendMessages = (msg: Message) => {
        setMessages(prevMessages => [...prevMessages, msg]);
    }

    return (
        <Container
            sx={{
                display: 'flex',
                height: '100vh',
                width: '100vw',
                overflow: 'hidden',
            }}
        >
            <CssBaseline/>
            <SideBar
                selectedChatId={selectedChat?.id}
                onChatSelect={handleChatSelect}
            />
            <ChatWindow
                user={currentUser}
                messages={messages}
                chat={selectedChat}
                onNewMessage={handleSendMessages}
            />
        </Container>
    );
}