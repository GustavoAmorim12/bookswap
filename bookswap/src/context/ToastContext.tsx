import { useState, type ReactNode } from "react";
import type { IToast, ToastType } from "../interfaces/IToast";
import { ToastContext } from "./ToastContextDefinition";
import ToastContainer from "../components/ui/ToastContainer";

const EXIT_ANIMATION_DURATION = 300;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<IToast[]>([]);

  function addToast(message: string, type: ToastType) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);

    setTimeout(() => startRemove(id), 5000);
  }

  function startRemove(id: string) {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, leaving: true } : toast,
      ),
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, EXIT_ANIMATION_DURATION);
  }

  function showError(message: string) {
    addToast(message, "error");
  }

  function showSuccess(message: string) {
    addToast(message, "success");
  }

  return (
    <ToastContext.Provider value={{ showError, showSuccess }}>
      {children}
      <ToastContainer toasts={toasts} onClose={startRemove} />
    </ToastContext.Provider>
  );
}
