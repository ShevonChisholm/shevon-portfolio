"use client";

import {
  Alert,
  Box,
  Collapse,
  IconButton,
  Portal,
  Stack,
  type AlertColor,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type AdminNotificationVariant = Extract<
  AlertColor,
  "success" | "error" | "warning" | "info"
>;

export type AdminNotificationMessage = {
  type: AdminNotificationVariant;
  text: string;
};

type NotificationOptions = {
  variant?: AdminNotificationVariant;
  autoHideDuration?: number;
};

type Notification = {
  id: number;
  message: string;
  variant: AdminNotificationVariant;
  autoHideDuration: number;
};

type AdminNotificationsContextValue = {
  enqueueNotification: (
    message: string,
    options?: NotificationOptions
  ) => number;
  closeNotification: (id: number) => void;
};

const AdminNotificationsContext =
  createContext<AdminNotificationsContextValue | null>(null);

function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: (id: number) => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(
      () => onClose(notification.id),
      notification.autoHideDuration
    );

    return () => window.clearTimeout(timeout);
  }, [notification, onClose]);

  return (
    <Collapse in>
      <Alert
        severity={notification.variant}
        variant="filled"
        elevation={8}
        action={
          <IconButton
            aria-label="Dismiss notification"
            color="inherit"
            size="small"
            onClick={() => onClose(notification.id)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          width: "100%",
          alignItems: "center",
          borderRadius: 1.5,
          boxShadow: 8,
          "& .MuiAlert-message": {
            minWidth: 0,
            overflowWrap: "anywhere",
          },
        }}
      >
        {notification.message}
      </Alert>
    </Collapse>
  );
}

export function AdminNotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const nextId = useRef(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const closeNotification = useCallback((id: number) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  }, []);

  const enqueueNotification = useCallback(
    (message: string, options: NotificationOptions = {}) => {
      const id = ++nextId.current;
      const variant = options.variant ?? "info";
      const autoHideDuration =
        options.autoHideDuration ?? (variant === "error" ? 8000 : 5000);

      setNotifications((current) => [
        ...current.slice(-3),
        { id, message, variant, autoHideDuration },
      ]);

      return id;
    },
    []
  );

  return (
    <AdminNotificationsContext.Provider
      value={{ enqueueNotification, closeNotification }}
    >
      {children}
      <Portal>
        <Box
          aria-live="polite"
          sx={{
            position: "fixed",
            zIndex: (theme) => theme.zIndex.snackbar,
            top: { xs: 76, sm: 88 },
            right: { xs: 12, sm: 20 },
            left: { xs: 12, sm: "auto" },
            width: { xs: "auto", sm: 420 },
            maxWidth: "calc(100vw - 24px)",
            pointerEvents: "none",
          }}
        >
          <Stack spacing={1.25}>
            {notifications.map((notification) => (
              <Box key={notification.id} sx={{ pointerEvents: "auto" }}>
                <NotificationItem
                  notification={notification}
                  onClose={closeNotification}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Portal>
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationsContext);

  if (!context) {
    throw new Error(
      "useAdminNotifications must be used inside AdminNotificationsProvider."
    );
  }

  return context;
}

export function AdminNotificationBridge({
  message,
}: {
  message: AdminNotificationMessage | null;
}) {
  const { enqueueNotification } = useAdminNotifications();
  const lastMessage = useRef("");

  useEffect(() => {
    if (!message) {
      lastMessage.current = "";
      return;
    }

    const signature = `${message.type}:${message.text}`;
    if (lastMessage.current === signature) return;

    lastMessage.current = signature;
    enqueueNotification(message.text, { variant: message.type });
  }, [enqueueNotification, message]);

  return null;
}
