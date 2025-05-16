"use client";

import { Accordion, AccordionContent, AccordionTrigger, AccordionItem } from "@/components/ui/accordion";
import { stepsData } from "@/data/howItWorks";
import Image from "next/image";

export default function HowItWorks() {
    const defaultOpenItems = stepsData.map((step) => step.id);
    return (
        <>
            <Accordion type="multiple" defaultValue={defaultOpenItems}>
                {stepsData.map((step) => (
                    <AccordionItem key={step.id} value={step.id} className="px-4 lg:max-w-[70%] lg:mx-auto lg:py-20">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2 lg:gap-6 self-start font-semibold text-lg md:text-2xl lg:text-3xl text-highlight">
                                <p>{step.id}</p>
                                <div className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-[100%] lg:w-full text-center">
                                    {step.title}
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm md:text-base lg:min-h-[100%]">
                            <div className="flex flex-col gap-6 md:gap-10 py-2 md:py-0 md:flex-row justify-between lg:flex-col lg:items-center lg:text-start">
                                <div className="md:flex md:flex-col justify-between md:max-w-[40%] md:py-2 lg:text-xl lg:font-medium lg:max-w-[100%]">
                                    <p className="text-start">{step.description}</p>
                                    <p className="italic text-[#D8D8D8] hidden md:block lg:hidden">{step.secondDescription}</p>
                                </div>
                                <div className="relative group mx-auto">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative bg-black/90 rounded-lg p-1 w-[280px] sm:w-[300px] md:w-[400px] lg:w-[600px] lg:h-[400px] h-[280px] sm:h-[300px] overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg"></div>
                                        <Image
                                            src={step.image}
                                            alt={step.title}
                                            fill
                                            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                </div>
                                <p className="italic text-[#D8D8D8] md:hidden lg:block">{step.secondDescription}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    )
}