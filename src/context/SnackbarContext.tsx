import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Snackbar, { SnackbarType } from '../components/common/Snackbar';

interface SnackbarAction {
  label: string;
  onPress: () => void;
}

interface SnackbarState {
  visible: boolean;
  message: string;
  type: SnackbarType;
  duration: number;
  action?: SnackbarAction;
}

interface SnackbarContextType {
  showSnackbar: (
    message: string,
    type?: SnackbarType,
    options?: { duration?: number; action?: SnackbarAction }
  ) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    visible: false,
    message: '',
    type: 'info',
    duration: 4000,
  });

  const showSnackbar = useCallback(
    (
      message: string,
      type: SnackbarType = 'info',
      options?: { duration?: number; action?: SnackbarAction }
    ) => {
      setSnackbarState({
        visible: true,
        message,
        type,
        duration: options?.duration ?? 4000,
        action: options?.action,
      });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showSnackbar(message, 'success', { duration });
    },
    [showSnackbar]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showSnackbar(message, 'error', { duration: duration ?? 5000 });
    },
    [showSnackbar]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showSnackbar(message, 'warning', { duration });
    },
    [showSnackbar]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showSnackbar(message, 'info', { duration });
    },
    [showSnackbar]
  );

  const hideSnackbar = useCallback(() => {
    setSnackbarState(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <SnackbarContext.Provider
      value={{
        showSnackbar,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideSnackbar,
      }}
    >
      {children}
      <Snackbar
        visible={snackbarState.visible}
        message={snackbarState.message}
        type={snackbarState.type}
        duration={snackbarState.duration}
        action={snackbarState.action}
        onDismiss={hideSnackbar}
      />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export default SnackbarContext;
