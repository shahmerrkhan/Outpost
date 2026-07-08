"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes } from "react";

export default function AnimatedButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={{ scale: 1.035, y: -1 }}
      whileTap={{ scale: 0.96, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.5 }}
      {...(props as any)}
    />
  );
}