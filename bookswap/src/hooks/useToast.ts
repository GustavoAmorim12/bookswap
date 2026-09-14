import { useContext } from "react";
import { ToastContext } from "../context/ToastContextDefinition";

export function useToast() {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast precisa ser usado dentro de um ToastProvider");
  return context;
}
