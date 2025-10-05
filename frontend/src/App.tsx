import {ThemeProvider} from '@mui/material/styles';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {LoginPage} from './pages/auth/LoginPage';
import {theme} from './styles/theme';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/" element={<LoginPage/>}/>
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;