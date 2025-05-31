// Hook para exibir notificações

import { useState } from "react";
import { Snackbar, Alert } from "@mui/material";

type ToastSeverity = "success" | "error" | "info" | "warning";

export function useToast() {
  const [toastState, setToastState] = useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (
    message: string,
    severity: ToastSeverity = "success"
  ) => {
    setToastState({ open: true, message, severity });
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setToastState((prev) => ({ ...prev, open: false }));
  };

  const ToastComponent = (
    <Snackbar
      open={toastState.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={toastState.severity}
        sx={{ width: "100%" }}
      >
        {toastState.message}
      </Alert>
    </Snackbar>
  );

  return { showToast, ToastComponent };
}