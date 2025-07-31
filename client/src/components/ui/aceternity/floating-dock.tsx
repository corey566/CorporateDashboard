import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingDockProps {
  items: Array<{
    title: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
  }>;
  className?: string;
}

export const FloatingDock = ({ items, className }: FloatingDockProps) => {
  return (
    <motion.div
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
        "bg-background/80 backdrop-blur-lg border border-border rounded-2xl p-2",
        "shadow-lg shadow-primary/10",
        className
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-2">
        {items.map((item, index) => (
          <motion.button
            key={index}
            className={cn(
              "relative flex items-center justify-center",
              "w-12 h-12 rounded-xl",
              "bg-muted hover:bg-primary/10",
              "transition-all duration-200",
              "group"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={item.onClick}
          >
            {item.icon}
            <AnimatePresence>
              <motion.div
                className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-foreground text-background px-2 py-1 rounded text-xs whitespace-nowrap">
                  {item.title}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};