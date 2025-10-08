import React, {useEffect, useState} from 'react';
import {
    Box,
    TextField,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Avatar,
    Typography,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type {ChatItem, UserItem} from "../../types/chat";
import {chatService} from "../../services/chatService";


interface SideBarProps {
    onChatSelect: (chat: ChatItem) => void;
    selectedChatId?: string;
}

export const SideBar: React.FC<SideBarProps> = ({onChatSelect, selectedChatId}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [searchResults, setSearchResults] = useState<UserItem[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        if (searchTerm.trim()) {
            searchUsers(searchTerm);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [searchTerm]);

    const loadChats = async () => {
        try {
            const chatsData = await chatService.getChats();
            setChats(chatsData.chats);
        } catch (e) {
            console.error('Failed to load chats:', e);
        }
    };

    const searchUsers = async (username: string) => {
        try {
            setIsSearching(true);
            const users = await chatService.searchUsers(username);
            setSearchResults(users);
        } catch (e) {
            console.error('Failed to search users:', e);
            setSearchResults([]);
        }
    };

    const handleUserSelect = async (user: UserItem) => {
        try {
            const chatItem = await chatService.createPrivateChat(Number.parseInt(user.id));
            setChats(prev => [chatItem, ...prev]);
            onChatSelect(chatItem);
            setSearchTerm('');
            setSearchResults([]);
        } catch (e) {
            console.error('Failed to create chat:', e);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});
        } else {
            return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
        }
    };

    return (
        <Box
            sx={{
                width: 320,
                height: '100vh',
                borderRight: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper'
            }}
        >
            {/* Search Bar */}
            <Box sx={{p: 2, pb: 1}}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action"/>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        }
                    }}
                />
            </Box>

            {/* Chat/User List */}
            <List
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    py: 0,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'divider',
                        borderRadius: '4px',
                    },
                }}
            >
                {isSearching ? (
                    // Search results - users
                    searchResults.map((user) => (
                        <ListItem key={user.id} disablePadding>
                            <ListItemButton
                                onClick={() => handleUserSelect(user)}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        mr: 2,
                                    }}
                                >
                                    {user.username.charAt(0)}
                                </Avatar>
                                <Box sx={{flex: 1, minWidth: 0}}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 'medium',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {user.username}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Start new chat
                                    </Typography>
                                </Box>
                            </ListItemButton>
                        </ListItem>
                    ))
                ) : (
                    // Existing chats
                    chats.map((chat) => (
                        <ListItem key={chat.id} disablePadding>
                            <ListItemButton
                                selected={selectedChatId === chat.id}
                                onClick={() => onChatSelect(chat)}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '&.Mui-selected': {
                                        backgroundColor: 'action.selected',
                                        '&:hover': {
                                            backgroundColor: 'action.selected',
                                        }
                                    }
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        mr: 2,
                                        position: 'relative',
                                        '&::after': chat.isOnline ? {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: 2,
                                            right: 2,
                                            width: 12,
                                            height: 12,
                                            backgroundColor: 'success.main',
                                            borderRadius: '50%',
                                            border: '2px solid',
                                            borderColor: 'background.paper'
                                        } : {}
                                    }}
                                >
                                    {chat.title.charAt(0)}
                                </Avatar>

                                <Box sx={{flex: 1, minWidth: 0}}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 0.5
                                    }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 'medium',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {chat.title}
                                        </Typography>
                                        {chat.lastMessageAt && (
                                            <Typography variant="caption" color="text.secondary">
                                                {formatTime(chat.lastMessageAt)}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                flex: 1
                                            }}
                                        >
                                            {chat.lastMessage}
                                        </Typography>

                                        {chat.unreadCount > 0 && (
                                            <Box
                                                sx={{
                                                    backgroundColor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                    borderRadius: '50%',
                                                    width: 20,
                                                    height: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    ml: 1
                                                }}
                                            >
                                                {chat.unreadCount}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </ListItemButton>
                        </ListItem>
                    ))
                )}

                {isSearching && searchResults.length === 0 && (
                    <ListItem>
                        <ListItemText
                            primary="No users found"
                            sx={{textAlign: 'center', color: 'text.secondary'}}
                        />
                    </ListItem>
                )}

                {!isSearching && chats.length === 0 && (
                    <ListItem>
                        <ListItemText
                            primary="No chats yet"
                            sx={{textAlign: 'center', color: 'text.secondary'}}
                        />
                    </ListItem>
                )}
            </List>
        </Box>
    );
};