import { ReactNode, useState, useCallback } from "react";
import { Snackbar, Alert, IconButton, Box } from "@mui/material";
import { AiOutlineCloseCircle } from "react-icons/ai";

type ToastStatus = "success" | "error" | "warning" | "info";

export function useToast() {
  const [open, setOpen] = useState(false);
  const [toastContent, setToastContent] = useState<ReactNode>(null);
  const [status, setStatus] = useState<ToastStatus>("success");
  const [duration, setDuration] = useState(10000); // Default duration

  const showToast = useCallback(
    (
      component: ReactNode,
      type: ToastStatus = "success",
      autoHideDuration: number = 10000
    ) => {
      setToastContent(component);
      setStatus(type);
      setDuration(autoHideDuration);
      setOpen(true);
    },
    []
  );

  const handleClose = () => {
    setOpen(false);
  };

  const ToastComponent = () => (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={status}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
          borderLeft: `8px solid ${
            status === "success"
              ? "green"
              : status === "error"
              ? "red"
              : status === "warning"
              ? "yellow"
              : "blue"
          }`,
          borderRadius: 1,
          padding: "12px",
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <AiOutlineCloseCircle fontSize="16px" />
          </IconButton>
        }
      >
        <Box display="flex" alignItems="center">
          {toastContent}
        </Box>
      </Alert>
    </Snackbar>
  );

  return {
    showToast,
    ToastComponent,
  };
}
