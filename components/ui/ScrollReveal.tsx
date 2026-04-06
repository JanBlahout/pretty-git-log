"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Props {
	children: React.ReactNode;
	className?: string;
	delay?: number;
	direction?: "up" | "left" | "none";
}

export function ScrollReveal({
	children,
	className,
	delay = 0,
	direction = "up",
}: Props) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, margin: "-80px" });

	const initial =
		direction === "up"
			? { opacity: 0, y: 40 }
			: direction === "left"
				? { opacity: 0, x: -40 }
				: { opacity: 0 };

	return (
		<motion.div
			ref={ref}
			className={className}
			initial={initial}
			animate={inView ? { opacity: 1, x: 0, y: 0 } : initial}
			transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
		>
			{children}
		</motion.div>
	);
}
