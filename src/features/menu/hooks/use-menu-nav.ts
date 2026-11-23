import { useCallback, useEffect, useMemo, useState } from "react";
import { useScrollSpy } from "@raddix/use-scroll-spy";

const FALLBACK_HEADER_PX = 104;
const USER_SCROLL_EVENTS = ["wheel", "touchmove", "keydown"] as const;

function useHeaderHeight(): number {
  const [height, setHeight] = useState(FALLBACK_HEADER_PX);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const update = () =>
      setHeight(Math.round(header.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return height;
}

export function useMenuNav(sectionIds: string[]) {
  const headerHeight = useHeaderHeight();
  const spyOptions = useMemo<IntersectionObserverInit>(
    () => ({ rootMargin: `-${headerHeight}px 0px -65% 0px` }),
    [headerHeight]
  );
  const spiedId = useScrollSpy(sectionIds, spyOptions);

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
    for (const type of USER_SCROLL_EVENTS) {
      window.addEventListener(type, release, { passive: true });
    }
    return () => {
      for (const type of USER_SCROLL_EVENTS) {
        window.removeEventListener(type, release);
      }
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
