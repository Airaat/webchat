import React from 'react';
import {Container, CssBaseline} from "@mui/material";
import {useAuth} from "../../hooks/useAuth.ts";
import {useNavigate} from "react-router-dom";
import {ChatWindow} from "../../components/chat/ChatWindow.tsx";

export const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useAuth();

    React.useEffect(() => {
        if (!authContext.isLoading && authContext.user === null) {
            navigate('/login');
        }
    }, [authContext.isLoading, authContext.user, navigate]);

    const currentUser = authContext.user;
    if (currentUser === null) return null;


    return (
        <Container>
            <CssBaseline/>
            <ChatWindow user={currentUser}/>
        </Container>
    );
}