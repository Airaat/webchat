import React from 'react';
import {Container, CssBaseline} from '@mui/material';
import {useAuth} from '../../hooks/useAuth';
import {useChatPage} from "../../hooks/useChatPage";
import {ChatWindow} from '../../components/chat/chat-window/ChatWindow';
import {ChatMenu} from '../../components/chat/chat-menu/ChatMenu';

export const ChatPage: React.FC = () => {
    const authContext = useAuth();
    const {
        chats,
        loading,
        messages,
        selectedChat,
        createChat,
        selectChat,
    } = useChatPage();

    return (
        authContext.user && (
            <Container
                sx={{
                    display: 'flex',
                    height: '100vh',
                    width: '100vw',
                    overflow: 'hidden',
                }}
            >
                <CssBaseline/>
                <ChatMenu
                    chats={chats}
                    selectedChatId={selectedChat?.id}
                    onChatSelect={selectChat}
                    onChatCreate={createChat}
                    loading={loading}
                />
                <ChatWindow
                    user={authContext.user}
                    messages={messages}
                    chat={selectedChat}
                />
            </Container>
        )
    );
}