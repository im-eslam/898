import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 640px)";

// One MediaQueryList for the whole app. Creating a new one per call allocated on every
// render of every open dialog.
let mediaList: MediaQueryList | null = null;

function getMedia(): MediaQueryList | null {
  if (typeof window === "undefined") return null;
  mediaList ??= window.matchMedia(QUERY);
  return mediaList;
}

function subscribe(onChange: () => void) {
  const media = getMedia();
  media?.addEventListener("change", onChange);
  return () => media?.removeEventListener("change", onChange);
}

function getSnapshot() {
  return getMedia()?.matches ?? false;
}

function getServerSnapshot() {
  return false;
}

// From the sm breakpoint (640 px) up, dialogs are centred. Below it they are bottom sheets.
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
