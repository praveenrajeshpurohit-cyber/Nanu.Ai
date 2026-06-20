import React, { useState } from "react";
import * as Icons from "lucide-react";
import { GeneratedWebsiteConfig, GeneratedWebsiteSection } from "../types";

interface GeneratedWebsiteRendererProps {
  config: GeneratedWebsiteConfig;
}

export default function GeneratedWebsiteRenderer({ config }: GeneratedWebsiteRendererProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<string>("preview"); // preview | schema
  const [editedConfig, setEditedConfig] = useState<GeneratedWebsiteConfig>(config);

  // Dynamic Lucide Icon Mapper safely returning fallback if non-existent
  const renderIcon = (iconName: string = "Sparkles") => {
    const IconComponent = (Icons as any)[iconName] || Icons.Sparkles;
    return <IconComponent className="h-6 w-6 text-[#66FCF1]" />;
  };

  const updateSectionText = (sectionId: string, field: string, value: string) => {
    const nextSections = editedConfig.sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, [field]: value };
      }
      return sec;
    });
    setEditedConfig({ ...editedConfig, sections: nextSections });
  };

  // Build simulated URL based on siteName
  const slugifiedName = editedConfig.siteName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".nanu.ai";

  return (
    <div id="website-generation-renderer" className="w-full flex flex-col gap-6 bg-[#1F2833] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0B0C10] px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500 block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500 block"></span>
          </div>
          <span className="font-mono text-sm text-[#C5C6C7] bg-[#1F2833] px-3 py-1 rounded-md border border-white/5 flex items-center gap-1.5">
            <Icons.Globe className="w-3.5 h-3.5 text-[#66FCF1]" />
            https://{slugifiedName}
          </span>
        </div>

        {/* Viewport & Tab togglers */}
        <div className="flex items-center gap-4">
          <div className="flex bg-[#0B0C10] rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setViewport("desktop")}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                viewport === "desktop" ? "bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-[#0B0C10] font-bold" : "text-[#C5C6C7] hover:text-[#66FCF1]"
              }`}
            >
              <Icons.Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                viewport === "mobile" ? "bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-[#0B0C10] font-bold" : "text-[#C5C6C7] hover:text-[#66FCF1]"
              }`}
            >
              <Icons.Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>

          <div className="flex bg-[#0B0C10] rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setActiveTab("preview")}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === "preview" ? "bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-[#0B0C10] font-bold" : "text-[#C5C6C7] hover:text-[#66FCF1]"
              }`}
            >
              Live Preview
            </button>
            <button
              onClick={() => setActiveTab("schema")}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === "schema" ? "bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-[#0B0C10] font-bold" : "text-[#C5C6C7] hover:text-[#66FCF1]"
              }`}
            >
              AI Code Structure (JSON)
            </button>
          </div>
        </div>
      </div>

      {activeTab === "schema" ? (
        <div id="json-code-preview" className="p-6 font-mono text-xs text-[#C5C6C7] bg-[#0B0C10] overflow-x-auto max-h-[600px] leading-relaxed select-all">
          <pre>{JSON.stringify(editedConfig, null, 2)}</pre>
        </div>
      ) : (
        /* Preview container framing */
        <div className="bg-[#0B0C10] p-4 md:p-8 flex justify-center items-start overflow-y-auto max-h-[700px] transition-all bg-[radial-gradient(#1f2833_1px,transparent_1px)] [background-size:16px_16px]">
          <div
            className={`transition-all duration-500 bg-[#0B0C10] shadow-2xl rounded-xl overflow-hidden border border-white/10 flex flex-col ${
              viewport === "desktop" ? "w-full max-w-5xl" : "w-[375px] min-h-[600px]"
            }`}
          >
            {/* Embedded Header */}
            <header className="bg-[#1F2833] border-b border-white/5 flex items-center justify-between px-6 py-4">
              <span className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <Icons.Sparkles className="w-5 h-5 text-[#66FCF1]" />
                {editedConfig.siteName}
              </span>
              <nav className="hidden md:flex items-center gap-6 text-sm text-[#C5C6C7] font-medium">
                <a href="#features" className="hover:text-[#66FCF1] transition-colors">Features</a>
                <a href="#about" className="hover:text-[#66FCF1] transition-colors">Philosophy</a>
                <a href="#pricing" className="hover:text-[#66FCF1] transition-colors">Pricing</a>
                <a href="#faq" className="hover:text-[#66FCF1] transition-colors">FAQs</a>
              </nav>
              <button className="bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-[#0B0C10] text-xs px-4 py-2 rounded-lg font-bold transition-all hover:brightness-110">
                Contact Now
              </button>
            </header>

            {/* Simulated Live Sections */}
            <div className="flex flex-col">
              {editedConfig.sections.map((section: GeneratedWebsiteSection) => {
                const isHero = section.type === "hero";
                const isFeatures = section.type === "features";
                const isAbout = section.type === "about";
                const isPricing = section.type === "pricing";
                const isFaq = section.type === "faq";
                const isCta = section.type === "cta";

                return (
                  <section
                    key={section.id}
                    id={section.type}
                    className={`relative w-full py-16 px-6 border-b border-white/5 flex flex-col items-center justify-center text-center ${section.bgColor || "bg-[#0B0C10]"} ${section.textColor || "text-[#C5C6C7]"}`}
                  >
                    {/* Inline Content Editor Tooltip */}
                    <div className="absolute top-3 right-3 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-all z-10 bg-[#1F2833]/90 text-[10px] text-[#C5C6C7] px-2 py-1 rounded border border-white/5">
                      AI Generated Section
                    </div>

                    <div className="max-w-3xl mx-auto flex flex-col items-center">
                      {section.badge && (
                        <span className="bg-[#66FCF1]/10 text-[#66FCF1] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4 border border-[#66FCF1]/20">
                          {section.badge}
                        </span>
                      )}

                      {/* Title editable on click or view */}
                      <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight text-white font-sans">
                        {section.title}
                      </h2>

                      {section.subtitle && (
                        <p className="text-sm md:text-base text-[#C5C6C7]/80 mb-8 max-w-xl leading-relaxed">
                          {section.subtitle}
                        </p>
                      )}

                      {section.content && (
                        <p className="text-sm md:text-base text-[#C5C6C7] mb-8 max-w-2xl leading-relaxed text-justify md:text-center">
                          {section.content}
                        </p>
                      )}

                      {/* Display grid columns for features details */}
                      {isFeatures && section.items && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-8">
                          {section.items.map((item) => (
                            <div
                              key={item.id}
                              className="bg-[#1F2833]/50 p-6 rounded-xl border border-white/5 hover:border-[#66FCF1]/30 hover:shadow-[0_0_15px_rgba(102,252,241,0.15)] transition-all hover:-translate-y-1 duration-300 group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-[#66FCF1]/10 border border-[#66FCF1]/20 flex items-center justify-center mb-4">
                                {renderIcon(item.icon)}
                              </div>
                              <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#66FCF1] transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-xs text-[#C5C6C7]/70 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Display Pricing cards */}
                      {isPricing && section.items && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl text-left mt-8">
                          {section.items.map((item) => (
                            <div
                              key={item.id}
                              className="bg-[#1F2833]/80 p-8 rounded-2xl border border-white/10 relative hover:border-[#66FCF1]/50 hover:shadow-[0_0_20px_rgba(102,252,241,0.2)] transition-all overflow-hidden flex flex-col justify-between"
                            >
                              <div>
                                <span className="absolute top-4 right-4 text-[10px] font-bold text-[#66FCF1] bg-[#66FCF1]/10 px-2.5 py-1 rounded-full border border-[#66FCF1]/20">
                                  BEST VALUE
                                </span>
                                <h3 className="text-lg font-extrabold text-white mb-1">
                                  {item.title}
                                </h3>
                                <p className="text-xs text-[#C5C6C7]/70 mb-4">
                                  {item.description}
                                </p>
                                <div className="flex items-baseline gap-1.5 mb-6">
                                  <span className="text-3xl font-extrabold text-white">{item.price}</span>
                                  <span className="text-xs text-[#C5C6C7]/55">one-time</span>
                                </div>
                                {item.features && (
                                  <ul className="space-y-2.5 mb-8">
                                    {item.features.map((feat, idx) => (
                                      <li key={idx} className="flex items-center gap-2 text-xs text-[#C5C6C7]">
                                        <Icons.Check className="w-3.5 h-3.5 text-[#66FCF1] flex-shrink-0" />
                                        {feat}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <button className="w-full bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-[#0B0C10] font-bold text-xs py-2.5 rounded-lg transition-colors">
                                Choose {item.title}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* FAQS accordions */}
                      {isFaq && section.items && (
                        <div className="w-full text-left max-w-2xl mt-6 space-y-4">
                          {section.items.map((faqItem) => (
                            <div
                              key={faqItem.id}
                              className="bg-[#1F2833]/60 p-5 rounded-lg border border-white/5"
                            >
                              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <Icons.HelpCircle className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                                {faqItem.title}
                              </h4>
                              <p className="text-xs text-[#C5C6C7]/75 leading-relaxed pl-6">
                                {faqItem.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Generic buttons */}
                      {(section.primaryButtonText || section.secondaryButtonText) && (
                        <div className="flex flex-wrap gap-4 justify-center mt-6">
                          {section.primaryButtonText && (
                            <button className="bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-[#0B0C10] text-xs font-bold px-6 py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#66FCF1]/20">
                              {section.primaryButtonText}
                            </button>
                          )}
                          {section.secondaryButtonText && (
                            <button className="bg-[#1F2833] hover:bg-[#1F2833]/80 text-[#C5C6C7] text-xs font-bold px-6 py-3 rounded-lg border border-white/10 transition-all">
                              {section.secondaryButtonText}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Embedded Footer */}
            <footer className="bg-[#0B0C10] px-6 py-8 border-t border-white/5 text-center text-xs text-[#C5C6C7]/60 flex flex-col items-center gap-4">
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Icons.Sparkles className="w-4 h-4 text-[#66FCF1]" />
                {editedConfig.siteName}
              </span>
              <p>© 2026 {editedConfig.siteName}. Designed completely in seconds via Nanu.AI. All rights reserved.</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
