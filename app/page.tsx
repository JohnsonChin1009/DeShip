"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Heading from "@/components/custom/heading";
import { WordRotate } from "@/components/magicui/word-rotate";
import HowItWorks from "@/components/custom/how-it-works";
import TechStack from "@/components/custom/tech-stack";
import Team from "@/components/custom/team";
import Footer from "@/components/custom/footer";
import IntroAnimation from "@/components/custom/intro-animation";
import { ParticlesBackground } from "@/components/ui/particles-background";

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <Heading />
        <main>
          <section
            id="hero"
            className="min-h-screen px-4 md:px-8 lg:px-16 py-20 flex flex-col justify-center relative overflow-hidden"
          >
            <ParticlesBackground />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white">
                    deship makes scholarships more{" "}
                    <WordRotate
                      duration={3000}
                      className="text-5xl md:text-6xl lg:text-7xl text-highlight inline-block"
                      words={["EQUAL", "SIMPLE", "TRANSPARENT"]}
                    />
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 max-w-3xl font-medium">
                    A decentralized platform revolutionizing scholarship applications through blockchain technology and zero-knowledge proofs.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* why deship section, describing why deship exists */}
          <section
            id="why-deship"
            className="py-20 bg-[#d4d8f0] px-4 flex items-center justify-center text-center text-lg lg:py-[100px]"
          >
            <p className="text-lightbg_text md:text-lg lg:text-2xl lg:max-w-[85%] lg:mx-auto">
              with <span className="font-black">deship</span>, we aim to provide a
              platform that ensures{" "}
              <span className="word-block py-1 lg:py-2 px-2 lg:px-4 bg-[#D3E9F0] hover:rotate-[10deg]">
                fair
              </span>{" "}
              opportunities for students to apply for{" "}
              <span className="word-block py-1 lg:py-2 px-2 lg:px-4 bg-[#D8D3F0] hover:rotate-[-8deg] ">
                scholarships
              </span>
              . we believe that every student should have the same chance to apply
              for scholarships, regardless of their{" "}
              <span className="word-block py-1 lg:py-2 px-2 lg:px-4 bg-[#E1D3F0] hover:rotate-[8deg]">
                demographic
              </span>{" "}
              background.
            </p>
          </section>

          {/* How it Works section, describing how the user flow is */}
          <section id="how-it-works" className="px-4 md:px-8 lg:px-16 py-20">
            <h1 className="text-4xl font-black text-center pb-10">
              How It Works
            </h1>
            <HowItWorks />
          </section>

          {/* Tech Stack Section */}
          <section id="tech-stack" className="px-4 md:px-8 lg:px-16 py-20 bg-[#d4d8f0]">
            <h2 className="text-4xl font-black text-center pb-10 text-lightbg_text">
              Our Technology Stack
            </h2>
            <TechStack />
          </section>

          {/* Team Section */}
          <section id="team" className="px-4 md:px-8 lg:px-16 py-20">
            <h1 className="text-4xl font-black text-center pb-10">
              Our Team
            </h1>
            <Team />
          </section>
        </main>
        <Footer />
      </motion.div>
    </>
  );
}
