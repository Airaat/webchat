import React from 'react';
import {Container, CssBaseline} from '@mui/material';
import {useAuth} from '../../hooks/useAuth';
import {useChatPageActions} from "../../hooks/useChatPageActions";
import {ChatWindow} from '../../components/chat/chat-window/ChatWindow';
import {ChatMenu} from '../../components/chat/chat-menu/ChatMenu';
import {useChatEventHandler} from "../../hooks/useChatEventHandler";
import {usePresence} from "../../hooks/usePresence";

export const ChatPage: React.FC = () => {
    const authContext = useAuth();
    useChatEventHandler();
    usePresence();

    const {
        chats,
        messages,
        selectedChat,
        createChat,
        selectChat,
    } = useChatPageActions();

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