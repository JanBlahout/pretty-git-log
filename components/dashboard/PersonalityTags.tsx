"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";

const TAG_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

interface Props {
  tags: string[];
  narrative: string;
}

export function PersonalityTags({ tags, narrative }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {tags.map((tag, i) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 15 }}
          >
            <Badge color={TAG_COLORS[i % TAG_COLORS.length]}>
              {tag}
            </Badge>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="text-text-secondary leading-[1.7] text-base"
      >
        {narrative}
      </motion.p>
    </div>
  );
}
