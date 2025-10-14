"use client";

import { useState } from "react";
import { Button } from "@heroui/react";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";

const Index = () => {
    const [showImagePopup, setShowImagePopup] = useState(false);
    const [popupImageSrc, setPopupImageSrc] = useState("");

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow bg-gradient-to-b from-background to-background/95">
                <Navbar />
                <div className="container mx-auto px-4 py-6">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r pb-6 from-amber-600 to-emerald-600">
                            Stop Drowning in Job Applications. Start Seeing What Works.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            I developed a system that landed me a 17% cold interview rate (3x the industry average.) But I was so overwhelmed I forgot to update my spreadsheet and even <strong>missed an interview</strong>. I'm building the tool I needed to automate the process and never miss an opportunity again.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Button
                                as="a"
                                className="bg-amber-600 text-white hover:bg-amber-700"
                                href="#waitlist"
                                size="lg"
                                variant="solid"
                                onPress={() => {
                                    // Add fireworks animation to waitlist section
                                    const waitlistSection = document.getElementById("waitlist");
                                    if (waitlistSection) {
                                        // Import the function dynamically to avoid circular dependencies
                                        import("@/components/Footer").then((module) => {
                                            const { createFireworkEffect } = module;
                                            waitlistSection.classList.add("golden-sparkle-border");
                                            createFireworkEffect(waitlistSection);
                                            setTimeout(() => {
                                                waitlistSection.classList.remove("golden-sparkle-border");
                                            }, 2000);
                                        });
                                    }
                                }}
                            >
                                Get Your Free Invite
                            </Button>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            Designed from a proven system. 100% open source.
                        </p>
                    </div>
                </div>
            </main>

            {/* Social Proof Bar */}
            <div className="bg-white dark:bg-gray-900 py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center">
                            <svg
                                className="h-10 w-10 mb-2 text-gray-700 dark:text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                            </svg>
                            <h3 className="text-lg font-semibold">Proven User Adoption</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Our open-source project converts community interest into active use at a rate <strong>3.1x higher</strong> than the median for similar tools. Professionals don't just bookmark it; they use it.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <svg
                                className="h-10 w-10 mb-2 text-amber-500"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <h3 className="text-lg font-semibold">Built for All Professionals</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Our own research with 22 job seekers confirmed this is a universal need. <strong>16 of them were non-developers.</strong>
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <svg
                                className="h-10 w-10 mb-2 text-emerald-500"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <h3 className="text-lg font-semibold">Join The Waitlist</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                300+ ambitious professionals have already signed up to get early access.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Problem/Agitation Section */}
            <div className="container mx-auto px-4 py-24 sm:py-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        {/* Testimonial */}
                        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/30 dark:to-emerald-950/30 rounded-xl p-8 border border-amber-200 dark:border-amber-800/50">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <blockquote className="text-lg italic text-gray-700 dark:text-gray-300 leading-relaxed">
                                        "I get so many emails, I mistook a message for a rejection. JustAJobApp caught a status update that my Gmail filters missed, prompting me to look again. It wasn't a rejection - it was an invitation to apply for a reopened position. I would have completely missed this opportunity without it."
                                    </blockquote>
                                    <div className="mt-4">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Beta User</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Computer Science and Engineering New Grad</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            When Your Manual Spreadsheet Fails, You Miss Opportunities.
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            At a certain point in a high-volume job search, manual tracking doesn't just become tedious - it breaks. You forget to update a status, a crucial follow-up slips through the cracks, or worse, you miss an interview entirely because it was lost in the chaos.
                        </p>
                        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            This isn't a personal failing; it's a system failure. Spreadsheets weren't designed to be a command center for dozens of active conversations, deadlines, and follow-ups. Relying on them is a strategic disadvantage that can cost you your dream role.
                        </p>
                    </div>
                </div>
            </div>

            {/* Solution Section */}
            <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
                                A System Designed From Experience, Built for Efficient Professionals.
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                JustAJobApp is an email-powered dashboard designed from a job search that landed interviews with 38 companies over 5 months. It automates the tedious tracking that leads to missed interviews and low morale.
                            </p>
                            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                By securely connecting to your email, it automatically finds your applications and organizes your pipeline. It's the tool I wish I had when things got overwhelming. It's the safety net you need to ensure no opportunity gets left behind.
                            </p>
                        </div>
                        <div>
                            {/* Placeholder for dashboard GIF */}
                            <div
                                className="bg-gray-200 dark:bg-gray-700 h-96 w-full rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => {
                                    setPopupImageSrc("homepage/Solution.png");
                                    setShowImagePopup(true);
                                }}
                            >
                                <div className="relative">
                                    <img
                                        alt="Clean, modern dashboard showing automated application tracking"
                                        className="max-h-80 max-w-full object-contain"
                                        src="homepage/Solution.png"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
                                        <svg
                                            className="h-12 w-12 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features & Benefits Section */}
            <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                            A Smarter Search with an Unfair Advantage
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Automated Dashboard</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Connect your email and watch as your dashboard auto-populates with the company name, job title, status, and application date. <br />
									<br></br>
                                    <strong className="text-amber-600">
                                        Benefit: Save hours of tedious data entry and eliminate human error.
                                    </strong>
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Intelligent Application Sorting</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Your applications are automatically categorized into one of ten statuses- from 'Applied' to 'Assessment Sent' to 'Offer Extended'. <br />
									<br></br>
                                    <strong className="text-amber-600">	
                                        Benefit: Get a clear, organized view of your entire pipeline at a glance.
                                    </strong>
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Data-Driven Insights</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Instantly see your interview-to-application ratio and identify the top 5 job titles that are generating the most employer responses. <br />
									<br></br>
                                    <strong className="text-amber-600">
                                        Benefit: Stop guessing. Double down on the strategies that are actually working.
                                    </strong>
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Inbox & Morale Protection</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Recruiter emails that land in spam are surfaced, and rejection emails are automatically archived, keeping your inbox clean. <br />
									<br></br>
                                    <strong className="text-amber-600">
                                        Benefit: Never miss a critical opportunity and protect your focus for the wins.
                                    </strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Founder's Story Section */}
            <div className="bg-white dark:bg-gray-800 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                        <div className="md:col-span-1">
                            {/* Founder Image with click functionality */}
                            <div
                                className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => {
                                    setPopupImageSrc("homepage/Founder - 2x.png");
                                    setShowImagePopup(true);
                                }}
                            >
                                <div className="relative">
                                    <img
                                        alt="Founder of Just A Job App"
                                        className="w-full h-auto object-cover"
                                        height="140px"
                                        src="homepage/Founder - 2x.png"
                                        width="165px"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
                                        <svg
                                            className="h-8 w-8 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
                                My System Worked. My Spreadsheet Didn't.
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                "After being laid off, I developed a system to navigate the chaos of the job market. It worked. Over 5 months, I turned <strong>118 cold applications</strong> into <strong>21 recruiter calls</strong>, achieving a <strong>17% interview rate</strong>- triple the industry average. My LinkedIn profile attracted 10 recruiters, propelling me to <strong>4 final rounds</strong> and <strong>2 offers</strong>.
                            </p>
                            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                But my manual spreadsheet couldn't keep up with the success. I was so overwhelmed tracking everything that I forgot to update it and <strong>even missed an interview.</strong> My method for getting interviews was solid, but my system for tracking them had failed me at a critical moment. That's why I'm building JustAJobApp. It's the tool I needed - automating my successful system so you never have to choose between finding opportunities and tracking them."
                            </p>
                            <p className="mt-4 font-semibold text-gray-900 dark:text-white">
                                – Lianna Novitz, Founder of Just A Job App
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision Section */}
            <div className="bg-gray-50 dark:bg-gray-900/60 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
                            The Vision: What's Next
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Organizing your search is just the beginning. Once we've perfected the tracker with your feedback, we'll begin building <strong className="text-amber-600">'Shining Nuggets'</strong>: a mobile game designed to help you discover and validate your most impressive accomplishments through anonymous peer feedback. The goal is to close the frustrating gap between application and interview forever.
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQ Section - Addressing Objections */}
            <div className="bg-gray-50 dark:bg-gray-800 py-24 sm:py-32">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
                            Your Questions, Answered.
                        </h2>
                    </div>
                    <div className="space-y-12">
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
                            <h3 className="text-xl font-semibold mb-4 text-amber-600">
                                What does "Request Early Access" mean?
                            </h3>
                            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                                Our current beta is full as we work with our first users to perfect the experience. By requesting access, you'll be on the priority list. We will send invites in batches as more spots become available.
                            </p>
                        </div>
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
                            <h3 className="text-xl font-semibold mb-4 text-amber-600">Is this just for developers?</h3>
                            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                                No. It was designed for all ambitious professionals. Our own research with 22 job seekers, <strong>of which 16 were non-developers</strong>, confirmed this is a universal need.
                            </p>
                        </div>
                        <div className="pb-4">
                            <h3 className="text-xl font-semibold mb-4 text-amber-600">
                                Is this confidential? My biggest fear is my boss finding out.
                            </h3>
                            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                                Absolutely. Protecting your privacy is a core part of our design. Your data is for your eyes only.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA Section */}
            <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-emerald-600">
                            Never Miss an Opportunity Again.
                        </h2>
                        <p className="text-lg text-gray-700 mb-8 dark:text-gray-300 leading-relaxed">
                            Your job search is too important to be derailed by a broken manual process. Get the system designed to handle the volume and complexity of a modern, successful job hunt. Our beta is currently full, but the next release is coming soon. Request your invite to be first in line.
                        </p>
                        <Button
                            as="a"
                            className="bg-amber-600 text-white hover:bg-amber-700"
                            href="#waitlist"
                            size="lg"
                            onPress={() => {
                                // Add fireworks animation to waitlist section
                                const waitlistSection = document.getElementById("waitlist");
                                if (waitlistSection) {
                                    // Import the function dynamically to avoid circular dependencies
                                    import("@/components/Footer").then((module) => {
                                        const { createFireworkEffect } = module;
                                        waitlistSection.classList.add("golden-sparkle-border");
                                        createFireworkEffect(waitlistSection);
                                        setTimeout(() => {
                                            waitlistSection.classList.remove("golden-sparkle-border");
                                        }, 2000);
                                    });
                                }
                            }}
                        >
                            Request Early Access
                        </Button>
                    </div>
                </div>
            </div>

            <section id="waitlist" className="max-w-4xl mx-auto py-16">
                <div className="bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/30 dark:to-emerald-950/30 rounded-xl p-8 border border-amber-200 dark:border-amber-800/50 text-center transition-all">
                    <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-emerald-600 dark:from-amber-500 dark:to-emerald-400">
                        Get the System Behind a 3x Interview Rate.
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                        Join 300+ ambitious professionals on our priority list. 
						We're building the tool I wish I had- one where you focus on winning the interview,
						not on data entry. Your search is 100% confidential.
                    </p>

                    <div className="flex justify-center mb-10">
                        {/* Embedded Formbricks Survey */}
                        <div className="dark:opacity-70" style={{ position: "relative", overflow: "auto" }}>
                            <iframe
                                src="https://app.formbricks.com/s/cmf667qha4ahcyg01nu13lsgo?embed=true&source=JustAJobAppLandingPageEmbed"
                                style={{ width: "400px", height: "340px", border: 0 }}
                                className="rounded-md dark:border dark:border-gray-700"
                            />
                        </div>
                    </div>
                </div>
            </section>
            <Footer />

            {/* Image Popup Overlay */}
            {showImagePopup && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowImagePopup(false)}
                >
                    <div className="relative w-full max-w-6xl">
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-amber-500 focus:outline-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowImagePopup(false);
                            }}
                        >
                            <svg
                                className="h-8 w-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 18L18 6M6 6l12 12"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                />
                            </svg>
                        </button>
                        <div className="bg-white flex justify-center dark:bg-gray-800 p-6 rounded-lg shadow-2xl overflow-hidden">
                            <img
                                alt="Enlarged image"
                                className="h-auto"
                                src={popupImageSrc}
                                style={{ maxHeight: "90vh" }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;