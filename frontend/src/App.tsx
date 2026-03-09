import {ThemeProvider} from '@mui/material/styles';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {LoginPage} from './pages/auth/LoginPage';
import {SignUpPage} from "./pages/auth/SignUpPage";
import {ChatPage} from './pages/chat/ChatPage';
import {theme} from './styles/theme';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

function App() {
    return (
        <QueryClientProvider client={new QueryClient}>
            <ThemeProvider theme={theme}>
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<LoginPage/>}/>
                            <Route path="/login" element={<LoginPage/>}/>
                            <Route path="/signup" element={<SignUpPage/>}/>
                            <Route path="/chat" element={<ChatPage/>}/>
                        </Routes>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;