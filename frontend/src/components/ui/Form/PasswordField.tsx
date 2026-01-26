import React, {useState} from 'react';
import {
    TextField as MuiTextField,
    FormControl,
    FormLabel,
    FormHelperText,
    InputAdornment,
    IconButton,
} from '@mui/material';
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface PasswordFieldProps {
    label: string;
    name: string;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
                                                                label,
                                                                name,
                                                                error = false,
                                                                helperText,
                                                                required = false,
                                                                placeholder,
                                                                autoFocus = false,
                                                                value,
                                                                onChange,
                                                            }) => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <FormControl fullWidth>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <MuiTextField
                id={name}
                name={name}
                type={showPassword ? "text" : "password"}
                error={error}
                placeholder={placeholder}
                autoComplete="current-password"
                autoFocus={autoFocus}
                required={required}
                fullWidth
                variant="outlined"
                value={value}
                onChange={onChange}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }
                }}
            />
            {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
        </FormControl>
    );
};