import { useCallback, useEffect, useState } from "react";
import { useScrollSpy } from "@raddix/use-scroll-spy";
import { PIN_FALLBACK_MS, SCROLL_SPY_OPTIONS } from "../data";

export function useMenuNav(sectionIds: string[]) {
  const spiedId = useScrollSpy(sectionIds, SCROLL_SPY_OPTIONS);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const checkBottom = () => {
      const page = document.documentElement;
      const canScroll = page.scrollHeight > window.innerHeight + 2;
      setAtBottom(
        canScroll &&
          window.scrollY + window.innerHeight >= page.scrollHeight - 2
      );
    };

    checkBottom();
    window.addEventListener("scroll", checkBottom, { passive: true });
    window.addEventListener("resize", checkBottom);
    return () => {
      window.removeEventListener("scroll", checkBottom);
      window.removeEventListener("resize", checkBottom);
    };
  }, []);

  useEffect(() => {
    if (pinnedId === null) return;

    const release = () => setPinnedId(null);
    window.addEventListener("scrollend", release);
    const timer = window.setTimeout(release, PIN_FALLBACK_MS);

    return () => {
      window.removeEventListener("scrollend", release);
      window.clearTimeout(timer);
    };
  }, [pinnedId]);

  const select = useCallback((sectionId: string) => {
    setPinnedId(sectionId);
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const lastId = sectionIds[sectionIds.length - 1] ?? "";
  const activeId =
    pinnedId ?? (atBottom ? lastId : spiedId || sectionIds[0] || "");

  return { activeId, select };
}
