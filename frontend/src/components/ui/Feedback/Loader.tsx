import React from 'react';
import {CircularProgress, ListItem} from '@mui/material';

export const Loader: React.FC = () => {
    return (
        <ListItem sx={{justifyContent: 'center'}}>
            <CircularProgress size={24}/>
        </ListItem>
    )
};