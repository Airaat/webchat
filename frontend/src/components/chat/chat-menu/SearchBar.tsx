import React from 'react';
import {TextField, InputAdornment, Box, Button, Tooltip} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import {useChatUIStore} from "../../../store/chatUIStore.ts";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
                                                        value,
                                                        onChange,
                                                        placeholder = "Search users..."
                                                    }) => {
    const openGroupModal = useChatUIStore((s) => s.openGroupCreationModal);

    return (
        <Box sx={{display: "flex", p: 2, pr: 0}}>
            <TextField
                fullWidth
                size="small"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
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
            <Tooltip title="Click to create group chat">
                <Button onClick={openGroupModal}>
                    <GroupAddIcon/>
                </Button>
            </Tooltip>
        </Box>
    );
};