import { AnimatePresence, motion } from "framer-motion";

export function ExportOverlay({ open, percent }: { open: boolean; percent: number }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-background/85 backdrop-blur-md"
        >
          <div className="relative w-[min(420px,90vw)] text-center">
            <div className="relative mx-auto mb-8 h-32 w-full">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-4 h-24 w-18 rounded-lg border border-primary/60 bg-secondary"
                  style={{ width: 72 }}
                  initial={{ x: -36, y: 20, rotate: 0, opacity: 0 }}
                  animate={{
                    x: [-36, -36 + (i - 1.5) * 70],
                    y: [20, 0],
                    rotate: [(i - 1.5) * 10, (i - 1.5) * 12],
                    opacity: 1,
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.12,
                    ease: "easeInOut",
                  }}
                >
                  <div className="shimmer h-full w-full rounded-lg" />
                </motion.div>
              ))}
            </div>

            <h3 className="text-lg font-semibold">Vinetkangiz tayyorlanmoqda...</h3>
            <p className="mt-1 text-sm text-muted-foreground">Yuqori sifatli fayl yaratilmoqda</p>

            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gradient-gold)" }}
                animate={{ width: `${percent}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">{percent}%</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
