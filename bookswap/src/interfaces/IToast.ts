export type ToastType = "error" | "success" | "info";

export interface IToast {
  id: string;
  message: string;
  type: ToastType;
  leaving: boolean;
}

export interface IToastContextType {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

export interface IToastProps {
  toasts: IToast[];
  onClose: (id: string) => void;
}
