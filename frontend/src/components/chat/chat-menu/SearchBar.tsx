import React from 'react';
import {TextField, InputAdornment, Box} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
    return (
        <Box sx={{p: 2, pb: 1}}>
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
        </Box>
    );
};