import { Suspense, lazy, useEffect, useRef, useState } from "react";

import { CANVAS_H, CANVAS_W, useVinetka } from "@/lib/vinetka-store";

const PageStage = lazy(() => import("./PageStage"));

function CanvasSkeleton() {
  return (
    <div
      className="shimmer w-full rounded-xl bg-secondary/70"
      style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
    />
  );
}

export function CanvasArea() {
  const pages = useVinetka((s) => s.pages);
  const activePage = useVinetka((s) => s.activePage);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / CANVAS_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex-1 overflow-auto p-4">
      <div ref={wrapRef} className="mx-auto w-full max-w-5xl">
        <div
          className="overflow-hidden rounded-xl"
          style={{ boxShadow: "var(--shadow-panel)", width: CANVAS_W * scale, height: CANVAS_H * scale }}
        >
          <Suspense fallback={<CanvasSkeleton />}>
            {pages.map((page, i) => (
              <div key={page.id} style={{ display: i === activePage ? "block" : "none" }}>
                <PageStage page={page} interactive={i === activePage} scale={scale} />
              </div>
            ))}
          </Suspense>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Rasmni suring, burchaklaridan tortib o'lchamini o'zgartiring. Mobilda barmoq bilan ham ishlaydi.
        </p>
      </div>
    </div>
  );
}
