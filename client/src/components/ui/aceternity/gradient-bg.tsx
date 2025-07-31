import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const GradientBackground = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background"
        animate={{
          background: [
            "linear-gradient(45deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1), hsl(var(--background)))",
            "linear-gradient(90deg, hsl(var(--accent) / 0.2), hsl(var(--primary) / 0.1), hsl(var(--background)))",
            "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1), hsl(var(--background)))",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    </div>
  );
};