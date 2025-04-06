"use client";

import Heading from "@/components/custom/heading";
import { WordRotate } from "@/components/magicui/word-rotate";
import HowItWorks from "@/components/custom/how-it-works";
import Footer from "@/components/custom/footer";

export default function HomePage() {
  return (
    <>
      <Heading />
      <main>
        <section
          id="hero"
          className="min-h-screen px-4 md:px-8 lg:px-16 py-20 flex flex-col"
        >
          <h1 className="text-3xl font-black">
            deship makes scholarships more{" "}
            <WordRotate
              duration={3000}
              className="text-4xl text-highlight"
              words={["EQUAL", "SIMPLE", "TRANSPARENT"]}
            />
          </h1>
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

        {/* Tech Stack Section, describing the solution architecture */}
        <section id="tech-stack" className="px-4 md:px-8 lg:px-16 py-20">
          {/* Can only be done after we finalized the assignment */}
        </section>
      </main>
      <Footer />
    </>
  );
}
