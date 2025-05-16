"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface IntroAnimationProps {
    onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
    const [showSkip, setShowSkip] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const skipTimer = setTimeout(() => {
            setShowSkip(true);
        }, 1000);

        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 2000);

        const completeTimer = setTimeout(() => {
            onComplete();
        }, 3500);

        return () => {
            clearTimeout(skipTimer);
            clearTimeout(exitTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="fixed inset-0 bg-black z-50 flex items-center justify-center"
                initial={{ opacity: 1 }}
                animate={{
                    opacity: isExiting ? 0 : 1,
                    pointerEvents: isExiting ? "none" : "auto",
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            >
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.h1
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-7xl font-black text-white mb-4"
                    >
                        deShip
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-xl text-gray-300"
                    >
                        Making scholarships more accessible
                    </motion.p>
                </motion.div>

                {showSkip && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        onClick={onComplete}
                    >
                        Skip
                    </motion.button>
                )}
            </motion.div>
        </AnimatePresence>
    );
} 