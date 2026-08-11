"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useId, useRef, type RefObject } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = "Mantener permiso", triggerRef, onConfirm, onClose }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function closeAndRestoreFocus() {
    onClose();
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); closeAndRestoreFocus(); }} className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-3xl border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/55 backdrop:backdrop-blur-sm">
      <div className="p-6 sm:p-7">
        <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle aria-hidden="true" className="size-6" /></span>
        <h2 id={titleId} className="mt-5 text-xl font-black">{title}</h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={closeAndRestoreFocus} className="secondary-button inline-flex">{cancelLabel}</button>
          <button type="button" onClick={() => { onConfirm(); closeAndRestoreFocus(); }} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700">{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
