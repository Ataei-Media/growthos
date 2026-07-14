"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger index — multiplies the entrance delay for list items. */
  index?: number;
  as?: "div" | "li" | "section";
}

/**
 * Subtle, accessible in-view entrance. Respects `prefers-reduced-motion`
 * (renders statically) and animates only once when scrolled into view.
 */
export function Reveal({ children, className, index = 0, as = "div" }: RevealProps) {
  const reduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: reduceMotion ? 0 : index * 0.07,
      },
    },
  };

  const common = {
    className,
    variants,
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: { once: true, margin: "-80px" } as const,
  };

  if (as === "li") return <motion.li {...common}>{children}</motion.li>;
  if (as === "section") return <motion.section {...common}>{children}</motion.section>;
  return <motion.div {...common}>{children}</motion.div>;
}
