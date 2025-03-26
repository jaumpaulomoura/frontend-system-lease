import React from "react";
import {
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineInfoCircle,
  AiOutlineWarning,
} from "react-icons/ai";
import { Snackbar, Alert, IconButton, Box, Typography } from "@mui/material";

// Definindo o tipo ToastStatus corretamente
type ToastStatus = "success" | "error" | "warning" | "info";

interface ToastProps {
  title: string;
  description: string;
  status: ToastStatus;
  footerComponent?: React.ReactNode;
}

// Definindo os diferentes status e ícones
const statuses: Record<ToastStatus, { color: string; icon: React.ReactNode }> =
  {
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

export function Toast({
  title,
  description,
  status,
  footerComponent,
}: ToastProps) {
  return (
    <Snackbar
      open={true}
      autoHideDuration={6000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={status} // O valor de "status" é agora tipado corretamente para "success", "error", "warning", "info"
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
            onClick={() => {}}
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
