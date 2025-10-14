import React from 'react';
import {ListItem, ListItemButton, Avatar, Typography, Box} from '@mui/material';
import type {UserItem} from '../../../types/chat.ts';

interface UserListItemProps {
    user: UserItem;
    onSelect: (user: UserItem) => void;
}

export const UserListItem: React.FC<UserListItemProps> = React.memo(({user, onSelect}) => {
    return (
        <ListItem disablePadding>
            <ListItemButton
                onClick={() => onSelect(user)}
                sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Avatar sx={{width: 48, height: 48, mr: 2}}>
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
                    <Typography variant="body2" color="text.secondary">
                        Start new chat
                    </Typography>
                </Box>
            </ListItemButton>
        </ListItem>
    );
});