import React from 'react';
import MuiCard from "@mui/material/Card";
import {styled} from "@mui/material/styles";

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const StyledCard = styled(MuiCard)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '450px',
    },
}));

export const Card: React.FC<CardProps> = ({children, className}) => {
    return <StyledCard className={className}>{children}</StyledCard>;
}