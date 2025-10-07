import React, {useState} from 'react';
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
import type {ChatItem} from "../../types/chat";


interface SideBarProps {
    onChatSelect: (chat: ChatItem) => void;
    selectedChatId?: string;
}

// Mock data - replace with actual data from your API
const mockChatUsers: ChatItem[] = [
    {
        id: '1',
        name: 'John Doe',
        lastMessage: 'Hello there!',
        lastMessageTime: new Date(),
        unreadCount: 2,
        isOnline: true
    },
    {
        id: '2',
        name: 'Jane Smith',
        lastMessage: 'How are you?',
        lastMessageTime: new Date(Date.now() - 3600000),
        unreadCount: 0,
        isOnline: false
    },
    {
        id: '3',
        name: 'Mike Johnson',
        lastMessage: 'See you tomorrow',
        lastMessageTime: new Date(Date.now() - 86400000),
        unreadCount: 1,
        isOnline: true
    },
    // Add more mock users up to 20 or more for testing scroll
    ...Array.from({length: 17}, (_, i) => ({
        id: (i + 4).toString(),
        name: `User ${i + 4}`,
        lastMessage: `Last message from user ${i + 4}`,
        lastMessageTime: new Date(Date.now() - (i * 3600000)),
        unreadCount: i % 3,
        isOnline: i % 2 === 0
    }))
];

export const SideBar: React.FC<SideBarProps> = ({onChatSelect, selectedChatId}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [chats] = useState<ChatItem[]>(mockChatUsers);

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
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
                    placeholder="Search chats..."
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

            {/* Chat List */}
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
                {filteredChats.slice(0, 20).map((chat) => (
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
                                {chat.name.charAt(0)}
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
                                        {chat.name}
                                    </Typography>
                                    {chat.lastMessageTime && (
                                        <Typography variant="caption" color="text.secondary">
                                            {formatTime(chat.lastMessageTime)}
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
                ))}

                {filteredChats.length === 0 && (
                    <ListItem>
                        <ListItemText
                            primary="No chats found"
                            sx={{textAlign: 'center', color: 'text.secondary'}}
                        />
                    </ListItem>
                )}
            </List>
        </Box>
    );
};