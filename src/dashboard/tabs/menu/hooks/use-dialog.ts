import { useCallback, useState } from "react";

// Open and close state for a form or confirm dialog.
//
// `session` changes on every open and never on close. Use it as the dialog's `key`.
// Keying on the item or on "closed" remounts the dialog the moment it closes, which
// cuts the exit animation and drops the sheet on phones. A new key on open gives each
// open a fresh form with its own initial values.
//
// `target` is the item being edited, or undefined for "new".
export function useDialog<T = void>() {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<T | undefined>(undefined);
  const [session, setSession] = useState(0);

  const open = useCallback((next?: T) => {
    setSession((n) => n + 1);
    setTarget(next);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, target, session, open, close };
}
