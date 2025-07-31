import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Meteors = ({ number = 20 }: { number?: number }) => {
  const meteors = new Array(number).fill(true);
  
  return (
    <>
      {meteors.map((_, idx) => (
        <motion.span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent"
          )}
          style={{
            top: Math.floor(Math.random() * (400 - -400) + -400) + "px",
            left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: idx * 0.1 }}
        />
      ))}
    </>
  );
};