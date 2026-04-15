"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Easy Setup",
    description: "Connect your social media in seconds. Our AI scans your content and creates your digital twin automatically.",
    image: "/social-media.png"
  },
  {
    title: "Analytics Dashboard",
    description: "See what fans are asking, popular topics, and engagement insights. Understand your audience better.",
    image: "/Real time analytics.png"
  }
];

export default function Home() {
  const { user, isLoaded } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (user) {
    return <DashboardRedirect user={user} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <h1
            className="flex items-center text-lg font-bold text-zinc-900"
          >
            <img
              className="w-10 h-10"
              src="/logo.png"
              alt="logo"
            />
            <span>
              <span className="font-bold text-[#0099ff]">F</span>
              al
              <span className="font-bold text-[#0099ff]">F</span>
              rindes
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Log in
            </Link>
            <div className="w-fit justify-center items-center gap-12 h-full" onClick={() => setShowAuthModal(true)}>
              <div
                className="bg-gradient-to-b from-stone-300/40 to-transparent p-[4px] rounded-[16px]"
              >
                <button
                  className="group p-[4px] rounded-[12px] bg-gradient-to-b from-white to-stone-200/40 shadow-[0_1px_3px_rgba(0,0,0,0.5)] active:shadow-[0_0px_1px_rgba(0,0,0,0.5)] active:scale-[0.995]"
                >
                  <div
                    className="bg-gradient-to-b from-stone-200/40 to-white/80 rounded-[8px] px-2 py-2"
                  >
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold"> Get Started</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Chat */}
      <section className="min-h-screen flex items-center px-6 pt-10">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 h-full items-center">
          <div className="h-full mt-60">
            <style>{`
        .badge {
          position: relative;
          display: inline-block;
          padding: 3px 16px;
          color: #0099ff;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 999px;
          user-select: none;
        }

        .badge span {
          width: 25px;
          height: 25px;
          position: absolute;
          top: -12px;
          right: -2px;
          transform: rotate(-20deg);
        }

        .badge span:before,
        .badge span:after {
          content: "";
          position: absolute;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .badge span:before {
          width: 1px;
          height: 100%;
          left: 12px;
          background: linear-gradient(
            to bottom,
            transparent,
            #0099ff,
            transparent
          );
        }

        .badge span:after {
          width: 100%;
          height: 1px;
          top: 12px;
          background: linear-gradient(
            to left,
            transparent,
            black,
            transparent
          );
        }

        .badge span:after,
        .badge span:before{
          opacity: 1;
          animation: rotate 2s ease-in-out;
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.6);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }
      `}</style>

            <div className="mb-6">
              <div className="badge bg-[#0099ff]/20">
                AI Digital Twin Platform
                <span></span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-miso text-zinc-900 leading-[1.1] mb-6">
              Let your fans talk to you —{" "}
              <span className="text-[#0099ff]">even when you&apos;re offline</span>
            </h1>

            <p className="text-xl text-zinc-500 mb-5 max-w-lg">
              Create an AI version of yourself that chats with your community 24/7 in your exact voice and style.
            </p>

            <div className="w-fit justify-center items-center gap-12 h-full" onClick={() => setShowAuthModal(true)}>
              <div
                className="bg-gradient-to-b from-stone-300/40 to-transparent p-[4px] rounded-[16px]"
              >
                <button
                  className="group p-[4px] rounded-[12px] bg-gradient-to-b from-white to-stone-200/40 shadow-[0_1px_3px_rgba(0,0,0,0.5)] active:shadow-[0_0px_1px_rgba(0,0,0,0.5)] active:scale-[0.995]"
                >
                  <div
                    className="bg-gradient-to-b from-stone-200/40 to-white/80 rounded-[8px] px-2 py-2"
                  >
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold"> Create Your AI Twin</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </div>

          <div className="flex justify-center">
            <div className="flex justify-center items-end h-full">
              <img
                src="/FalFrindes.png"
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Badge */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-zinc-100 rounded-full px-6 py-3 flex items-center justify-center gap-3 max-w-md mx-auto">
            <svg className="w-5 h-5 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-medium text-zinc-600">Powered by advanced AI • Not a real person</span>
          </div>
        </div>
      </section>


      <section
        id="features"
        className="py-24 px-6 bg-black/5"
        style={{
          backgroundImage: "url('/bg-2.png')",
          backgroundSize: 'cover',      // Scales image to fill the entire section
          backgroundRepeat: 'no-repeat', // Prevents the image from duplicating
          backgroundPosition: 'center'  // Keeps the image centered
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Features</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT SIDE: Features List */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div key={i} className="border-b border-zinc-300 pb-4">
                  <button
                    onClick={() => setActiveFeature(i)}
                    className={`w-full text-left py-4 transition-all outline-none`}
                  >
                    <span className={`text-2xl block ${activeFeature === i ? "text-black" : "text-zinc-500 hover:text-zinc-300"
                      }`}>
                      {feature.title}
                    </span>
                  </button>

                  {/* Description appears here only when active */}
                  {activeFeature === i && (
                    <div className="pr-8 animate-in fade-in slide-in-from-top-1 duration-300">
                      <p className="text-zinc-700 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT SIDE: Styled Image Container */}
            <div className="relative group">
              {/* The "Glow" effect behind the image */}

              <div className="relative">
                <div className="flex items-center justify-center min-h-[400px]">
                  <img
                    src={features[activeFeature].image}
                    alt="Feature Preview"
                    className="w-full h-auto rounded-xl shadow-xs border border-zinc-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Centered */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-zinc-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-zinc-500">
              Set up in minutes, engage fans forever.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-6 relative">

            {/* connector line (desktop only) */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-px bg-zinc-200" />

            {[
              {
                step: "STEP ONE",
                title: "Start Writing Easily",
                desc: "Easy Start!",
              },
              {
                step: "STEP TWO",
                title: "Know Your Brand Instantly",
                desc: "Instant Result!",
              },
              {
                step: "STEP THREE",
                title: "See What to Improve",
                desc: "Smart Insights!",
              },
              {
                step: "STEP FOUR",
                title: "Learn & Improve Faster",
                desc: "Faster Progress!",
              },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center">

                {/* Card */}
                <div className="w-full bg-zinc-100 rounded-2xl p-6 min-h-[60px] flex flex-col justify-between shadow-sm">

                  {/* top label */}
                  <div>
                    <p className="text-xs font-medium text-zinc-400 mb-2 tracking-wide">
                      {item.step}
                    </p>

                    <h3 className="text-lg font-semibold text-zinc-900 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* connector dot */}
                {i !== 3 && (
                  <div className="hidden md:flex absolute top-9 right-[-26px] w-6 h-6 rounded-full bg-white border border-zinc-200 items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-zinc-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-zinc-300 text-black">
        <div className="max-w-7xl mx-auto">
          {/* Top Section: CTA and Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

            {/* Contact Section */}
            <div className="md:col-span-6 space-y-6">
              <h2 className="text-4xl md:text-5xl font-medium leading-tight">
                Build your own clone <br /> using FalFrindes
              </h2>

              <div className="pt-4 space-y-2">
                <Button className="bg-white text-black px-8 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors">
                  Schedule a call now
                  <span>→</span>
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-6">
              <span className="text-sm text-zinc-700">
                Quick Links
              </span>
              <ul className="space-y-4 text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              </ul>
            </div>

            {/* Information */}
            <div className="md:col-span-3 space-y-6">
              <span className="text-sm text-zinc-700">
                Information
              </span>
              <ul className="text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section: Copyright and Socials */}
          <div className="flex flex-col md:row items-center justify-between gap-6">
            <p className="text-sm text-zinc-700">
              © 2026 logo
              FalFrindes. ALL RIGHTS RESERVED.
            </p>

            <div className="flex items-center gap-6 text-zinc-400">
              <a href="#" className="hover:text-white transition-colors"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="hover:text-white transition-colors"><i className="fab fa-twitter"></i></a>
              <a href="#" className="hover:text-white transition-colors"><i className="fab fa-instagram"></i></a>
              <a href="#" className="hover:text-white transition-colors"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900">Continue as</h2>
              <button onClick={() => setShowAuthModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              <Link
                href="/sign-up"
                onClick={() => setShowAuthModal(false)}
                className="flex items-center gap-3 p-3 rounded-xl border-2 border-[#7C3AED] hover:bg-purple-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">Content Creator</h3>
                  <p className="text-xs text-zinc-500">Create your AI twin</p>
                </div>
              </Link>

              <Link
                href="/sign-up"
                onClick={() => setShowAuthModal(false)}
                className="flex items-center gap-3 p-3 rounded-xl border-2 border-zinc-200 hover:border-[#7C3AED] hover:bg-purple-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">Fan / User</h3>
                  <p className="text-xs text-zinc-500">Chat with creators</p>
                </div>
              </Link>

              <Link
                href="/explore"
                onClick={() => setShowAuthModal(false)}
                className="flex items-center gap-3 p-3 rounded-xl border-2 border-zinc-200 hover:border-[#7C3AED] hover:bg-purple-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">Guest</h3>
                  <p className="text-xs text-zinc-500">Browse without account</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardRedirect({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.location.href = `/dashboard/${user.id}/profile`;
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return null;
}