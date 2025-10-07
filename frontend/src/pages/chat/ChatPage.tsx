import React, {useState} from 'react';
import {Container, CssBaseline} from "@mui/material";
import {useAuth} from "../../hooks/useAuth.ts";
import {useNavigate} from "react-router-dom";
import {ChatWindow} from "../../components/chat/ChatWindow.tsx";
import type {Message} from "../../types/chat.ts";

export const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);

    React.useEffect(() => {
        if (!authContext.isLoading && authContext.user === null) {
            navigate('/login');
        }
    }, [authContext.isLoading, authContext.user, navigate]);

    const currentUser = authContext.user;
    if (currentUser === null) return null;

    const handleSendMessages = (msg: Message) => {
        setMessages(prevMessages => [...prevMessages, msg]);
    }

    return (
        <Container>
            <CssBaseline/>
            <ChatWindow
                user={currentUser}
                messages={messages}
                onSendMessage={handleSendMessages}
            />
        </Container>
    );
}