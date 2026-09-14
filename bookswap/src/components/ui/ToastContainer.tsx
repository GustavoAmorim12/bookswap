import type { IToastProps } from "../../interfaces/IToast";

export default function ToastContainer({ toasts, onClose }: IToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg border-l-4 bg-white p-4 shadow-lg
            ${toast.type === "error" ? "border-red-500" : "border-green-500"}
            ${toast.leaving ? "animate-[toast-out_0.3s_ease-in_forwards]" : "animate-[toast-in_0.3s_ease-out]"}`}
        >
          <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
          <button
            onClick={() => onClose(toast.id)}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
