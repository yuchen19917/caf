import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../lib/utils';

export function PreviewDrawer({ children, label, onClose, width = 'max-w-[52rem]', busy = false }: {
  children: ReactNode;
  label: string;
  onClose: () => void;
  width?: string;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog ref={ref} aria-label={label}
      onCancel={event => {
        event.preventDefault();
        event.stopPropagation();
        if (!busy) onClose();
      }}
      onClick={event => {
        if (busy || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
      className={cn('fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full overflow-hidden border-l border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-900/40', width)}>
      <div className="flex h-full min-h-0 flex-col">{children}</div>
    </dialog>
  );
}
