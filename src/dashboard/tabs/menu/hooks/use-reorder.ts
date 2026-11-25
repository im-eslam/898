import { useEffect, useRef, useState } from "react";
import { isSameOrder, moveId } from "../lib/reorder";

// The new order shows on the spot, so several moves in a row all land and nothing waits.
// Saves go out one at a time. Moves made while a save is running are kept, and the newest
// order is sent as soon as the running save finishes, so the server never ends up with an
// older order after a newer one.
export function useReorder(
  serverIds: readonly number[],
  save: (ids: number[]) => Promise<unknown>
) {
  const serverKey = serverIds.join(",");
  const [order, setOrder] = useState<number[]>(() => [...serverIds]);
  const [isSaving, setIsSaving] = useState(false);

  const orderRef = useRef(order);
  const serverRef = useRef<readonly number[]>(serverIds);
  serverRef.current = serverIds;
  const queuedRef = useRef<number[] | null>(null);
  const runningRef = useRef(false);
  const saveRef = useRef(save);
  saveRef.current = save;

  const apply = (next: number[]) => {
    orderRef.current = next;
    setOrder(next);
  };

  const drain = async () => {
    runningRef.current = true;
    setIsSaving(true);
    while (queuedRef.current !== null) {
      const next = queuedRef.current;
      queuedRef.current = null;
      try {
        await saveRef.current(next);
      } catch {
        // The mutation hook shows the error. Put the list back to what the server has.
        queuedRef.current = null;
        apply([...serverRef.current]);
        break;
      }
    }
    runningRef.current = false;
    setIsSaving(false);
  };

  // Queues a whole new order and starts saving it if nothing is in flight.
  const replace = (next: number[]) => {
    if (isSameOrder(orderRef.current, next)) return;
    apply(next);
    queuedRef.current = next;
    if (!runningRef.current) void drain();
  };

  const move = (id: number, direction: -1 | 1) => {
    const current = orderRef.current;
    const index = current.indexOf(id);
    if (index === -1) return;
    replace(moveId(current, index, direction));
  };

  // Follow the server only when nothing is waiting to be saved, so a refetch
  // never pulls the list back to an older order mid-save.
  useEffect(() => {
    if (runningRef.current || queuedRef.current !== null) return;
    apply([...serverIds]);
    // Only a change to the server list should trigger this sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverKey]);

  return { order, isSaving, move, replace };
}
