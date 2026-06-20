import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
  Video,
  Monitor,
  Smartphone,
  Check,
  Building,
  Briefcase,
  Users,
  Lock,
  LogOut,
  Upload,
  Globe,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Plus,
  RefreshCw,
  Sun,
  Moon,
  MessageSquare,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import WhatsAppButton from "./components/WhatsAppButton";
import GeneratedWebsiteRenderer from "./components/GeneratedWebsiteRenderer";
import {
  FAQ,
  Inquiry,
  PaymentConfirmation,
  PortfolioProject,
  WebsiteRequest,
  AdminSettings
} from "./types";

export default function App() {
  // Page routing state
  const [activeView, setActiveView] = useState<string>("home");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Data state
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  // Admin authentication and backend states
  const [adminToken, setAdminToken] = useState<string | null>(
    localStorage.getItem("nanu_admin_token")
  );
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState<string>("requests");

  // Admin CRUD action states
  const [requestsList, setRequestsList] = useState<WebsiteRequest[]>([]);
  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentConfirmation[]>([]);

  // Editing structures
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [newProjectForm, setNewProjectForm] = useState({
    title: "",
    description: "",
    category: "Business",
    imageUrl: "",
    tags: "",
    liveUrl: "#",
    featured: false
  });

  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaqForm, setNewFaqForm] = useState({
    question: "",
    answer: "",
    category: "General"
  });

  // Client prompt state & AI interaction parameters:
  const [promptInput, setPromptInput] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("business");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRequest, setGeneratedRequest] = useState<WebsiteRequest | null>(null);
  const [generationSteps, setGenerationSteps] = useState<string>("");

  // Client inquiries form state:
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Payment confirmation state:
  const [payOrderId, setPayOrderId] = useState("");
  const [payName, setPayName] = useState("");
  const [payEmail, setPayEmail] = useState("");
  const [payPhone, setPayPhone] = useState("");
  const [payTxId, setPayTxId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payScreenshot, setPayScreenshot] = useState("");
  const [paySuccess, setPaySuccess] = useState(false);

  // User's plan tracking state
  const [trackQuery, setTrackQuery] = useState("");
  const [trackedRequests, setTrackedRequests] = useState<WebsiteRequest[]>([]);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [hasTracked, setHasTracked] = useState(false);

  // Load public data on mount
  useEffect(() => {
    fetchPublicData();
  }, []);

  // Fetch admin states when logged in
  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
    }
  }, [adminToken]);

  const fetchPublicData = async () => {
    try {
      const res = await fetch("/api/data");
      const data = await res.json();
      if (data) {
        setPortfolio(data.portfolio || []);
        setFaqs(data.faqs || []);
        setSettings(data.adminSettings || null);
      }
    } catch (err) {
      console.error("Error fetching public data:", err);
    }
  };

  const handleTrackRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackQuery.trim()) {
      setTrackError("Please enter your Order Reference or registered Email.");
      return;
    }
    setIsTrackLoading(true);
    setTrackError("");
    setHasTracked(true);
    try {
      const res = await fetch(`/api/track-request?q=${encodeURIComponent(trackQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackedRequests(data.requests || []);
      } else {
        setTrackError(data.error || "An error occurred while fetching your blueprint.");
      }
    } catch (err) {
      setTrackError("Server connectivity issue. Please try again later.");
    } finally {
      setIsTrackLoading(false);
    }
  };

  const handleViewLivePreview = (req: WebsiteRequest) => {
    setGeneratedRequest(req);
    setActiveView("builder");
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/data", {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data) {
        setRequestsList(data.websiteRequests || []);
        setInquiriesList(data.inquiries || []);
        setPaymentsList(data.payments || []);
        setPortfolio(data.portfolio || []);
        setFaqs(data.faqs || []);
        setSettings(data.adminSettings || null);
      }
    } catch (err) {
      console.error("Error loading admin core data:", err);
    }
  };

  // Login actions
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("nanu_admin_token", data.token);
        setAdminToken(data.token);
        setActiveAdminTab("requests");
      } else {
        setLoginError(data.error || "Invalid username or password.");
      }
    } catch (err) {
      setLoginError("Failed to connect to authentication server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nanu_admin_token");
    setAdminToken(null);
    setActiveView("home");
  };

  // Submit Website Prompt Request
  const handleGenerateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsGenerating(true);
    setGeneratedRequest(null);
    setGenerationSteps("Initializing Neural Framework...");

    const steps = [
      "Analyzing layout requirements...",
      "Configuring tailwind core assets...",
      "Drafting copy content parameters...",
      "Generating high-resolution component structures...",
      "Assembling responsive frames..."
    ];

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setGenerationSteps(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(stepInterval);
      }
    }, 1200);

    try {
      const res = await fetch("/api/generate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          userEmail: clientEmail,
          userPhone: clientPhone,
          selectedPlan: selectedPlan
        })
      });

      clearInterval(stepInterval);

      if (res.ok) {
        const data = await res.json();
        setGeneratedRequest(data.request);
        // Pre-fill payment order ID
        setPayOrderId(data.request.orderId);
        setPayAmount(settings?.pricing.toString() || "1500");
        setGenerationSteps("Done!");
      } else {
        setGenerationSteps("Generation encountered an error. Reverting to backup template.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      setGenerationSteps("Server connection timeout. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Contact inquirer form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          subject: inquirySubject,
          message: inquiryMessage
        })
      });
      if (res.ok) {
        setInquirySuccess(true);
        setInquiryName("");
        setInquiryEmail("");
        setInquirySubject("");
        setInquiryMessage("");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Payment receipts details submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/payment-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: payOrderId,
          name: payName,
          email: payEmail,
          phone: payPhone,
          transactionId: payTxId,
          amount: Number(payAmount),
          screenshot: payScreenshot
        })
      });
      if (res.ok) {
        setPaySuccess(true);
        setPayName("");
        setPayEmail("");
        setPayPhone("");
        setPayTxId("");
        setPayScreenshot("");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // File Upload utility converting to Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: "founderPhoto" | "qrCode" | "screenshot") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (targetField === "founderPhoto") {
        updateAdminSettings({ founderPhoto: base64String });
      } else if (targetField === "qrCode") {
        updateAdminSettings({ qrCode: base64String });
      } else if (targetField === "screenshot") {
        setPayScreenshot(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  // Admin actions: update overall settings
  const updateAdminSettings = async (updatedFields: Partial<AdminSettings>) => {
    try {
      const res = await fetch("/api/admin/update-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ ...settings, ...updatedFields })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manage requests status update
  const handleUpdateRequestStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch("/api/admin/requests/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ id, status: nextStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manage payment receipts
  const handleUpdatePaymentStatus = async (id: string, nextStatus: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/admin/payments/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ id, status: nextStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manage inquiries
  const handleUpdateInquiryStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch("/api/admin/inquiries/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ id, status: nextStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manage Portfolio Project Adding/Editing
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: newProjectForm.title,
      description: newProjectForm.description,
      category: newProjectForm.category,
      imageUrl: newProjectForm.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
      tags: newProjectForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      liveUrl: newProjectForm.liveUrl,
      featured: newProjectForm.featured
    };

    try {
      let url = "/api/admin/portfolio/add";
      if (editingProject) {
        url = `/api/admin/portfolio/edit/${editingProject.id}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAddingProject(false);
        setEditingProject(null);
        setNewProjectForm({
          title: "",
          description: "",
          category: "Business",
          imageUrl: "",
          tags: "",
          liveUrl: "#",
          featured: false
        });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this portfolio project?")) return;
    try {
      const res = await fetch(`/api/admin/portfolio/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manage FAQs Adding/Editing
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let url = "/api/admin/faq/add";
      if (editingFaq) {
        url = `/api/admin/faq/edit/${editingFaq.id}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(newFaqForm)
      });

      if (res.ok) {
        setIsAddingFaq(false);
        setEditingFaq(null);
        setNewFaqForm({ question: "", answer: "", category: "General" });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch(`/api/admin/faq/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Inline styles configuration wrapper mapping classes based on dark mode toggle
  const appBg = isDarkMode ? "bg-[#0B0C10] text-[#C5C6C7]" : "bg-slate-50 text-slate-800";
  const cardBg = isDarkMode ? "bg-[#1F2833]/90 border-white/10 shadow-xl" : "bg-white border-slate-200 shadow-sm";
  const navBg = isDarkMode ? "bg-[#0B0C10]/80 border-white/5" : "bg-white/95 border-slate-200/80 shadow-sm";
  const textTitle = isDarkMode ? "text-white" : "text-slate-900";
  const textSub = isDarkMode ? "text-[#C5C6C7]" : "text-slate-500";
  const borderCol = isDarkMode ? "border-white/10" : "border-slate-200";

  return (
    <div className={`min-h-screen ${appBg} font-sans transition-colors duration-300 relative pb-16`}>
      {/* Floating WhatsApp support */}
      <WhatsAppButton phoneNumber={settings?.whatsappNumber || "918401094966"} />

      {/* Modern navigation header bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl ${navBg} border-b transition-colors`}>
        <div id="nanua-navbar" className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            onClick={() => setActiveView("home")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#66FCF1] to-[#45A29E] flex items-center justify-center text-[#0B0C10] font-bold shadow-lg shadow-[#66FCF1]/20 transform group-hover:rotate-3 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xl font-black tracking-tight ${textTitle}`}>
                Nanu<span className="text-[#66FCF1]">.AI</span>
              </span>
              <p className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">AI Web Designer</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-400">
            <button
              onClick={() => setActiveView("home")}
              className={`hover:text-[#66FCF1] transition-colors ${activeView === "home" ? "text-[#66FCF1]" : ""}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView("builder")}
              className={`hover:text-[#66FCF1] transition-colors flex items-center gap-1.5 ${activeView === "builder" ? "text-[#66FCF1]" : ""}`}
            >
              <Layers className="w-4 h-4 text-[#66FCF1]" />
              AI Builder
            </button>
            <button
              onClick={() => setActiveView("portfolio")}
              className={`hover:text-[#66FCF1] transition-colors ${activeView === "portfolio" ? "text-[#66FCF1]" : ""}`}
            >
              Portfolio/Demos
            </button>
            <button
              onClick={() => setActiveView("services")}
              className={`hover:text-[#66FCF1] transition-colors ${activeView === "services" ? "text-[#66FCF1]" : ""}`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveView("how-it-works")}
              className={`hover:text-[#66FCF1] transition-colors ${activeView === "how-it-works" ? "text-[#66FCF1]" : ""}`}
            >
              How It Works
            </button>
            <button
              onClick={() => setActiveView("pricing")}
              className={`hover:text-[#66FCF1] transition-colors ${activeView === "pricing" ? "text-[#66FCF1]" : ""}`}
            >
              Pricing
            </button>
            <button
              onClick={() => setActiveView("my-plan")}
              className={`hover:text-[#66FCF1] transition-colors flex items-center gap-1 ${activeView === "my-plan" ? "text-[#66FCF1]" : ""}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#66FCF1] animate-ping" />
              My Plan
            </button>
            <button
              onClick={() => setActiveView("faq")}
              className={`hover:text-[#66FCF1] transition-colors ${activeView === "faq" ? "text-[#66FCF1]" : ""}`}
            >
              FAQs
            </button>
            <button
              onClick={() => setActiveView("about")}
              className={`hover:text-[#66FCF1] transition-colors ${activeView === "about" ? "text-[#66FCF1]" : ""}`}
            >
              About
            </button>
            <button
              onClick={() => setActiveView("contact")}
              className={`hover:text-[#66FCF1] transition-colors ${activeView === "contact" ? "text-[#66FCF1]" : ""}`}
            >
              Contact
            </button>
          </nav>

          {/* Right Header Panel Actions */}
          <div className="flex items-center gap-4">
            {/* Light / Dark Mode switch */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-lg border cursor-pointer hover:bg-slate-500/10 transition-colors ${borderCol}`}
              aria-label="Toggle theme mode"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-[#45A29E]" />}
            </button>

            {adminToken ? (
              <button
                onClick={() => setActiveView("admin")}
                className="hidden sm:flex items-center gap-2 bg-[#1F2833] text-white text-xs font-bold px-4 py-2.5 rounded-lg border border-white/5 hover:bg-slate-700 transition"
              >
                <Lock className="w-3.5 h-3.5 text-[#66FCF1]" />
                Admin Panel
              </button>
            ) : (
              <button
                onClick={() => setActiveView("builder")}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-[#0B0C10] text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-[#66FCF1]/15 transform hover:scale-102 active:scale-98 transition-all hover:brightness-110"
              >
                Launch Builder
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Driver Area */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeView === "home" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-24"
            >
              {/* Hero Banner Area */}
              {settings?.enabledSections.hero && (
                <div id="homepage-hero-section" className="text-center py-12 md:py-20 flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
                    <Sparkles className="w-3.5 h-3.5" />
                    THE FUTURE’S DESIGNER HAS ARRIVED
                  </div>

                  <h1 className={`text-4xl md:text-7xl font-sans font-black tracking-tight leading-[1.1] mb-6 max-w-4xl ${textTitle}`}>
                    Build Your Dream <span className="bg-gradient-to-r from-violet-400 via-violet-600 to-indigo-600 bg-clip-text text-transparent">Website with AI</span>
                  </h1>

                  <p className={`text-base md:text-xl max-w-2xl mb-10 leading-relaxed ${textSub}`}>
                    Supercharge your brand. Describe your website in detail, let our advanced deep layout generator assemble premium styled segments, and deliver your live customized page.
                  </p>

                  {/* Centered Website Prompt input container */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setActiveView("builder");
                    }}
                    className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex flex-col md:flex-row gap-3 shadow-2xl focus-within:border-violet-500/50 transition-all mb-16"
                  >
                    <input
                      type="text"
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="Describe what your target business does (e.g. Handmade ceramic candles store with delivery and prices list...)"
                      className="flex-1 bg-transparent border-0 text-white outline-none px-4 py-3 placeholder-slate-500 text-sm font-medium"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      Assemble Website
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Simple stats badges */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl w-full border-t border-slate-800/40 pt-16">
                    <div className="text-center">
                      <span className="block text-3xl font-black text-violet-500">₹{settings?.pricing}</span>
                      <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mt-1 block">One-Time Package</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl font-black text-violet-500">24 Hours</span>
                      <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mt-1 block">Guaranteed Delivery</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl font-black text-violet-500">100% Mobile</span>
                      <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mt-1 block">Responsive Layouts</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl font-black text-violet-500">No Code</span>
                      <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mt-1 block">Required by User</span>
                    </div>
                  </div>
                </div>
              )}

              {/* pricing prominent display block */}
              {settings?.enabledSections.pricing && (
                <div id="promo-pricing" className={`rounded-3xl p-10 md:p-14 border ${cardBg} transition-all relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full filter blur-[100px]" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <span className="text-xs font-bold text-violet-400 bg-violet-500/10 rounded-full px-3 py-1.5 border border-violet-500/20">
                        LIMITED TIME LAUNCH PRICE
                      </span>
                      <h2 className={`text-2xl md:text-5xl font-black tracking-tight mt-4 ${textTitle}`}>
                        Modern Customized Website <br />
                        <span className="text-violet-500">For Only ₹1,500</span>
                      </h2>
                      <p className={`text-sm md:text-base max-w-xl mt-4 leading-relaxed ${textSub}`}>
                        No subscriptions. No hidden hosting markups. Get a fully tailored, beautifully designed 100% active website with WhatsApp order booking and custom UPI QR payments setup.
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-4 bg-slate-950 p-8 rounded-2xl border border-slate-900 shadow-xl min-w-[280px]">
                      <div className="text-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block">Complete Price</span>
                        <span className="text-5xl font-black text-white mt-1 block">₹{settings?.pricing}</span>
                        <span className="text-slate-400 text-[10px] font-medium block mt-2">All assets & domain hosting included</span>
                      </div>
                      <button
                        onClick={() => setActiveView("builder")}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 rounded-lg transition"
                      >
                        Launch Prompt Engine
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Value Features section overview */}
              {settings?.enabledSections.services && (
                <div className="flex flex-col gap-12">
                  <div className="text-center">
                    <h2 className={`text-2xl md:text-4xl font-black tracking-tight ${textTitle}`}>
                      Engineered for Action, <span className="bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">Built to Convert</span>
                    </h2>
                    <p className={`text-sm max-w-xl mx-auto mt-3 ${textSub}`}>
                      We bypass redundant visual templates, leveraging customized structures optimized specifically to convert customer layout clicks into direct active WhatsApp conversations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className={`p-8 rounded-2xl border ${cardBg}`}>
                      <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-500 mb-6">
                        <Coins className="w-6 h-6" />
                      </div>
                      <h3 className={`text-lg font-bold mb-2 ${textTitle}`}>Instant UPI Payments</h3>
                      <p className={`text-xs leading-relaxed ${textSub}`}>
                        Accept Indian payments immediately. Every custom package includes a tailored QR panel ready to support customer payments with clear order validations.
                      </p>
                    </div>

                    <div className={`p-8 rounded-2xl border ${cardBg}`}>
                      <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-500 mb-6">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <h3 className={`text-lg font-bold mb-2 ${textTitle}`}>Direct WhatsApp Leads</h3>
                      <p className={`text-xs leading-relaxed ${textSub}`}>
                        Bypass cart fatigue and bounce rates. Direct floating actions launch instant chats on your clients device, linking active inquiries instantly.
                      </p>
                    </div>

                    <div className={`p-8 rounded-2xl border ${cardBg}`}>
                      <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-500 mb-6">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <h3 className={`text-lg font-bold mb-2 ${textTitle}`}>Search Engine Optimization</h3>
                      <p className={`text-xs leading-relaxed ${textSub}`}>
                        Every layout generated incorporates clean metadata structuring, fast loading components, and mobile configurations that improve organic client positioning.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* AI Website Prompt Builder page view */}
          {activeView === "builder" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div>
                  <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${textTitle}`}>
                    Describe Your <span className="text-violet-500">Dream Website</span>
                  </h1>
                  <p className={`text-xs mt-2 leading-relaxed ${textSub}`}>
                    Describe your target customer, colors, items, and features. Our Gemini model translates prompts into custom structures in seconds.
                  </p>
                </div>

                <form onSubmit={handleGenerateWebsite} className={`p-6 rounded-2xl border ${cardBg} flex flex-col gap-4`}>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-3">Select Your Custom Web Blueprint (₹1,500 Flat Rate)</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan("portfolio")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedPlan === "portfolio"
                            ? "bg-[#66FCF1]/5 border-[#66FCF1] shadow-[0_0_12px_rgba(102,252,241,0.15)] text-white"
                            : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-[#C5C6C7]/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Dynamic Portfolio Setup</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${selectedPlan === "portfolio" ? "bg-[#66FCF1] text-[#0B0C10]" : "bg-slate-800/80 text-slate-400"}`}>₹1,500</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Perfect for freelancing, resumes, biographies, and personal visual galleries.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPlan("business")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedPlan === "business"
                            ? "bg-[#66FCF1]/5 border-[#66FCF1] shadow-[0_0_12px_rgba(102,252,241,0.15)] text-white"
                            : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-[#C5C6C7]/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Business Landmark Showcase</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${selectedPlan === "business" ? "bg-[#66FCF1] text-[#0B0C10]" : "bg-slate-800/80 text-slate-400"}`}>₹1,500</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Features clean layout reviews, high capacity services cards, and clinical maps.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPlan("ecommerce")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedPlan === "ecommerce"
                            ? "bg-[#66FCF1]/5 border-[#66FCF1] shadow-[0_0_12px_rgba(102,252,241,0.15)] text-white"
                            : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-[#C5C6C7]/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Conversational Storefront</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${selectedPlan === "ecommerce" ? "bg-[#66FCF1] text-[#0B0C10]" : "bg-slate-800/80 text-slate-400"}`}>₹1,500</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Offers WhatsApp order click hooks, standard direct catalog grids, and UPI QR codes.</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-2">My Website Idea</label>
                    <textarea
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      rows={6}
                      placeholder="e.g., A premium, modern boutique organic tea shop called 'Nilgiri Leaves'. Include three tea plans with pricing, of which Nilgiri Green is featured, a philosophy section focusing on pure mountain ingredients, and FAQs about shipping in India."
                      className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 p-4 font-mono text-xs placeholder-slate-600 outline-none focus:border-violet-500/50 transition-colors resize-none leading-relaxed"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-2">My Email (For Delivery)</label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="myemail@domain.com"
                        className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3 py-2 text-xs outline-none focus:border-violet-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-2">My Phone Number</label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3 py-2 text-xs outline-none focus:border-violet-500/50"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-violet-600/10 cursor-pointer transition"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        Generating Layout...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        Assemble Concept Setup
                      </>
                    )}
                  </button>
                </form>

                {generatedRequest && (
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-5 rounded-xl text-xs flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-bold">Initial Request Concept successfully assembled!</span>
                    </div>
                    <p className="leading-relaxed">
                      Your unique order reference is <strong className="text-white select-all font-mono">{generatedRequest.orderId}</strong>.
                    </p>
                    <p className="leading-relaxed">
                      Now, secure this concept to active development. Proceed to make the launch payment of <strong>₹{settings?.pricing}</strong> using our UPI QR Gateway, and your customized website will deploy in 24 hours.
                    </p>
                    <button
                      onClick={() => setActiveView("payment")}
                      className="bg-emerald-500 text-slate-950 hover:bg-emerald-600 font-bold text-xs py-2.5 rounded-lg text-center transition"
                    >
                      Make Launch Payment Now
                    </button>
                  </div>
                )}
              </div>

              {/* Rendering preview block or placeholder */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl min-h-[500px]">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                      <Sparkles className="w-6 h-6 text-violet-500 absolute top-5 left-5 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-white mt-8 mb-2">Nanu Neural Builder Active</h3>
                    <p className="text-xs text-slate-400 animate-pulse font-mono">{generationSteps}</p>
                  </div>
                ) : generatedRequest?.generatedConfig ? (
                  <GeneratedWebsiteRenderer config={generatedRequest.generatedConfig} />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl min-h-[500px] text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800 mb-6">
                      <Globe className="w-8 h-8" />
                    </div>
                    <h3 className={`text-base font-bold ${textTitle}`}>Website Rendering Stage</h3>
                    <p className={`text-xs max-w-sm mt-2 leading-relaxed ${textSub}`}>
                      Submit a layout description on the prompt inputs, and the neural processor will render a live, responsive layout here dynamically.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Pricing Page view */}
          {activeView === "pricing" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-16"
            >
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs font-bold text-[#66FCF1] bg-[#66FCF1]/10 rounded-full px-3 py-1 border border-[#66FCF1]/20">
                  OUR TRANSPARENT FLAT RATE
                </span>
                <h1 className={`text-3xl md:text-5xl font-black mt-4 tracking-tight ${textTitle}`}>
                  Premium Web Blueprints. <br />
                  <span className="text-[#66FCF1]">Only ₹1,500 Per Website.</span>
                </h1>
                <p className={`text-xs md:text-sm mt-3 ${textSub}`}>
                  No subscription lock-ins. No hidden maintenance upcharges. Select an direct active blueprint tailored specifically around your business goals, priced at a complete flat rate.
                </p>
              </div>

              {/* Main premium pricing comparison cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {/* 1. Portfolio Blueprint Card */}
                <div className={`p-8 rounded-2xl border ${cardBg} flex flex-col justify-between hover:border-[#66FCF1]/30 hover:shadow-[0_0_15px_rgba(102,252,241,0.08)] transition-all duration-300`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-base font-bold uppercase tracking-wider ${textTitle}`}>Dynamic Portfolio</h3>
                      <span className="text-xs font-bold text-[#66FCF1] bg-[#66FCF1]/15 px-2 py-1 rounded">₹{settings?.pricing || 1500}</span>
                    </div>
                    <p className={`text-xs leading-relaxed mb-6 ${textSub}`}>
                      Perfect for freelancers, resumes, biographies, and personal visual galleries built beautifully.
                    </p>
                    <ul className="text-xs text-slate-300 space-y-3.5 border-t border-white/5 pt-6 leading-relaxed">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        Interactive Storytelling Sections
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        High-Resolution Portfolio Gallery
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        100% Mobile Responsive Layouts
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        Social Channels Integration
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        Fast Domain Host Provisioning
                      </li>
                    </ul>
                  </div>
                  <button onClick={() => { setSelectedPlan("portfolio"); setActiveView("builder"); }} className="w-full bg-[#1F2833] hover:bg-[#1F2833]/80 text-[#C5C6C7] text-xs font-bold py-3 rounded-lg mt-8 border border-white/10 transition-all cursor-pointer">
                    Choose Portfolio Setup
                  </button>
                </div>

                {/* 2. Business Landmark Card */}
                <div className={`p-8 md:p-10 rounded-3xl border-2 border-[#66FCF1] relative flex flex-col justify-between ${cardBg} shadow-[0_0_20px_rgba(102,252,241,0.15)]`}>
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-widest text-[#0B0C10] bg-gradient-to-r from-[#66FCF1] to-[#45A29E] px-4 py-1.5 rounded-full uppercase border border-[#66FCF1]">
                    RECOMMENDED CUSTOM
                  </span>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4.5 h-4.5 text-[#66FCF1]" />
                        Business Showcase
                      </h3>
                      <span className="text-xs font-bold text-[#0B0C10] bg-[#66FCF1] px-2 py-0.5 rounded-md font-extrabold shadow-sm">₹{settings?.pricing || 1500}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      Best for local service shops, agencies, clinics, and cafes looking to showcase their capabilities comprehensively.
                    </p>
                    <ul className="text-xs text-slate-200 space-y-3.5 border-t border-white/10 pt-6 leading-relaxed">
                      <li className="flex items-center gap-2.5 font-bold text-white">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        Tailored AI Copywriting & Sections
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        Comprehensive Services Lists
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        Clinical Maps & Route Placeholders
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        WhatsApp Floating Inquiry Chat Link
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        SEO Configurations & Hosting Pack
                      </li>
                    </ul>
                  </div>
                  <button onClick={() => { setSelectedPlan("business"); setActiveView("builder"); }} className="w-full bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-[#0B0C10] text-xs font-bold py-3.5 rounded-xl mt-8 shadow-lg shadow-[#66FCF1]/20 cursor-pointer transition-all hover:brightness-110">
                    Choose Business Showcase
                  </button>
                </div>

                {/* 3. Conversational Storefront Card */}
                <div className={`p-8 rounded-2xl border ${cardBg} flex flex-col justify-between hover:border-[#66FCF1]/30 hover:shadow-[0_0_15px_rgba(102,252,241,0.08)] transition-all duration-300`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-base font-bold uppercase tracking-wider ${textTitle}`}>Smart Storefront</h3>
                      <span className="text-xs font-bold text-[#66FCF1] bg-[#66FCF1]/15 px-2 py-1 rounded">₹{settings?.pricing || 1500}</span>
                    </div>
                    <p className={`text-xs leading-relaxed mb-6 ${textSub}`}>
                      Ideal for direct sellers, boutiques, home bakers, and makers desiring straightforward checkout leads.
                    </p>
                    <ul className="text-xs text-slate-300 space-y-3.5 border-t border-white/5 pt-6 leading-relaxed">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        Product Catalog Layout Showcase
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        WhatsApp Direct Order Click Hooks
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        UPI Payment QR Box Integration
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        100% Mobile Fluid Checkout Interface
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#66FCF1] flex-shrink-0" />
                        Included File Hosting Setup
                      </li>
                    </ul>
                  </div>
                  <button onClick={() => { setSelectedPlan("ecommerce"); setActiveView("builder"); }} className="w-full bg-[#1F2833] hover:bg-[#1F2833]/80 text-[#C5C6C7] text-xs font-bold py-3 rounded-lg mt-8 border border-white/10 transition-all cursor-pointer">
                    Choose Storefront Setup
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Portfolio & Demo gallery page view */}
          {activeView === "portfolio" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-12"
            >
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-bold text-violet-400 bg-violet-500/10 rounded-full px-3 py-1 border border-violet-500/20">
                  SHOCAWING PREVIOUS LAUNCHES
                </span>
                <h1 className={`text-3xl md:text-5xl font-black mt-3 ${textTitle}`}>
                  Previous Website <span className="text-violet-500">Refinements</span>
                </h1>
                <p className={`text-xs mt-2 ${textSub}`}>
                  Browse some of our premium deployed setups across diverse business categories. Click to explore structures and layouts.
                </p>
              </div>

              {/* Grid of portfolio projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {portfolio.map((project: PortfolioProject) => (
                  <div
                    key={project.id}
                    className={`rounded-2xl border overflow-hidden ${cardBg} group hover:border-violet-500/40 transition-all duration-300 flex flex-col`}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-slate-900/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-slate-800">
                          {project.category}
                        </span>
                        {project.featured && (
                          <span className="bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Popular Setup
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <h3 className={`text-lg font-bold mb-2 group-hover:text-violet-400 transition-colors ${textTitle}`}>
                          {project.title}
                        </h3>
                        <p className={`text-xs leading-relaxed mb-4 ${textSub}`}>
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.map((tag, idx) => (
                            <span key={idx} className="bg-slate-500/5 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-800/40">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <a
                        href={project.liveUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-white transition-colors mt-2"
                      >
                        Launch Interactive Mockup
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Services page view */}
          {activeView === "services" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-16"
            >
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-bold text-violet-400 bg-violet-500/10 rounded-full px-3 py-1 border border-violet-500/20">
                  DEVELOPMENT SPECTRUM
                </span>
                <h1 className={`text-3xl md:text-5xl font-black mt-3 ${textTitle}`}>
                  Supported <span className="text-violet-500">Web Frameworks</span>
                </h1>
                <p className={`text-xs mt-2 ${textSub}`}>
                  Our prompt models represent custom optimizations tailored for diverse target businesses.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* 1. Business websites */}
                <div className={`p-8 rounded-2xl border ${cardBg} flex flex-col gap-5`}>
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${textTitle}`}>Business Websites</h3>
                    <p className={`text-xs leading-relaxed mt-2 ${textSub}`}>
                      Highly polished clinical, consultant, corporate, or real estate agency front-faces designed to capture leads, showcase credentials, and integrate instant call actions.
                    </p>
                  </div>
                  <button onClick={() => { setPromptInput("A premium real estate consultancy website called Apex Realty..."); setActiveView("builder"); }} className="text-xs font-bold text-violet-400 text-left hover:text-white transition-colors mt-auto">
                    Configure this template →
                  </button>
                </div>

                {/* 2. E-commerce websites */}
                <div className={`p-8 rounded-2xl border ${cardBg} flex flex-col gap-5`}>
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${textTitle}`}>E-commerce Stores</h3>
                    <p className={`text-xs leading-relaxed mt-2 ${textSub}`}>
                      Showcase active products, integrate image gallery layouts, let clients configure filters, and setup seamless Indian order logs routed directly via WhatsApp chats.
                    </p>
                  </div>
                  <button onClick={() => { setPromptInput("Handmade herbal cosmetics shop with individual pricing details..."); setActiveView("builder"); }} className="text-xs font-bold text-violet-400 text-left hover:text-white transition-colors mt-auto">
                    Configure this template →
                  </button>
                </div>

                {/* 3. Portfolio website */}
                <div className={`p-8 rounded-2xl border ${cardBg} flex flex-col gap-5`}>
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${textTitle}`}>Personal Portfolios</h3>
                    <p className={`text-xs leading-relaxed mt-2 ${textSub}`}>
                      Dedicated websites for engineers, copywriters, legal counselors, founders, or graphic designers to publish credentials, resume histories, and showcase custom achievements.
                    </p>
                  </div>
                  <button onClick={() => { setPromptInput("Clean portfolio layout for a senior freelance UI designer based in Pune..."); setActiveView("builder"); }} className="text-xs font-bold text-violet-400 text-left hover:text-white transition-colors mt-auto">
                    Configure this template →
                  </button>
                </div>

                {/* 4. Landing Pages */}
                <div className={`p-8 rounded-2xl border ${cardBg} flex flex-col gap-5`}>
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${textTitle}`}>Landing Pages</h3>
                    <p className={`text-xs leading-relaxed mt-2 ${textSub}`}>
                      High-conversion, single-view setups perfect for newly launched mobile apps, organic products, specific book releases, or local startup marketing.
                    </p>
                  </div>
                  <button onClick={() => { setPromptInput("A single page landing layout for organic energy shots packaging..."); setActiveView("builder"); }} className="text-xs font-bold text-violet-400 text-left hover:text-white transition-colors mt-auto">
                    Configure this template →
                  </button>
                </div>

                {/* 5. Custom Web apps */}
                <div className={`p-8 rounded-2xl border ${cardBg} flex flex-col gap-5`}>
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${textTitle}`}>Custom Web Apps</h3>
                    <p className={`text-xs leading-relaxed mt-2 ${textSub}`}>
                      Rich configurations built with interactive calculator metrics, custom pricing presets, and responsive dashboard templates that fit SaaS utilities perfectly.
                    </p>
                  </div>
                  <button onClick={() => { setPromptInput("SaaS design for a micro marketing analytics planner platform..."); setActiveView("builder"); }} className="text-xs font-bold text-violet-400 text-left hover:text-white transition-colors mt-auto">
                    Configure this template →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* About Us page view */}
          {activeView === "about" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
            >
              <div className="md:col-span-5 flex flex-col gap-4 text-center md:text-left">
                {settings?.founderPhoto ? (
                  <div className="relative w-72 h-82 mx-auto md:mx-0 rounded-3xl overflow-hidden border-2 border-violet-500/20 shadow-2xl">
                    <img
                      src={settings?.founderPhoto}
                      alt="Praveen Rajesh Purohit"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-72 h-82 mx-auto md:mx-0 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Users className="w-16 h-16 text-slate-700" />
                  </div>
                )}
                <div>
                  <h3 className={`text-xl font-bold ${textTitle}`}>{settings?.founderName || "Praveen Rajesh Purohit"}</h3>
                  <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider">FOUNDER & CEO, NANU.AI</p>
                </div>
              </div>

              <div className="md:col-span-7 flex flex-col gap-6">
                <div>
                  <span className="text-xs font-bold text-violet-400 bg-violet-500/10 rounded-full px-3 py-1 border border-violet-500/20">
                    COMPANY CHRONICLES
                  </span>
                  <h1 className={`text-3xl md:text-5xl font-black mt-4 ${textTitle}`}>
                    Our Story & <span className="text-violet-500">Mission</span>
                  </h1>
                </div>

                <p className={`text-sm leading-relaxed ${textSub}`}>
                  {settings?.founderBio || "Nanu.AI is focused on bringing premium, bespoke digital presences to businesses of all sizes across India. Traditional visual builders or agencies lock owners behind high fees or tedious weeks of waiting. By utilizing advanced layout compiler engines, we assemble active layouts and deploy customized websites in under hours."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800/40">
                  <div>
                    <h4 className={`text-base font-bold mb-1.5 ${textTitle}`}>The Vision</h4>
                    <p className={`text-xs leading-relaxed ${textSub}`}>
                      Democratize professional web design, giving independent freelancers, therapists, and small retail stores equal power to scale their brands online.
                    </p>
                  </div>
                  <div>
                    <h4 className={`text-base font-bold mb-1.5 ${textTitle}`}>The Commitment</h4>
                    <p className={`text-xs leading-relaxed ${textSub}`}>
                      Clean structures, absolute transparent one-time pricing, zero maintenance upcharges, and dedicated human support via immediate channels.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* How It Works page view */}
          {activeView === "how-it-works" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-12"
            >
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-bold text-violet-400 bg-violet-500/10 rounded-full px-3 py-1 border border-violet-500/20">
                  DEVELOPMENT PIPELINE
                </span>
                <h1 className={`text-3xl md:text-5xl font-black mt-3 ${textTitle}`}>
                  How Nanu<span className="text-violet-500">.AI Works</span>
                </h1>
                <p className={`text-xs mt-2 ${textSub}`}>
                  We bridge state-of-the-art layout compilers with elite human design reviewers to deliver your website with absolute speed and zero hassle.
                </p>
              </div>

              {/* Staggered process steps cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Step 1 */}
                <div className={`p-6 rounded-2xl border ${cardBg} flex flex-col gap-4 text-center items-center`}>
                  <span className="text-2xl font-black text-violet-500 bg-violet-500/10 w-10 h-10 rounded-full flex items-center justify-center border border-violet-500/20">01</span>
                  <h3 className={`text-sm font-bold ${textTitle}`}>Enter Prompt</h3>
                  <p className={`text-xs leading-relaxed ${textSub}`}>
                    Type a detailed target description of your layout goals.
                  </p>
                </div>

                {/* Step 2 */}
                <div className={`p-6 rounded-2xl border ${cardBg} flex flex-col gap-4 text-center items-center`}>
                  <span className="text-2xl font-black text-violet-500 bg-violet-500/10 w-10 h-10 rounded-full flex items-center justify-center border border-violet-500/20">02</span>
                  <h3 className={`text-sm font-bold ${textTitle}`}>Submit Request</h3>
                  <p className={`text-xs leading-relaxed ${textSub}`}>
                    The neural compiler configures typography, layout assets, and styled elements.
                  </p>
                </div>

                {/* Step 3 */}
                <div className={`p-6 rounded-2xl border ${cardBg} flex flex-col gap-4 text-center items-center`}>
                  <span className="text-2xl font-black text-violet-500 bg-violet-500/10 w-10 h-10 rounded-full flex items-center justify-center border border-violet-500/20">03</span>
                  <h3 className={`text-sm font-bold ${textTitle}`}>Review Concept</h3>
                  <p className={`text-xs leading-relaxed ${textSub}`}>
                    Toggle between desktop and mobile viewport checks of the draft blueprint.
                  </p>
                </div>

                {/* Step 4 */}
                <div className={`p-6 rounded-2xl border ${cardBg} flex flex-col gap-4 text-center items-center`}>
                  <span className="text-2xl font-black text-violet-500 bg-violet-500/10 w-10 h-10 rounded-full flex items-center justify-center border border-violet-500/20">04</span>
                  <h3 className={`text-sm font-bold ${textTitle}`}>Human Polish</h3>
                  <p className={`text-xs leading-relaxed ${textSub}`}>
                    Our design team clears spacing parameters, hooks hosting, and double checks mobile margins.
                  </p>
                </div>

                {/* Step 5 */}
                <div className={`p-6 rounded-2xl border ${cardBg} flex flex-col gap-4 text-center items-center`}>
                  <span className="text-2xl font-black text-violet-500 bg-violet-500/10 w-10 h-10 rounded-full flex items-center justify-center border border-violet-500/20">05</span>
                  <h3 className={`text-sm font-bold ${textTitle}`}>Delivery</h3>
                  <p className={`text-xs leading-relaxed ${textSub}`}>
                    Your website goes live on high-speed static hosted assets within 24-48 hours.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Secure Payment Gateway page view */}
          {activeView === "payment" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              {/* Left QR details card */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <span className="text-xs font-bold text-violet-400 bg-violet-500/10 rounded-full px-3 py-1 border border-violet-500/20">
                    SECURED UPI DEPLOYMENT
                  </span>
                  <h1 className={`text-3xl font-black mt-3 ${textTitle}`}>
                    Scan & <span className="text-violet-500">Deploy Instance</span>
                  </h1>
                  <p className={`text-xs mt-2 ${textSub}`}>
                    Complete the secure, one-time payment of <strong>₹{settings?.pricing || 1500}</strong> utilizing Indian UPI networks. Use Google Pay, PhonePe, BHIM, or Paytm directly.
                  </p>
                </div>

                <div className={`p-8 rounded-2xl border text-center flex flex-col items-center gap-6 ${cardBg} shadow-xl`}>
                  {settings?.qrCode ? (
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <img
                        src={settings?.qrCode}
                        alt="Dynamic UPI QR Code"
                        className="w-56 h-56 mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-56 h-56 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-slate-700" />
                    </div>
                  )}

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 w-full text-center">
                    <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500">Payee UPI ID</span>
                    <strong className="block text-sm text-wrap text-violet-400 mt-1 select-all font-mono">
                      {settings?.contactNumber}@upi
                    </strong>
                    <span className="block text-[9px] text-slate-500 mt-1">Nanu.AI Web platform accounts</span>
                  </div>
                </div>
              </div>

              {/* Right forms transaction update */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div id="payment-receipt-block" className={`p-8 rounded-2xl border ${cardBg} flex flex-col gap-6`}>
                  <h3 className={`text-lg font-black ${textTitle}`}>Confirm Transaction Receipts</h3>

                  {paySuccess ? (
                    <div className="bg-emerald-500/15 border border-emerald-500/25 p-6 rounded-xl text-center text-xs text-emerald-400 flex flex-col gap-4">
                      <CheckCircle2 className="w-12 h-12 mx-auto" />
                      <div>
                        <strong className="block text-white mb-1">Receipt Logged Successfully!</strong>
                        Your UPI validation receipt was loaded into active queue logs. Our admins are auditing the ledger synchronously. Your status will auto-shift to 'processing' shortly.
                      </div>
                      <button
                        onClick={() => { setPaySuccess(false); setActiveView("builder"); }}
                        className="bg-emerald-500 text-slate-950 font-bold px-6 py-2 rounded-lg"
                      >
                        Explore Project Stage
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">Order ID / Request Reference</label>
                          <input
                            type="text"
                            value={payOrderId}
                            onChange={(e) => setPayOrderId(e.target.value)}
                            placeholder="e.g. NANU-382910"
                            className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">UPI Ref / Transaction ID</label>
                          <input
                            type="text"
                            value={payTxId}
                            onChange={(e) => setPayTxId(e.target.value)}
                            placeholder="e.g., 619208392102"
                            className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">My Full Name</label>
                          <input
                            type="text"
                            value={payName}
                            onChange={(e) => setPayName(e.target.value)}
                            placeholder="Praveen Rajesh"
                            className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">My Email Address</label>
                          <input
                            type="email"
                            value={payEmail}
                            onChange={(e) => setPayEmail(e.target.value)}
                            placeholder="email@address.com"
                            className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">My Mobile Number</label>
                          <input
                            type="tel"
                            value={payPhone}
                            onChange={(e) => setPayPhone(e.target.value)}
                            placeholder="918401094966"
                            className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">Amount Paid (INR)</label>
                          <input
                            type="number"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                            required
                          />
                        </div>
                      </div>

                      {/* File Upload drag and drop receipt screenshot */}
                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-2">Upload UPI screenshot receipt (Optional)</label>
                        <div className="border border-dashed border-slate-800 hover:border-violet-500/50 rounded-xl p-6 text-center cursor-pointer relative bg-slate-950/40">
                          <input
                            type="file"
                            onChange={(e) => handlePhotoUpload(e, "screenshot")}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Upload className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                          <span className="text-xs block text-slate-400 font-medium">Drag-and-drop or select transaction image</span>
                          <span className="text-[10px] text-slate-600 block mt-1">PNG, JPG formats supported</span>
                        </div>
                        {payScreenshot && (
                          <div className="mt-4 flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                            <span className="text-[10px] font-mono text-emerald-400">File uploaded ready</span>
                            <button onClick={() => setPayScreenshot("")} className="text-red-500 text-xs ml-auto">Clear file</button>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3.5 rounded-xl transition"
                      >
                        Log Payment Confirmation
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact Us page view */}
          {activeView === "contact" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Left contacts info details */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                <div>
                  <span className="text-xs font-bold text-violet-400 bg-violet-500/10 rounded-full px-3 py-1 border border-violet-500/20">
                    GET IN TOUCH
                  </span>
                  <h1 className={`text-4xl font-black mt-3 ${textTitle}`}>
                    Contact Support <span className="text-violet-500">Instantly</span>
                  </h1>
                  <p className={`text-xs mt-2 leading-relaxed ${textSub}`}>
                    Have questions about specific feature sets, custom domain mapping or custom pricing packages? Message us, and our team will brief you immediately.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-500 flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">MOBILE NUMBER</span>
                      <a href={`tel:${settings?.contactNumber || "8401094966"}`} className={`text-sm font-semibold select-all ${textTitle}`}>
                        +91 {settings?.contactNumber || "8401094966"}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-500 flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">EMAIL ADDRESS</span>
                      <a href={`mailto:${settings?.contactEmail || "Praveenrajeshpurohit@gmail.com"}`} className={`text-sm font-semibold select-all ${textTitle}`}>
                        {settings?.contactEmail || "Praveenrajeshpurohit@gmail.com"}
                      </a>
                    </div>
                  </div>

                  {/* Location Map Placeholder */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-500 flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">HEADQUARTERS</span>
                      <span className={`text-sm font-semibold ${textTitle}`}>Gujarat, India</span>
                    </div>
                  </div>
                </div>

                {/* Google Map placeholder */}
                <div id="google-maps-placeholder" className="h-[200px] bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center text-center">
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_49px,#334155_50px),linear-gradient(transparent_49px,#334155_50px)] [background-size:100px_100px]" />
                  <div className="relative z-10 p-6 flex flex-col items-center">
                    <MapPin className="w-8 h-8 text-violet-500 animate-bounce mb-2" />
                    <strong className="text-xs text-white block">Interactive Map Route</strong>
                    <span className="text-[10px] text-slate-500 block mt-1">Nanu.AI Tech Hub, Gujarat, India</span>
                  </div>
                </div>
              </div>

              {/* Right contact request form */}
              <div className="lg:col-span-7">
                <div className={`p-8 rounded-2xl border ${cardBg}`}>
                  <h3 className={`text-lg font-black mb-6 ${textTitle}`}>Send Support Inquiry</h3>

                  {inquirySuccess ? (
                    <div className="bg-emerald-500/15 border border-emerald-500/25 p-8 rounded-xl text-center text-xs text-emerald-400 flex flex-col gap-4">
                      <CheckCircle2 className="w-10 h-10 mx-auto" />
                      <div>
                        <strong className="block text-white mb-1">Message Sent Successfully!</strong>
                        Your inquiry form was loaded into active administration ledger queue logs. We will get back to you via email or phone within 4-6 hours.
                      </div>
                      <button
                        onClick={() => setInquirySuccess(false)}
                        className="bg-emerald-500 text-slate-950 font-bold px-5 py-2 rounded-lg"
                      >
                        Send New Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">Your Full Name</label>
                          <input
                            type="text"
                            value={inquiryName}
                            onChange={(e) => setInquiryName(e.target.value)}
                            placeholder="e.g. Praveen"
                            className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">Your Email</label>
                          <input
                            type="email"
                            value={inquiryEmail}
                            onChange={(e) => setInquiryEmail(e.target.value)}
                            placeholder="name@email.com"
                            className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1">Subject</label>
                        <input
                          type="text"
                          value={inquirySubject}
                          onChange={(e) => setInquirySubject(e.target.value)}
                          placeholder="e.g. Custom layout request details"
                          className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1">My Message</label>
                        <textarea
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          rows={5}
                          placeholder="Type details of your custom question here..."
                          className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 p-4 text-xs outline-none focus:border-violet-500 resize-none leading-relaxed"
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 rounded-xl transition"
                      >
                        Transmit Support Inquiry
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* FAQS page view */}
          {activeView === "faq" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-12"
            >
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-bold text-violet-400 bg-violet-500/10 rounded-full px-3 py-1 border border-violet-500/20">
                  CLEARING BLOCKAGES
                </span>
                <h1 className={`text-3xl md:text-5xl font-black mt-3 ${textTitle}`}>
                  Frequently Asked <span className="text-violet-500">Questions</span>
                </h1>
                <p className={`text-xs mt-2 ${textSub}`}>
                  Browse answers to queries regarding payment receipts, design turnaround speeds, and custom domain configuration options.
                </p>
              </div>

              {/* FAQ Accordions block */}
              <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
                {faqs.map((faqItem: FAQ) => (
                  <div
                    key={faqItem.id}
                    className={`p-6 rounded-xl border ${cardBg} flex flex-col gap-3`}
                  >
                    <h3 className={`text-base font-bold flex items-start gap-2 ${textTitle}`}>
                      <HelpCircle className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                      {faqItem.question}
                    </h3>
                    <p className={`text-xs pl-7 leading-relaxed ${textSub}`}>
                      {faqItem.answer}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* My Plan & Status Tracking Stage */}
          {activeView === "my-plan" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-12 font-sans"
            >
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-bold text-[#66FCF1] bg-[#66FCF1]/10 rounded-full px-3 py-1 border border-[#66FCF1]/20 uppercase">
                  Transparent Digital Tracking
                </span>
                <h1 className={`text-3xl md:text-5xl font-black mt-3 ${textTitle}`}>
                  Track Your <span className="text-[#66FCF1]">Custom Plan</span>
                </h1>
                <p className={`text-xs mt-2 ${textSub}`}>
                  Enter your unique Order Reference Number or registered Email address to view your select contract package design, status, and compiled neural assets.
                </p>
              </div>

              {/* Lookup search bar */}
              <div className="max-w-xl mx-auto w-full">
                <form onSubmit={handleTrackRequest} className={`p-6 rounded-2xl border ${cardBg} flex flex-col gap-4 shadow-xl`}>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-2">Search Order Reference / Email</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={trackQuery}
                        onChange={(e) => setTrackQuery(e.target.value)}
                        placeholder="e.g. nanu-1729... or clients@domain.com"
                        className="w-full bg-slate-950 text-white rounded-xl border border-slate-800 pl-4 pr-12 py-3.5 text-xs outline-none focus:border-[#66FCF1] font-mono"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isTrackLoading}
                        className="absolute right-2 top-2 bg-[#66FCF1] hover:brightness-110 text-[#0B0C10] font-bold p-2.5 rounded-lg transition-all cursor-pointer"
                        title="Search instance"
                      >
                        {isTrackLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {trackError && (
                    <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 rounded-lg text-xs leading-relaxed text-center font-semibold">
                      {trackError}
                    </div>
                  )}
                </form>
              </div>

              {/* Track Search outcomes */}
              {hasTracked && (
                <div className="max-w-4xl mx-auto w-full flex flex-col gap-10">
                  {trackedRequests.length === 0 ? (
                    <div className="text-center py-16 bg-slate-900/45 rounded-3xl border border-dashed border-slate-800">
                      <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h3 className={`text-base font-bold ${textTitle}`}>No Blueprints Found</h3>
                      <p className={`text-xs text-slate-400 mt-1 max-w-xs mx-auto ${textSub}`}>
                        We didn't locate records matching "{trackQuery}". Check for typos or build your blueprint on the <strong>AI Builder</strong> page.
                      </p>
                      <button
                        onClick={() => setActiveView("builder")}
                        className="mt-6 bg-[#1F2833] hover:bg-slate-800 text-[#66FCF1] text-xs font-bold px-5 py-2.5 rounded-xl border border-white/5 transition"
                      >
                        Go to AI Builder
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8">
                      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Matched Contracts ({trackedRequests.length})</span>
                        <span className="text-[10px] text-slate-500 font-mono">Last query sync: {new Date().toLocaleTimeString()}</span>
                      </div>

                      {trackedRequests.map((req) => {
                        const planName = req.selectedPlan || "business";
                        const planTitle = 
                          planName === "portfolio" ? "Dynamic Portfolio Package" :
                          planName === "ecommerce" ? "Smart Storefront Package" : 
                          "Business Showcase Package";
                          
                        const planDesc = 
                          planName === "portfolio" ? "Includes interactive storytelling, personal galleries, and responsive visual cards ideal for creators." :
                          planName === "ecommerce" ? "Includes WhatsApp direct ordering clicks, product catalog interfaces, and custom UPI code hooks." :
                          "Includes multi-tier capability tabs, team display matrices, and precise maps location details.";

                        // Decide numerical stage based on status
                        let statusStage = 1; // Ordered
                        if (req.status === "processing") statusStage = 3; // AI Compile / Building
                        if (req.status === "completed") statusStage = 4; // Completed / Live Demo
                        if (req.status === "delivered") statusStage = 5; // Delivered

                        return (
                          <div key={req.id} className={`p-8 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#1F2833]/40 to-slate-950/40 shadow-2xl flex flex-col gap-8`}>
                            {/* Contract Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                              <div>
                                <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#66FCF1]">Active Service Blueprint</span>
                                <h3 className={`text-xl font-bold mt-1 ${textTitle}`}>{planTitle}</h3>
                                <p className="text-xs text-slate-400 mt-1 max-w-xl">{planDesc}</p>
                              </div>
                              <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl flex flex-col items-start min-w-[150px]">
                                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Package Cost</span>
                                <span className="text-lg font-black text-[#66FCF1] mt-0.5">₹1,500</span>
                                <span className="text-[9px] text-[#45A29E] font-extrabold">One-Time Flat Price</span>
                              </div>
                            </div>

                            {/* Master Overall Progress Bar */}
                            <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 flex flex-col gap-3 shadow-inner">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#66FCF1] animate-pulse" />
                                  Master Deployment Life-Cycle Progress
                                </span>
                                <span className="font-mono font-black text-[#66FCF1] text-xs bg-[#66FCF1]/10 px-2.5 py-0.5 rounded border border-[#66FCF1]/20">
                                  {req.status === "pending" ? "25% COMPLETE" : 
                                   req.status === "processing" ? "75% COMPILING" : "100% DESIGN ACTIVE"}
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-[2px] border border-slate-850">
                                <div 
                                  className="h-full bg-gradient-to-r from-teal-500 via-[#45A29E] to-[#66FCF1] rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(102,252,241,0.45)]"
                                  style={{ 
                                    width: req.status === "pending" ? "25%" : 
                                           req.status === "processing" ? "75%" : "100%" 
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                <span className="text-emerald-400">1. Ordered</span>
                                <span className={req.status !== "pending" ? "text-emerald-400" : "text-amber-400 animate-pulse"}>2. Verification</span>
                                <span className={req.status === "completed" || req.status === "delivered" ? "text-emerald-400" : req.status === "processing" ? "text-[#66FCF1] animate-pulse" : "text-slate-600"}>3. AI Building</span>
                                <span className={req.status === "completed" || req.status === "delivered" ? "text-emerald-400" : "text-slate-600"}>4. Live</span>
                              </div>
                            </div>

                            {/* Prompt representation details */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                              <div className="lg:col-span-7 flex flex-col gap-5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your App Idea & Prompts</h4>
                                <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800/60 font-mono text-xs text-slate-300 leading-relaxed select-all shadow-inner">
                                  {req.prompt}
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                    <span className="block text-[10px] text-slate-500">Order Reference</span>
                                    <span className="block text-white font-bold select-all mt-1">{req.orderId}</span>
                                  </div>
                                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                    <span className="block text-[10px] text-slate-500">Service Created</span>
                                    <span className="block text-white font-bold mt-1">
                                      {new Date(req.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="lg:col-span-5 flex flex-col gap-5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lifecycle Progress Stages</h4>
                                
                                {/* Status Tracker Steps with Individual Progress Bars */}
                                <div className="flex flex-col gap-4">
                                  {/* Step 1: Ordered / Blueprint Assembled */}
                                  <div className="bg-slate-950/40 p-4.5 rounded-xl border border-white/5 flex flex-col gap-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        </div>
                                        <div>
                                          <h5 className="text-xs font-bold text-white">1. Blueprint Ordered</h5>
                                          <p className="text-[10px] text-slate-400">Neural prompt structure assembled.</p>
                                        </div>
                                      </div>
                                      <span className="text-[10px] font-mono text-emerald-400 font-bold">100%</span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 p-[1px]">
                                      <div className="h-full bg-emerald-400 rounded-full w-full" />
                                    </div>
                                  </div>

                                  {/* Step 2: Ledger Verification */}
                                  <div className="bg-slate-950/40 p-4.5 rounded-xl border border-white/5 flex flex-col gap-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-2.5">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                          req.status !== "pending" 
                                            ? "bg-emerald-500/10 border border-emerald-500/20" 
                                            : "bg-amber-500/10 border border-amber-500/20 animate-pulse"
                                        }`}>
                                          {req.status !== "pending" ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          ) : (
                                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                                          )}
                                        </div>
                                        <div>
                                          <h5 className="text-xs font-bold text-white">2. Ledger Verification</h5>
                                          <p className="text-[10px] text-slate-400">
                                            {req.status !== "pending" ? "UPI transaction verified & cleared." : "Awaiting QR scanner confirmation."}
                                          </p>
                                        </div>
                                      </div>
                                      <span className={`text-[10px] font-mono font-bold ${req.status !== "pending" ? "text-emerald-400" : "text-amber-400"}`}>
                                        {req.status !== "pending" ? "100%" : "30%"}
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 p-[1px]">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          req.status !== "pending" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                                        }`}
                                        style={{ width: req.status !== "pending" ? "100%" : "30%" }}
                                      />
                                    </div>
                                  </div>

                                  {/* Step 3: AI Compile */}
                                  <div className="bg-slate-950/40 p-4.5 rounded-xl border border-white/5 flex flex-col gap-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-2.5">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                          req.status === "completed" || req.status === "delivered" 
                                            ? "bg-emerald-500/10 border border-emerald-500/20" 
                                            : req.status === "processing" 
                                            ? "bg-[#66FCF1]/15 border border-[#66FCF1]/30 animate-pulse" 
                                            : "bg-slate-900 border border-slate-800 text-slate-600"
                                        }`}>
                                          {req.status === "completed" || req.status === "delivered" ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          ) : req.status === "processing" ? (
                                            <Sparkles className="w-3.5 h-3.5 text-[#66FCF1] animate-pulse" />
                                          ) : (
                                            <Lock className="w-3 h-3" />
                                          )}
                                        </div>
                                        <div>
                                          <h5 className={`text-xs font-bold ${req.status === "pending" ? "text-slate-500" : "text-white"}`}>3. Neural Building</h5>
                                          <p className="text-[10px] text-slate-400">
                                            {req.status === "completed" || req.status === "delivered" ? "Gemini layouts completely verified." : 
                                             req.status === "processing" ? "Compiling active layout cards..." : "Locked until payment cleared."}
                                          </p>
                                        </div>
                                      </div>
                                      <span className={`text-[10px] font-mono font-bold ${
                                        req.status === "completed" || req.status === "delivered" ? "text-emerald-400" : 
                                        req.status === "processing" ? "text-[#66FCF1]" : "text-slate-600"
                                      }`}>
                                        {req.status === "completed" || req.status === "delivered" ? "100%" : 
                                         req.status === "processing" ? "65%" : "0%"}
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 p-[1px]">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          req.status === "completed" || req.status === "delivered" ? "bg-emerald-400" : 
                                          req.status === "processing" ? "bg-[#66FCF1] animate-pulse" : "bg-slate-850"
                                        }`}
                                        style={{ 
                                          width: req.status === "completed" || req.status === "delivered" ? "100%" : 
                                                 req.status === "processing" ? "65%" : "0%" 
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {/* Step 4: Live Demo */}
                                  <div className="bg-slate-950/40 p-4.5 rounded-xl border border-white/5 flex flex-col gap-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-2.5">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                          req.status === "completed" || req.status === "delivered" 
                                            ? "bg-emerald-500/10 border border-emerald-500/20" 
                                            : "bg-slate-900 border border-slate-800 text-slate-600"
                                        }`}>
                                          {req.status === "completed" || req.status === "delivered" ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                                          ) : (
                                            <Lock className="w-3 h-3" />
                                          )}
                                        </div>
                                        <div>
                                          <h5 className={`text-xs font-bold ${req.status === "completed" || req.status === "delivered" ? "text-white" : "text-slate-500"}`}>4. Live Blueprint Active</h5>
                                          <p className="text-[10px] text-slate-400">
                                            {req.status === "completed" || req.status === "delivered" ? "Your custom page is fully compiled!" : "Waiting on neural builder phase."}
                                          </p>
                                        </div>
                                      </div>
                                      <span className={`text-[10px] font-mono font-bold ${req.status === "completed" || req.status === "delivered" ? "text-emerald-400" : "text-slate-600"}`}>
                                        {req.status === "completed" || req.status === "delivered" ? "100%" : "0%"}
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 p-[1px]">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          req.status === "completed" || req.status === "delivered" ? "bg-emerald-400" : "bg-slate-850"
                                        }`}
                                        style={{ width: req.status === "completed" || req.status === "delivered" ? "100%" : "0%" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons Grid */}
                            <div className="border-t border-white/5 pt-6 flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-semibold">Registered EmailContact info:</span>
                                <span className="text-[11px] font-bold text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
                                  📧 {req.userEmail || "No Email Specified"}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {req.generatedConfig ? (
                                  <button
                                    onClick={() => handleViewLivePreview(req)}
                                    className="bg-gradient-to-r from-[#66FCF1] to-[#45A29E] hover:brightness-110 text-[#0B0C10] font-black text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-[#66FCF1]/10 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Sparkles className="w-4 h-4" />
                                    Launch Neural Live Demo
                                  </button>
                                ) : (
                                  <div className="text-[11px] text-amber-400 bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/20 max-w-sm">
                                    Your custom layout description is queued. Make sure launch payment is completed below.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Space for uploading / scanning payment QR Code */}
                            {req.status === "pending" && (
                              <div className="border-t border-white/5 pt-6 bg-slate-950/45 p-6 rounded-2xl border border-slate-800/80 mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                  <div className="md:col-span-4 text-center">
                                    {settings?.qrCode ? (
                                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 inline-block shadow-lg">
                                        <img
                                          src={settings?.qrCode}
                                          alt="Payment UPI QR"
                                          className="w-36 h-36"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-36 h-36 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center mx-auto">
                                        <RefreshCw className="w-6 h-6 animate-spin text-[#66FCF1]" />
                                      </div>
                                    )}
                                    <span className="block text-[10px] text-slate-400 mt-2 font-mono select-all">UPI ID: {settings?.contactNumber || "9999999999"}@upi</span>
                                  </div>
                                  
                                  <div className="md:col-span-8 flex flex-col gap-3">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded bg-amber-400" />
                                      Complete Payment (One-Time Flat ₹1,500)
                                    </h4>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">
                                      Use any UPI App to scan the official QR code, pay the flat ₹1,500 rate, and enter transaction reference details here to push this contract to live development.
                                    </p>
                                    <button
                                      onClick={() => {
                                        setPayOrderId(req.orderId);
                                        setPayEmail(req.userEmail || "");
                                        setPayPhone(req.userPhone || "");
                                        setPayAmount("1500");
                                        setActiveView("payment");
                                      }}
                                      className="bg-slate-900 hover:bg-[#1F2833] text-white border border-slate-800 hover:border-[#66FCF1]/20 font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center gap-2 self-start cursor-pointer"
                                    >
                                      Go to UPI Confirmation Safe Gateway
                                      <ArrowRight className="w-3.5 h-3.5 text-[#66FCF1]" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Secure Admin Control Panel Login / Dashboard view */}
          {activeView === "admin" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-10"
            >
              {!adminToken ? (
                /* Admin Login Box */
                <div className="max-w-md mx-auto w-full py-12">
                  <div className={`p-8 rounded-3xl border flex flex-col gap-6 ${cardBg}`}>
                    <div className="text-center">
                      <Lock className="w-10 h-10 text-violet-500 mx-auto mb-3" />
                      <h2 className={`text-xl font-black ${textTitle}`}>Secure Administrative Login</h2>
                      <p className={`text-xs mt-1 ${textSub}`}>Enter credentials to manage database systems.</p>
                    </div>

                    {loginError && (
                      <div className="bg-red-500/10 text-red-500 border border-red-500/25 p-3 rounded-lg text-xs leading-relaxed text-center">
                        {loginError}
                      </div>
                    )}

                    <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1">Username</label>
                        <input
                          type="text"
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          placeholder="e.g. admin"
                          className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1">Password</label>
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-violet-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 rounded-xl transition mt-2"
                      >
                        Authenticate credentials
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* Authenticated Admin Dashboard Workspace */
                <div className="flex flex-col gap-8">
                  <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
                    <div>
                      <h1 className="text-3xl font-black text-white flex items-center gap-2">
                        <Lock className="w-6 h-6 text-violet-500" />
                        Nanu.AI Admin Central
                      </h1>
                      <p className="text-xs text-slate-400 mt-1">Manage customer prompts, payment receipts, sections, and portfolio systems.</p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out Console
                    </button>
                  </div>

                  {/* Dashboard top tabs list */}
                  <div className="flex flex-wrap bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1">
                    <button
                      onClick={() => setActiveAdminTab("requests")}
                      className={`text-xs font-bold px-4 py-2.5 rounded-lg transition ${activeAdminTab === "requests" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Website Prompts ({requestsList.length})
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("payments")}
                      className={`text-xs font-bold px-4 py-2.5 rounded-lg transition ${activeAdminTab === "payments" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      UPI Receipts ({paymentsList.length})
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("inquiries")}
                      className={`text-xs font-bold px-4 py-2.5 rounded-lg transition ${activeAdminTab === "inquiries" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Support Inquiries ({inquiriesList.length})
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("portfolio")}
                      className={`text-xs font-bold px-4 py-2.5 rounded-lg transition ${activeAdminTab === "portfolio" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Customize Portfolio
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("faqs")}
                      className={`text-xs font-bold px-4 py-2.5 rounded-lg transition ${activeAdminTab === "faqs" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Manage FAQs
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("settings")}
                      className={`text-xs font-bold px-4 py-2.5 rounded-lg transition ${activeAdminTab === "settings" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Global Config & Sections
                    </button>
                  </div>

                  {/* Active TAB area */}
                  <div className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-3xl min-h-[400px]">
                    {/* A. Website Requests lists */}
                    {activeAdminTab === "requests" && (
                      <div className="flex flex-col gap-6 font-sans">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black tracking-wider uppercase text-[#66FCF1]">Customer Website Blueprints & Prompts</h3>
                          <span className="text-[11px] bg-slate-950 px-2.5 py-1 text-slate-400 rounded-lg border border-slate-800">
                            Total Orders: <strong className="text-[#66FCF1] font-mono">{requestsList.length}</strong>
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px]">
                                <th className="pb-3.5 font-bold">Order ID</th>
                                <th className="pb-3.5 font-bold">Selected Blueprint</th>
                                <th className="pb-3.5 font-bold">Customer Prompt & Idea</th>
                                <th className="pb-3.5 font-bold">Client Contacts</th>
                                <th className="pb-3.5 font-bold">Refined Design UI</th>
                                <th className="pb-3.5 font-bold">Status</th>
                                <th className="pb-3.5 font-bold text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {requestsList.map((req) => (
                                <tr key={req.id} className="border-b border-slate-800/50 text-slate-300 hover:bg-slate-950/40 transition">
                                  <td className="py-4 font-mono font-black text-white select-all">{req.orderId}</td>
                                  <td className="py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                      req.selectedPlan === "portfolio" ? "bg-amber-400/10 text-amber-300 border border-amber-400/20" :
                                      req.selectedPlan === "ecommerce" ? "bg-[#66FCF1]/10 text-[#66FCF1] border border-[#66FCF1]/20" :
                                      "bg-violet-400/10 text-violet-300 border border-violet-400/20"
                                    }`}>
                                      {req.selectedPlan || "business"}
                                    </span>
                                  </td>
                                  <td className="py-4 max-w-xs pr-4">
                                    <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80 font-mono text-[11px] text-slate-300 select-all leading-relaxed break-words whitespace-pre-wrap">
                                      {req.prompt}
                                    </div>
                                  </td>
                                  <td className="py-4">
                                    <span className="block text-slate-200 font-bold">{req.userEmail || "N/A"}</span>
                                    <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">{req.userPhone || "N/A"}</span>
                                  </td>
                                  <td className="py-4">
                                    {req.generatedConfig ? (
                                      <button
                                        onClick={() => {
                                          setGeneratedRequest(req);
                                          setActiveView("builder");
                                        }}
                                        className="bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 text-[10px] px-2.5 py-1.5 rounded-lg border border-indigo-500/20 transition inline-block font-mono font-bold"
                                        title="Click to mount in Playground Builder"
                                      >
                                        🛠️ {req.generatedConfig.siteName}
                                      </button>
                                    ) : (
                                      <span className="text-slate-500 font-mono italic">No Config compiled</span>
                                    )}
                                  </td>
                                  <td className="py-4">
                                    <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                                      req.status === "completed" || req.status === "delivered" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                      req.status === "processing" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                                      "bg-slate-800 text-slate-400 border border-slate-700"
                                    }`}>
                                      {req.status}
                                    </span>
                                  </td>
                                  <td className="py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => handleUpdateRequestStatus(req.id, "processing")}
                                        className="text-[10px] bg-slate-850 hover:bg-slate-700 text-white font-bold p-1.5 px-2.5 rounded-lg transition"
                                      >
                                        Build
                                      </button>
                                      <button
                                        onClick={() => handleUpdateRequestStatus(req.id, "completed")}
                                        className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 px-2.5 rounded-lg transition"
                                      >
                                        Complete
                                      </button>
                                      <button
                                        onClick={() => handleUpdateRequestStatus(req.id, "delivered")}
                                        className="text-[10px] bg-sky-600 hover:bg-sky-700 text-white font-bold p-1.5 px-2.5 rounded-lg transition"
                                      >
                                        Deliver
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* B. UPI Receipts */}
                    {activeAdminTab === "payments" && (
                      <div className="flex flex-col gap-6">
                        <h3 className="text-lg font-black text-white">Client Payment Audit logs</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                                <th className="pb-3 font-semibold">Ref ID</th>
                                <th className="pb-3 font-semibold">Order Reference</th>
                                <th className="pb-3 font-semibold">Payer Info</th>
                                <th className="pb-3 font-semibold">UPI Transaction ID</th>
                                <th className="pb-3 font-semibold">Audit Status</th>
                                <th className="pb-3 font-semibold">Screenshot</th>
                                <th className="pb-3 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paymentsList.map((pay) => (
                                <tr key={pay.id} className="border-b border-slate-800/60 text-slate-300">
                                  <td className="py-2.5 font-mono">{pay.id.slice(-6)}</td>
                                  <td className="py-2.5 font-bold font-mono text-white select-all">{pay.orderId}</td>
                                  <td className="py-2.5">
                                    <span className="block text-white font-bold">{pay.name}</span>
                                    <span className="block text-slate-400 text-[10px]">{pay.email}</span>
                                    <span className="block text-slate-500 text-[10px]">{pay.phone}</span>
                                  </td>
                                  <td className="py-2.5 font-mono text-yellow-400 select-all font-bold">{pay.transactionId}</td>
                                  <td className="py-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      pay.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                                      pay.status === "rejected" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-400"
                                    }`}>
                                      {pay.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5">
                                    {pay.screenshot ? (
                                      <a
                                        href={pay.screenshot}
                                        target="_blank"
                                        rel="no-referrer"
                                        className="text-[10px] text-violet-400 hover:underline"
                                      >
                                        View Image
                                      </a>
                                    ) : (
                                      <span className="text-slate-600">No screenshot loaded</span>
                                    )}
                                  </td>
                                  <td className="py-2.5">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleUpdatePaymentStatus(pay.id, "approved")}
                                        className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleUpdatePaymentStatus(pay.id, "rejected")}
                                        className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* C. inquiries list */}
                    {activeAdminTab === "inquiries" && (
                      <div className="flex flex-col gap-6">
                        <h3 className="text-lg font-black text-white">Client Inquiry Submissions</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-500 uppercase">
                                <th className="pb-3 font-semibold">Contact Name</th>
                                <th className="pb-3 font-semibold">Subject</th>
                                <th className="pb-3 font-semibold">Message Detail</th>
                                <th className="pb-3 font-semibold">Status</th>
                                <th className="pb-3 font-semibold">Invoiced Date</th>
                                <th className="pb-3 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inquiriesList.map((inq) => (
                                <tr key={inq.id} className="border-b border-slate-800/60 text-slate-300">
                                  <td className="py-4">
                                    <strong className="block text-white">{inq.name}</strong>
                                    <span className="block text-slate-400">{inq.email}</span>
                                  </td>
                                  <td className="py-4 max-w-xs">{inq.subject}</td>
                                  <td className="py-4 max-w-sm whitespace-pre-line text-[11px] leading-relaxed">{inq.message}</td>
                                  <td className="py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      inq.status === "new" ? "bg-blue-500/10 text-blue-400" : "bg-slate-500/10 text-slate-400"
                                    }`}>
                                      {inq.status}
                                    </span>
                                  </td>
                                  <td className="py-4 font-mono text-[10px]">{inq.createdAt.split("T")[0]}</td>
                                  <td className="py-4">
                                    <button
                                      onClick={() => handleUpdateInquiryStatus(inq.id, "replied")}
                                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded"
                                    >
                                      Mark Answered
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* D. Manage Portfolio Projects */}
                    {activeAdminTab === "portfolio" && (
                      <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-white">Customize Portfolio Projects</h3>
                          <button
                            onClick={() => {
                              setEditingProject(null);
                              setNewProjectForm({
                                title: "",
                                description: "",
                                category: "Business",
                                imageUrl: "",
                                tags: "",
                                liveUrl: "#",
                                featured: false
                              });
                              setIsAddingProject(true);
                            }}
                            className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition"
                          >
                            <Plus className="w-4 h-4 text-white" />
                            Add Project Log
                          </button>
                        </div>

                        {/* project forms */}
                        {isAddingProject && (
                          <form onSubmit={handleSaveProject} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
                            <h4 className="text-sm font-bold text-white">{editingProject ? "Edit Project Details" : "New Portfolio Record Entry"}</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Company Title</label>
                                <input
                                  type="text"
                                  value={newProjectForm.title}
                                  onChange={(e) => setNewProjectForm({ ...newProjectForm, title: e.target.value })}
                                  className="w-full bg-slate-900 text-white rounded-lg border border-slate-800 px-3 py-2 text-xs outline-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Business Category</label>
                                <select
                                  value={newProjectForm.category}
                                  onChange={(e) => setNewProjectForm({ ...newProjectForm, category: e.target.value })}
                                  className="w-full bg-slate-900 text-white rounded-lg border border-slate-800 px-3 py-2 text-xs outline-none"
                                >
                                  <option value="Business">Business Website</option>
                                  <option value="E-commerce">E-commerce Store</option>
                                  <option value="Portfolio">Personal Portfolio</option>
                                  <option value="Landing Page">Landing Page Layout</option>
                                  <option value="Custom App">Custom Application</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-400 block mb-1">Category Description Narrative</label>
                              <textarea
                                value={newProjectForm.description}
                                onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                                rows={3}
                                className="w-full bg-slate-900 text-white rounded-lg border border-slate-800 p-3 text-xs outline-none"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Illustration Url</label>
                                <input
                                  type="text"
                                  value={newProjectForm.imageUrl}
                                  onChange={(e) => setNewProjectForm({ ...newProjectForm, imageUrl: e.target.value })}
                                  placeholder="e.g. https://images.unsplash.com/..."
                                  className="w-full bg-slate-900 text-white rounded-lg border border-slate-800 px-3 py-2 text-xs outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Dynamic tags (comma separated)</label>
                                <input
                                  type="text"
                                  value={newProjectForm.tags}
                                  onChange={(e) => setNewProjectForm({ ...newProjectForm, tags: e.target.value })}
                                  placeholder="e.g. Restaurant, Menu, Clean"
                                  className="w-full bg-slate-900 text-white rounded-lg border border-slate-800 px-3 py-2 text-xs outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-6 py-2">
                              <label className="flex items-center gap-2 text-xs text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={newProjectForm.featured}
                                  onChange={(e) => setNewProjectForm({ ...newProjectForm, featured: e.target.checked })}
                                />
                                Showcase as Popular Setup
                              </label>
                            </div>

                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => setIsAddingProject(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-6 py-2 rounded-lg"
                              >
                                Save Project
                              </button>
                            </div>
                          </form>
                        )}

                        {/* List current portfolio entries */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {portfolio.map((proj) => (
                            <div key={proj.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <img src={proj.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />
                                <div>
                                  <strong className="block text-white text-xs">{proj.title}</strong>
                                  <span className="text-[10px] text-violet-400 font-bold">{proj.category}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingProject(proj);
                                    setNewProjectForm({
                                      title: proj.title,
                                      description: proj.description,
                                      category: proj.category,
                                      imageUrl: proj.imageUrl,
                                      tags: proj.tags.join(", "),
                                      liveUrl: proj.liveUrl,
                                      featured: proj.featured
                                    });
                                    setIsAddingProject(true);
                                  }}
                                  className="p-2 bg-slate-905 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-white"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(proj.id)}
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* E. Manage FAQS */}
                    {activeAdminTab === "faqs" && (
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-white">Administration FAQs Console</h3>
                          <button
                            onClick={() => {
                              setEditingFaq(null);
                              setNewFaqForm({ question: "", answer: "", category: "General" });
                              setIsAddingFaq(true);
                            }}
                            className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 transition"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
                            Add FAQ Entry
                          </button>
                        </div>

                        {isAddingFaq && (
                          <form onSubmit={handleSaveFaq} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
                            <h4 className="text-sm font-bold text-white">{editingFaq ? "Modify FAQ question details" : "New FAQ definition Setup"}</h4>
                            
                            <div>
                              <label className="text-xs font-bold text-slate-400 block mb-1">Standard Question Headline</label>
                              <input
                                type="text"
                                value={newFaqForm.question}
                                onChange={(e) => setNewFaqForm({ ...newFaqForm, question: e.target.value })}
                                className="w-full bg-slate-900 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-400 block mb-1">Standard answer writeup</label>
                              <textarea
                                value={newFaqForm.answer}
                                onChange={(e) => setNewFaqForm({ ...newFaqForm, answer: e.target.value })}
                                rows={4}
                                className="w-full bg-slate-900 text-white rounded-lg border border-slate-800 p-3.5 py-2 text-xs outline-none"
                                required
                              />
                            </div>

                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => setIsAddingFaq(false)}
                                className="bg-slate-800 text-white text-xs px-4 py-2 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="bg-violet-600 text-white text-xs font-bold px-6 py-2 rounded-lg"
                              >
                                Save FAQ
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="flex flex-col gap-4">
                          {faqs.map((fItem) => (
                            <div key={fItem.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <strong className="block text-white text-xs mb-1">{fItem.question}</strong>
                                <p className="text-[11px] text-slate-400 leading-relaxed">{fItem.answer}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingFaq(fItem);
                                    setNewFaqForm({ question: fItem.question, answer: fItem.answer, category: fItem.category });
                                    setIsAddingFaq(true);
                                  }}
                                  className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFaq(fItem.id)}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* F. Settings & Sections Enable Toggle controllers */}
                    {activeAdminTab === "settings" && settings && (
                      <div className="flex flex-col gap-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <h3 className="text-lg font-black text-white">Global Platform Configuration</h3>
                          <span className="text-[11px] bg-emerald-500/10 text-emerald-400 font-extrabold px-3 py-1 rounded-full border border-emerald-500/20 uppercase">
                            ✓ Dynamic DB Autoload
                          </span>
                        </div>

                        {/* Secure Admin Credentials Configuration Segment */}
                        <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 flex flex-col gap-4">
                          <div className="flex items-center gap-2.5">
                            <span className="p-2 rounded-xl bg-[#66FCF1]/10 text-[#66FCF1] flex items-center justify-center font-bold">🗝️</span>
                            <div>
                              <h4 className="text-xs font-black uppercase text-[#66FCF1] tracking-wider">Secure Administrative Login Settings</h4>
                              <p className="text-[10px] text-slate-400">Configure your professional entry identifier and password parameters.</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            <div>
                              <label className="text-xs font-bold text-slate-400 block mb-1">Administrative Username / Email</label>
                              <input
                                type="text"
                                value={settings.adminUsername || "praveenrajeshpurohit@gmail.com"}
                                onChange={(e) => updateAdminSettings({ adminUsername: e.target.value })}
                                className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-[#66FCF1] font-mono"
                                placeholder="praveenrajeshpurohit@gmail.com"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-400 block mb-1">Administrative Secure Password</label>
                              <input
                                type="text"
                                value={settings.adminPassword || "Praveen@5187"}
                                onChange={(e) => updateAdminSettings({ adminPassword: e.target.value })}
                                className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none focus:border-[#66FCF1] font-mono font-bold"
                                placeholder="Praveen@5187"
                              />
                            </div>
                          </div>
                        </div>

                        {/* General business parameters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-slate-350">
                          <div>
                            <label className="text-xs font-bold text-slate-450 block mb-1">Company Pricing rate (₹)</label>
                            <input
                              type="number"
                              value={settings.pricing}
                              onChange={(e) => updateAdminSettings({ pricing: Number(e.target.value) })}
                              className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none"
                            />
                            <span className="text-[10px] text-slate-500 block mt-1">Updates homepage packages listings</span>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-400 block mb-1">Founder Full Name</label>
                            <input
                              type="text"
                              value={settings.founderName}
                              onChange={(e) => updateAdminSettings({ founderName: e.target.value })}
                              className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-400 block mb-1">WhatsApp phone contacts (+91 format)</label>
                            <input
                              type="text"
                              value={settings.whatsappNumber}
                              onChange={(e) => updateAdminSettings({ whatsappNumber: e.target.value })}
                              className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-400 block mb-1">Email address</label>
                            <input
                              type="text"
                              value={settings.contactEmail}
                              onChange={(e) => updateAdminSettings({ contactEmail: e.target.value })}
                              className="w-full bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 text-xs outline-none"
                            />
                          </div>
                        </div>

                        {/* File uploads founder image & UPI QR Code */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-850 pt-8">
                          <div>
                            <label className="text-xs font-bold text-slate-400 block mb-2">Update Dynamic UPI QR Code (Admin Panel Upload)</label>
                            <div className="flex items-center gap-4">
                              <img src={settings.qrCode} alt="" className="w-20 h-20 bg-white border rounded p-1" />
                              <div className="relative border border-dashed border-slate-800 border-dashed rounded px-4 py-6 text-center flex-1">
                                <input
                                  type="file"
                                  onChange={(e) => handlePhotoUpload(e, "qrCode")}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Upload className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                                <span className="text-[11px] text-slate-400 block">Replace QR Image</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-400 block mb-2">Update Founder Representative Image</label>
                            <div className="flex items-center gap-4">
                              <img src={settings.founderPhoto} alt="" className="w-20 h-20 object-cover border rounded" />
                              <div className="relative border border-dashed border-slate-800 p-4 py-6 text-center flex-1">
                                <input
                                  type="file"
                                  onChange={(e) => handlePhotoUpload(e, "founderPhoto")}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Upload className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                                <span className="text-[11px] text-slate-400 block">Replace Founder Image</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section Activations - Enable/Disable Sections */}
                        <div className="border-t border-slate-850 pt-8">
                          <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Enable/Disable Homepage Website Sections</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Object.entries(settings.enabledSections).map(([secKey, isVal]) => (
                              <label key={secKey} className="flex items-center gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80 cursor-pointer hover:border-violet-500/30 transition-all select-none">
                                <input
                                  type="checkbox"
                                  checked={isVal as boolean}
                                  onChange={(e) => {
                                    const nextSecs = { ...settings.enabledSections, [secKey]: e.target.checked };
                                    updateAdminSettings({ enabledSections: nextSecs });
                                  }}
                                  className="accent-violet-500 cursor-pointer"
                                />
                                <span className="capitalize text-slate-300 font-medium">
                                  {secKey.replace(/([A-Z])/g, " $1")} Section
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Aesthetic standard footer */}
      <footer id="nanu-footer" className={`border-t ${borderCol} py-12 px-6 mt-16 transition-colors`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className={`text-sm font-black tracking-tight ${textTitle}`}>
              Nanu<span className="text-violet-500">.AI</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <button onClick={() => setActiveView("home")} className="hover:text-white transition">Home</button>
            <button onClick={() => setActiveView("portfolio")} className="hover:text-white transition">Portfolio</button>
            <button onClick={() => setActiveView("pricing")} className="hover:text-white transition">Pricing</button>
            <button onClick={() => setActiveView("my-plan")} className="hover:text-[#66FCF1] text-[#66FCF1]/85 font-semibold transition">My Plan</button>
            <button onClick={() => setActiveView("faq")} className="hover:text-white transition">FAQs</button>
            <button onClick={() => setActiveView("contact")} className="hover:text-white transition">Support Contact</button>
            
            {/* Quick Lock Access to Admin console */}
            <button
              onClick={() => {
                setActiveView("admin");
              }}
              className="hover:text-violet-400 transition flex items-center gap-1 text-[11px] text-slate-500 hover:text-violet-400"
            >
              <Lock className="w-3 h-3" />
              Administrative Gate
            </button>
          </div>

          <p>© 2026 Nanu.AI. Crafted for instant SaaS layouts execution. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
