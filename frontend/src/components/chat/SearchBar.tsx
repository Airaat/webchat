import React from 'react';
import {TextField, InputAdornment} from '@mui/material';
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
    );
};