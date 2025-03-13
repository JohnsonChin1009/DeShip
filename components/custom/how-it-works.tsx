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
                    <AccordionItem key={step.id} value={step.id} className="lg:max-w-[70%] lg:mx-auto lg:py-20">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2 lg:gap-6 self-start font-semibold text-xl md:text-2xl lg:text-3xl text-highlight">
                                <p>{step.id}</p>
                                <div className="truncate max-w-[300px] md:max-w-[100%] lg:w-full text-center">
                                    {step.title}
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-base lg:min-h-[100%]">
                            <div className="flex flex-col gap-10 py-2 md:py-0 md:flex-row justify-between lg:flex-col lg:items-center lg:text-start">
                                <div className="md:flex md:flex-col justify-between md:max-w-[40%] md:py-2 lg:text-xl lg:font-medium lg:max-w-[100%]"> 
                                    <p className="text-start">{step.description}</p>
                                    <p className="italic text-[#D8D8D8] hidden md:block lg:hidden">{step.secondDescription}</p>
                                </div>
                                <div className="self-center border-2 border-stroke w-[300px] md:w-[400px] lg:w-[600px] lg:h-[400px] h-[300px] relative"> {/* Content in the form of GIF/Image */}
                                    <Image 
                                        src={step.image}
                                        alt={step.title}
                                        fill
                                        objectFit="contain"
                                        className="object-contain"
                                    />
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