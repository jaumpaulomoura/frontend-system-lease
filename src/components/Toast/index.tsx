import React from "react";
import {
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineInfoCircle,
  AiOutlineWarning,
} from "react-icons/ai";
import { Snackbar, Alert, IconButton, Box, Typography } from "@mui/material";
import { ToastProps } from "@tp/ToastProps";

export function Toast({
  title,
  description,
  status,
  footerComponent,
}: ToastProps) {
  const statuses: any = {
    success: {
      color: "success.main",
      icon: <AiOutlineCheckCircle fontSize="35px" />,
    },
    error: {
      color: "error.main",
      icon: <AiOutlineWarning fontSize="35px" />,
    },
    warning: {
      color: "warning.main",
      icon: <AiOutlineWarning fontSize="35px" />,
    },
    info: {
      color: "info.main",
      icon: <AiOutlineInfoCircle fontSize="35px" />,
    },
  };

  return (
    <Snackbar
      open={true} // Aqui, você pode controlar se o Toast está visível ou não
      autoHideDuration={6000} // Tempo para o toast desaparecer automaticamente
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // Posição do Toast
    >
      <Alert
        severity={status}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
          borderLeft: `8px solid ${statuses[status].color}`,
          borderRadius: 1,
          padding: "12px",
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {} /* Função para fechar o Toast */}
          >
            <AiOutlineCloseCircle fontSize="16px" />
          </IconButton>
        }
      >
        <Box display="flex" alignItems="center">
          <Box marginRight="10px">{statuses[status].icon}</Box>
          <Box>
            <Typography
              variant="body2"
              color={statuses[status].color}
              fontWeight="bold"
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
            {footerComponent && footerComponent}
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
}

export default Toast;
