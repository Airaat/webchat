import React from 'react';
import {
    TextField as MuiTextField,
    FormControl,
    FormLabel,
    FormHelperText,
} from '@mui/material';

interface TextFieldProps {
    label: string;
    name: string;
    type?: string;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    placeholder?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextField: React.FC<TextFieldProps> = ({
                                                        label,
                                                        name,
                                                        type = 'text',
                                                        error = false,
                                                        helperText,
                                                        required = false,
                                                        placeholder,
                                                        autoComplete,
                                                        autoFocus = false,
                                                        value,
                                                        onChange,
                                                    }) => {
    return (
        <FormControl fullWidth>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <MuiTextField
                id={name}
                name={name}
                type={type}
                error={error}
                placeholder={placeholder}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                required={required}
                fullWidth
                variant="outlined"
                value={value}
                onChange={onChange}
            />
            {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
        </FormControl>
    );
};