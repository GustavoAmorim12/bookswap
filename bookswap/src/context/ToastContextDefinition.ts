import { createContext } from "react";
import type { IToastContextType } from "../interfaces/IToast";

export const ToastContext = createContext<IToastContextType | undefined>(
  undefined,
);
