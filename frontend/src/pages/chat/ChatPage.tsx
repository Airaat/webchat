import React, {useCallback, useEffect, useState} from 'react';
import {Container, CssBaseline} from '@mui/material';
import {useAuth} from '../../hooks/useAuth';
import {useNavigate} from 'react-router-dom';
import {ChatWindow} from '../../components/chat/chat-window/ChatWindow';
import {ChatMenu} from '../../components/chat/chat-menu/ChatMenu';
import type {ChatItem, ChatNotification, Message, UserItem} from '../../types/chat';
import {chatService} from '../../services/chatService';

export const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useAuth();
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const [loading, setLoading] = useState(false);

    // Load chats on component mount
    useEffect(() => {
        if (!authContext.isLoading && authContext.user === null) {
            navigate('/login');
            return;
        }

        if (authContext.user) {
            loadChats();
        }
    }, [authContext.isLoading, authContext.user, navigate]);

    const loadChats = async () => {
        try {
            setLoading(true);
            const chatsData = await chatService.getChats();
            setChats(chatsData.chats);
        } catch (err) {
            console.error('Failed to load chats:', err);
        } finally {
            setLoading(false);
        }
    };

    const createChat = async (user: UserItem): Promise<ChatItem> => {
        try {
            const chatItem = await chatService.createPrivateChat(Number.parseInt(user.id));
            // Add new chat to the beginning of the list
            setChats(prev => [chatItem, ...prev]);
            return chatItem;
        } catch (err) {
            console.error('Failed to create chat:', err);
            throw err;
        }
    };

    const handleChatSelect = async (chat: ChatItem) => {
        setSelectedChat(chat);

        // TODO: Load messages for the selected chat
        const chatMessages = await chatService.getChatMessages(chat.id);
        setMessages(chatMessages.content);
    };

    const handleNewMessage = (msg: Message) => {
        setMessages(prevMessages => [...prevMessages, msg]);
    };

    const handleChatNotification = useCallback((notification: ChatNotification) => {
        const target = chats.find((c) => c.id === notification.chatId);
        if (!target) {
            // TODO: handle new chat
            return;
        }
        const updatedChat = {
            ...target,
            lastMessage: notification.lastMessage,
            lastMessageAt: notification.lastMessageAt
        }
        const filteredChats = chats.filter(chat => chat.id !== target.id);
        setChats([updatedChat, ...filteredChats]);
    }, [chats]);

    const currentUser = authContext.user;
    if (currentUser === null) return null;

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
            <ChatMenu
                chats={chats}
                selectedChatId={selectedChat?.id}
                onChatSelect={handleChatSelect}
                onChatCreate={createChat}
                loading={loading}
            />
            <ChatWindow
                user={currentUser}
                messages={messages}
                chat={selectedChat}
                onNewMessage={handleNewMessage}
                onNewNotification={handleChatNotification}
            />
        </Container>
    );
}