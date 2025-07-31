import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export const AnimatedCard = ({ 
  children, 
  className, 
  delay = 0, 
  direction = "up" 
}: AnimatedCardProps) => {
  const directionOffset = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { y: 0, x: 60 },
    right: { y: 0, x: -60 },
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50",
        "bg-background/80 backdrop-blur-sm",
        "shadow-lg shadow-primary/5",
        className
      )}
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 1.11, 0.81, 0.99],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};