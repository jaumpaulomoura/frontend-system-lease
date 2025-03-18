import React from "react";
import { FieldError } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";

interface Props extends Omit<TextFieldProps, "error" | "helperText"> {
  name: string;
  label?: string;
  error?: FieldError;
  format?: string;
}

const InputForm: React.FC<Props> = ({
  name,
  label,
  error,
  format,
  ...props
}) => {
  return (
    <TextField
      {...props}
      name={name}
      label={label}
      error={!!error} // Se houver erro, o campo terá o estilo de erro
      helperText={error?.message} // Exibe a mensagem de erro
      fullWidth
      variant="outlined" // Estilo do MUI
      margin="normal"
    />
  );
};

export type { InputForm, Props as InputFormProps };

export default InputForm;
