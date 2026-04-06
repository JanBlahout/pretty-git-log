"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export function CTASection() {
	return (
		<section className="py-32 px-6">
			<div className="max-w-2xl mx-auto text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.1 }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-4xl font-bold mb-4 text-text-primary font-mono">
						Ready to see your story?
					</h2>
					<p className="text-lg mb-8 text-text-secondary">
						Takes 30 seconds. No email required. Just your GitHub account.
					</p>
					<button
						onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
						className="px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-brand text-white"
						style={{ boxShadow: "0 0 40px rgba(139,92,246,0.2)" }}
					>
						Connect GitHub — it&apos;s free
					</button>
				</motion.div>
			</div>
		</section>
	);
}
