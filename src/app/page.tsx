"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Heart, 
  Send, 
  MessageSquare, 
  Award, 
  Compass, 
  Info,
  Sparkles,
  Volume2,
  VolumeX,
  Check,
  ChevronRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { fetchWishes, addWish, type Wish, type NewWish } from "@/lib/supabase";

// Empty initial wishes - will be loaded from Supabase
const INITIAL_WISHES: Wish[] = [];

export default function GraduationInvite() {
  // Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  // Music Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Guestbook State
  const [wishes, setWishes] = useState(INITIAL_WISHES);
  const [formName, setFormName] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Flip Card State (keeps track of flipped card IDs)
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Interactive Mini-Map State (active step along the path to Building G)
  const [activeMapStep, setActiveMapStep] = useState(0);

  // Target Date: June 16, 2026, 09:30 AM (GMT+7)
  const targetDate = new Date("2026-06-16T09:30:00+07:00").getTime();

  useEffect(() => {
    // Load wishes from Supabase
    const loadWishes = async () => {
      const data = await fetchWishes();
      setWishes(data);
    };
    loadWishes();

    // Initialize Audio
    audioRef.current = new Audio("/audio/videoplayback.m4a");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;
    audioRef.current.play().catch(() => {
      // Autoplay may be blocked by browser; user can still manually start audio.
      setIsPlaying(false);
    });

    // Countdown Interval
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        clearInterval(interval);
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s, isOver: false });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [targetDate]);

  // Toggle Music
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log("Audio play blocked by browser. Needs user interaction."));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Flip card handler
  const handleCardClick = (id: number | undefined) => {
    if (!id) return;
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Submit wish handler
  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMessage.trim()) return;

    setIsSubmitting(true);

    try {
      const newWish: NewWish = {
        name: formName.trim(),
        wishes: formMessage.trim()
      };

      const result = await addWish(newWish);
      
      if (result) {
        const updatedWishes = [result, ...wishes];
        setWishes(updatedWishes);

        // Trigger Confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#800020", "#F7EBE1", "#1E2022", "#D4AF37"]
        });

        // Clear Form
        setFormName("");
        setFormMessage("");
        setIsSuccess(true);

        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error adding wish:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCardColor = (index: number) => {
    const colors = ["bg-[#FDFBF7]", "bg-[#F7EBE1]", "bg-[#EAE1DF]"];
    return colors[index % colors.length];
  };

  const formatDateFromDatabase = (dateString: string | undefined) => {
    if (!dateString) return new Date().toLocaleDateString("vi-VN");
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return new Date().toLocaleDateString("vi-VN");
    }
  };

  // Mini-map step descriptions
  const mapSteps = [
    {
      title: "Cổng bên hông 120 Hoàng Minh Thảo",
      desc: "Từ cổng chính đi thẳng lên ngã ba, rẽ phải và vào cổng bên hông để bắt đầu lộ trình.",
      coords: { x: "10%", y: "85%" }
    },
    {
      title: "Sau lưng Tòa D",
      desc: "Đi thẳng tới phía sau Tòa D — tòa đầu tiên bên phải khi tính từ cổng vào.",
      coords: { x: "35%", y: "60%" }
    },
    {
      title: "Tiến tới Tòa G",
      desc: "Đi thẳng tiếp để đến Tòa G — tòa nhà nhiều kính, điểm đến chính của buổi lễ.",
      coords: { x: "65%", y: "40%" }
    },
    {
      title: "Hội Trường Tòa G",
      desc: "Hội trường lớn dưới sảnh tầng 1- Nơi làm lễ chính thức vinh danh các Tân cử nhân.",
      coords: { x: "90%", y: "15%" }
    }
  ];

  // Calendar Export Logic
  const handleAddToCalendar = () => {
    const title = "Lễ Tốt Nghiệp Trần Duy Khải";
    const details = "Lễ Tốt Nghiệp Đại Học của Trần Duy Khải tại Đại Học Duy Tân. Sự hiện diện của bạn là niềm vinh hạnh lớn đối với mình!";
    const location = "Tòa nhà G, Đại học Duy Tân, 120 Hoàng Minh Thảo, Hòa Khánh Nam, Liên Chiểu, Đà Nẵng";
    const startDate = "20260616T093000";
    const endDate = "20260616T120000";

    // Google Calendar Link
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    window.open(gCalUrl, "_blank");
  };

  return (
    <div className="relative min-h-screen selection:bg-[#800020] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft abstract blobs with deep burgundy/cream gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#800020]/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#800020]/3 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[45%] h-[45%] rounded-full bg-[#800020]/5 blur-[120px]" />
      </div>

      {/* Floating Audio Toggle */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
        <button
          onClick={toggleMusic}
          className="btn-3d-cream p-3 sm:p-4 rounded-full flex items-center justify-center gap-2 group shadow-lg cursor-pointer touch-manipulation hover:shadow-xl transition-shadow"
          title="Bật/Tắt nhạc nền"
          aria-label="Toggle Music"
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-5 h-5 sm:w-5 sm:h-5 text-[#800020] animate-pulse flex-shrink-0" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-16 md:group-hover:max-w-20 transition-all duration-300 ease-out text-xs font-semibold whitespace-nowrap">
                Tắt Nhạc
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-5 h-5 sm:w-5 sm:h-5 text-[#800020] flex-shrink-0" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-16 md:group-hover:max-w-20 transition-all duration-300 ease-out text-xs font-semibold whitespace-nowrap">
                Phát Nhạc
              </span>
            </>
          )}
        </button>
      </div>

      {/* Hero Section */}
      <header className="relative w-full py-8 sm:py-12 md:py-16 lg:py-24 px-3 sm:px-4 flex flex-col items-center justify-center z-10 text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center w-full"
        >
          {/* Custom Real Graduation Photo Frame */}
          <div className="relative w-60 h-72 sm:w-72 sm:h-80 md:w-80 md:h-96 mb-6 sm:mb-8 flex items-center justify-center filter drop-shadow-2xl">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 1.5, -1.5, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative w-full h-full p-4 pb-6 bg-white rounded-3xl border border-zinc-200/50 shadow-[inset_2px_2px_6px_rgba(255,255,255,0.9),_inset_-4px_-4px_10px_rgba(0,0,0,0.04),_0_20px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between"
            >
              {/* Photo Area */}
              <div className="relative w-full h-[85%] rounded-2xl overflow-hidden border border-zinc-100 bg-[#FDFBF7]">
                <Image 
                  src="/hero-avatar.jpg" 
                  alt="Trần Duy Khải Graduation" 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Signature/Label in Frame (like a Polaroid) */}
              <div className="text-center pt-3 text-[#800020] font-serif font-bold tracking-wider text-sm md:text-base">
                🎓 Trần Duy Khải &bull; DTU 2026
              </div>

              {/* Floating overlay 3D cap/ribbon element in the corner */}
              <div className="absolute -top-6 -right-6 w-20 h-20 filter drop-shadow-md z-30">
                <Image
                  src="/hero-cap.png"
                  alt="Mini Cap"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
            
            {/* Sparkles decorations floating around */}
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-2 right-2 text-[#800020]/70"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <motion.div 
              animate={{ scale: [1.3, 1, 1.3], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-6 left-2 text-[#800020]/60"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </div>

          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#800020] bg-[#800020]/10 border border-[#800020]/20 mb-4 inline-flex items-center gap-1.5 shadow-sm">
            <Award className="w-3.5 h-3.5" /> Graduation Day Invitation
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1E2022] leading-tight max-w-4xl px-2 sm:px-3">
            Lễ Tốt Nghiệp của <br className="sm:hidden" />
            <span className="text-[#B72818] text-shadow-3d-burgundy font-serif relative inline-block py-1">
              Trần Duy Khải
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-zinc-600 max-w-xl mx-auto italic font-light px-3 sm:px-4 leading-relaxed">
            &ldquo;Hành trình vạn dặm bắt đầu từ một bước chân. Sự đồng hành và ủng hộ của mọi người chính là động lực lớn nhất để mình hoàn thành chặng đường này.&rdquo;
          </p>
        </motion.div>
      </header>

      {/* Countdown Section */}
      <section className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 z-10 mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="clay-card p-6 sm:p-8 md:p-12 text-center"
        >
          <h2 className="text-[#800020] text-xs sm:text-sm md:text-base font-bold tracking-widest uppercase mb-6 sm:mb-8 flex items-center justify-center gap-2 flex-wrap">
            <Clock className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '8s' }} /> Đếm Ngược Đến Giờ Khắc Trọng Đại
          </h2>

          <AnimatePresence mode="wait">
            {!timeLeft.isOver ? (
              <motion.div 
                key="timer"
                className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Days */}
                <div className="countdown-block py-3 sm:py-6 px-2 sm:px-4 flex flex-col items-center">
                  <span className="font-serif text-2xl sm:text-4xl md:text-5xl font-black text-[#800020] tracking-tight">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-zinc-500 mt-1 sm:mt-2">Ngày</span>
                </div>
                {/* Hours */}
                <div className="countdown-block py-3 sm:py-6 px-2 sm:px-4 flex flex-col items-center">
                  <span className="font-serif text-2xl sm:text-4xl md:text-5xl font-black text-[#800020] tracking-tight">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-zinc-500 mt-1 sm:mt-2">Giờ</span>
                </div>
                {/* Minutes */}
                <div className="countdown-block py-3 sm:py-6 px-2 sm:px-4 flex flex-col items-center">
                  <span className="font-serif text-2xl sm:text-4xl md:text-5xl font-black text-[#800020] tracking-tight">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-zinc-500 mt-1 sm:mt-2">Phút</span>
                </div>
                {/* Seconds */}
                <div className="countdown-block py-3 sm:py-6 px-2 sm:px-4 flex flex-col items-center">
                  <span className="font-serif text-2xl sm:text-4xl md:text-5xl font-black text-[#800020] tracking-tight">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-zinc-500 mt-1 sm:mt-2">Giây</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-5 rounded-3xl bg-[#800020] border-2 border-white/20 text-[#FDFBF7] shadow-xl animate-bounce flex-wrap justify-center"
              >
                <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-pulse absolute animate-spin" />
                </div>
                <span className="font-serif text-sm sm:text-lg md:text-xl lg:text-2xl font-bold tracking-wide">
                  Đang diễn ra
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-4 sm:mt-8 text-[10px] sm:text-xs text-zinc-400 px-2">
            Giờ làm lễ chính thức: 09h30, Thứ Ba ngày 16/06/2026 (Múi giờ Việt Nam GMT+7)
          </p>
        </motion.div>
      </section>

      {/* Event Details & Map Section */}
      <section className="relative w-full max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 z-10 mb-12 sm:mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-stretch">
          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="clay-card-burgundy p-6 sm:p-8 md:p-12 text-[#FDFBF7] flex flex-col justify-between"
          >
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 leading-snug">
                Thông Tin Buổi Lễ
              </h2>
              <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 sm:p-3 bg-white/10 rounded-2xl border border-white/10 shadow-inner flex-shrink-0">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#FDFBF7]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/60 mb-1">Thời gian</h3>
                    <p className="font-serif text-lg sm:text-xl md:text-2xl font-semibold">09:30 AM &bull; Thứ Ba</p>
                    <p className="text-zinc-300 text-xs sm:text-sm mt-1">Ngày 16 tháng 06 năm 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 sm:p-3 bg-white/10 rounded-2xl border border-white/10 shadow-inner flex-shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#FDFBF7]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/60 mb-1">Địa điểm</h3>
                    <p className="font-serif text-base sm:text-lg md:text-xl font-semibold">Hội trường lớn, Tòa nhà G</p>
                    <p className="text-zinc-300 text-xs sm:text-sm mt-1 leading-relaxed">
                      Trường Đại học Duy Tân, 120 Hoàng Minh Thảo, Hòa Khánh Nam, Liên Chiểu, Đà Nẵng.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <button
                onClick={handleAddToCalendar}
                className="btn-3d-cream py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm flex-1 sm:flex-none inline-flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <Calendar className="w-4 h-4 flex-shrink-0" /> Lưu Lịch
              </button>
              <a
                href="https://www.google.com/maps/place/120+Ho%C3%A0ng+Minh+Th%E1%BA%A3o,+H%C3%B2a+Kh%C3%A1nh,+%C4%90%C3%A0+N%E1%BA%B5ng+550000,+Vietnam/@16.0492187,108.1600816,126m/data=!3m1!1e3!4m6!3m5!1s0x31421907b242599b:0x9f40b5689fb887dd!8m2!3d16.0493318!4d108.1604454!16s%2Fg%2F11vzcszr_r!5m1!1e2?hl=en&entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/15 text-[#FDFBF7] font-semibold border border-white/15 transition-all py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm flex-1 sm:flex-none inline-flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <MapPin className="w-4 h-4 flex-shrink-0" /> Chỉ đường
              </a>
            </div>
          </motion.div>

          {/* Interactive Map Area */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            {/* Google Map iframe with claymorphic frame */}
            <div className="relative h-48 sm:h-64 md:h-72 rounded-3xl overflow-hidden shadow-lg border border-zinc-200/50 bg-[#FDFBF7] p-2">
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
                {/* Burgundy styled tint overlay - maps iframe has mix-blend-mode for styling */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.336154562208!2d108.15858971077755!3d16.04809228456079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142023dbbe5c137%3A0xa6ebf54a86f78f!2zMTIwIEhvw6BuZyBNaW5oIFRo4bqjbywgSMOyYSBLaMOhbmggTmFtLCBMacOqbiBDaGnhu4N1LCDEkMOgIE7hurVuZyA1NTAwMDAsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1717830000000!5m2!1sen!2s" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: "sepia(10%) hue-rotate(310deg) saturate(90%) contrast(105%)" }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="DTU Campus Map"
                ></iframe>
                {/* Elegant map label */}
                <div className="absolute bottom-3 right-3 bg-[#800020] text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg shadow-md border border-white/10 pointer-events-none">
                  DTU - 120 Hoàng Minh Thảo
                </div>
              </div>
            </div>

            {/* Simulated 3D Campus Pathway Mini-map */}
            <div className="clay-card p-4 sm:p-6 flex flex-col justify-between flex-1">
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#1E2022] flex items-center gap-2 flex-shrink-0">
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#800020] animate-pulse flex-shrink-0" /> <span className="hidden sm:inline">Sơ đồ 3D dẫn đến &ldquo;Tòa nhà G&rdquo;</span><span className="sm:hidden">Sơ Đồ 3D</span>
                  </h3>
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">Bấm vào các mốc</span>
                </div>
                
                {/* Pathway Visualizer */}
                <div className="relative h-24 sm:h-28 bg-[#800020]/5 rounded-2xl border border-[#800020]/10 flex items-center justify-between px-3 sm:px-6 mb-3 sm:mb-4 overflow-x-auto overflow-y-hidden">
                  {/* Sinuous dotted line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M 50,75 C 100,75 120,35 200,35 C 280,35 300,75 380,75 C 450,75 480,30 550,30" 
                      fill="none" 
                      stroke="#800020" 
                      strokeWidth="3" 
                      strokeDasharray="6 6"
                      className="opacity-40"
                    />
                  </svg>

                  {/* Interactive Nodes along the path */}
                  {mapSteps.map((step, idx) => {
                    const isActive = activeMapStep === idx;
                    const isPassed = activeMapStep > idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveMapStep(idx)}
                        className="relative z-10 flex flex-col items-center focus:outline-none group cursor-pointer flex-shrink-0 px-1 sm:px-2"
                      >
                        {/* Node circle */}
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? "bg-[#800020] text-[#FDFBF7] scale-110 sm:scale-125 ring-4 ring-[#800020]/20 shadow-md" 
                            : isPassed 
                              ? "bg-[#800020]/80 text-[#FDFBF7]" 
                              : "bg-white text-zinc-400 border border-zinc-200"
                        }`}>
                          {isActive ? (
                            <span className="text-[8px] sm:text-[10px] font-black">🎓</span>
                          ) : (
                            <span className="text-[10px] sm:text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>
                        {/* Tiny badge dot */}
                        <span className={`text-[8px] sm:text-[10px] mt-1 font-bold transition-colors ${
                          isActive ? "text-[#800020]" : "text-zinc-400 group-hover:text-zinc-600"
                        }`}>
                          M{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Step Details */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMapStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/50 p-3 sm:p-4 rounded-xl border border-[#800020]/10 flex items-start gap-2 sm:gap-3"
                >
                  <div className="p-1.5 sm:p-2 bg-[#800020]/10 rounded-lg text-[#800020] mt-0.5 flex-shrink-0">
                    <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-[#1E2022]">
                      {mapSteps[activeMapStep].title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1 leading-relaxed">
                      {mapSteps[activeMapStep].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Journey Timeline Gallery */}
      <section className="relative w-full py-12 sm:py-16 px-3 sm:px-4 z-10 bg-[#800020]/3">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-[#800020] text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-[#800020]/10 px-3 sm:px-3.5 py-1.5 rounded-full inline-block">
              Ký ức & Cột mốc
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-black text-[#1E2022] mt-3 sm:mt-4">
              Hành Trình Ý Nghĩa
            </h2>
            <div className="w-8 sm:w-12 h-1 bg-[#800020] mx-auto mt-3 sm:mt-4 rounded-full" />
          </div>

          {/* Vertical/Zigzag Roadmap */}
          <div className="relative">
            {/* Center Line for desktop */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[4px] bg-[#800020]/10 -translate-x-1/2 rounded-full hidden md:block" />
            {/* Side Line for mobile */}
            <div className="absolute left-4 top-0 bottom-0 w-[4px] bg-[#800020]/10 -translate-x-1/2 rounded-full md:hidden" />

            <div className="space-y-16">
              {/* Milestone 1: Freshman Year */}
              <div className="flex flex-col md:flex-row items-stretch md:justify-between relative">
                {/* Timeline node */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-[#800020] border-4 border-[#FDFBF7] -translate-x-1/2 flex items-center justify-center shadow-md z-20">
                  <span className="text-[10px] font-bold text-white">1</span>
                </div>

                {/* Left content block (Freshman) */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="pl-12 md:pl-0 md:w-[45%] flex flex-col"
                >
                  <div className="clay-card p-4 sm:p-6 bg-white flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[#800020] text-[10px] sm:text-xs font-bold uppercase tracking-wider">2022 - Khởi Đầu</span>
                      <h3 className="font-serif text-base sm:text-xl font-bold text-[#1E2022] mt-1 mb-2 sm:mb-3">Freshman Year & HelloWorld</h3>
                      <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                        Bước chân vào giảng đường đại học với những định hướng ban đầu về công nghệ và con đường tương lai, bắt đầu với những dòng code đầu tiên và niềm đam mê cháy bỏng với lĩnh vực Trí tuệ Nhân tạo.
                      </p>
                    </div>
                    {/* Glassmorphic Image Container */}
                    <div className="relative h-40 sm:h-48 w-full rounded-2xl overflow-hidden glass-card p-1">
                      <div className="relative w-full h-full rounded-xl overflow-hidden">
                        <Image
                          src="/freshman.png"
                          alt="Freshman Year Milestone"
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right empty spacer for desktop */}
                <div className="hidden md:block md:w-[45%]" />
              </div>

              {/* Milestone 2: AI Playgrounds (2023) */}
              <div className="flex flex-col md:flex-row-reverse items-stretch md:justify-between relative">
                {/* Timeline node */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-[#800020] border-4 border-[#FDFBF7] -translate-x-1/2 flex items-center justify-center shadow-md z-20">
                  <span className="text-[10px] font-bold text-white">2</span>
                </div>

                {/* Right content block */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="pl-12 md:pl-0 md:w-[45%] flex flex-col"
                >
                  <div className="clay-card p-4 sm:p-6 bg-white flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[#800020] text-[10px] sm:text-xs font-bold uppercase tracking-wider">2023 - Khám Phá</span>
                      <h3 className="font-serif text-base sm:text-xl font-bold text-[#1E2022] mt-1 mb-2 sm:mb-3">Sân Chơi AI Mới</h3>
                      <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                        Năm đầu tiên dấn thân và thử thách bản thân tại các sân chơi Trí tuệ Nhân tạo mới mẻ. Khám phá sức mạnh của các mô hình học máy và mở rộng chân trời công nghệ đầy cảm hứng.
                      </p>
                    </div>
                    {/* Glassmorphic Image Container */}
                    <div className="relative h-40 sm:h-48 w-full rounded-2xl overflow-hidden glass-card p-1">
                      <div className="relative w-full h-full rounded-xl overflow-hidden">
                        <Image
                          src="/ai-playground.png"
                          alt="AI Playgrounds Milestone"
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Left empty spacer for desktop */}
                <div className="hidden md:block md:w-[45%]" />
              </div>

              {/* Milestone 3: AI & ROBOT (2024) */}
              <div className="flex flex-col md:flex-row items-stretch md:justify-between relative">
                {/* Timeline node */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-[#800020] border-4 border-[#FDFBF7] -translate-x-1/2 flex items-center justify-center shadow-md z-20">
                  <span className="text-[10px] font-bold text-white">3</span>
                </div>

                {/* Left content block */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="pl-12 md:pl-0 md:w-[45%] flex flex-col"
                >
                  <div className="clay-card p-4 sm:p-6 bg-white flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[#800020] text-[10px] sm:text-xs font-bold uppercase tracking-wider">2024 - Nghiên Cứu</span>
                      <h3 className="font-serif text-base sm:text-xl font-bold text-[#1E2022] mt-1 mb-2 sm:mb-3">AI và ROBOT</h3>
                      <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                        Hành trình đi sâu tiếp cận thế giới AI kết hợp cùng ROBOT. Nghiên cứu phát triển các hệ thống nhúng thông minh, robot tự hành và ứng dụng AI vào thực tiễn kỹ thuật.
                      </p>
                    </div>
                    {/* Glassmorphic Image Container */}
                    <div className="relative h-40 sm:h-48 w-full rounded-2xl overflow-hidden glass-card p-1">
                      <div className="relative w-full h-full rounded-xl overflow-hidden">
                        <Image
                          src="/ai-robot.png"
                          alt="AI and Robot Milestone"
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right empty spacer for desktop */}
                <div className="hidden md:block md:w-[45%]" />
              </div>

              {/* Milestone 4: Graduation (2026) */}
              <div className="flex flex-col md:flex-row-reverse items-stretch md:justify-between relative">
                {/* Timeline node */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-[#800020] border-4 border-[#FDFBF7] -translate-x-1/2 flex items-center justify-center shadow-md z-20">
                  <span className="text-[10px] font-bold text-white">4</span>
                </div>

                {/* Right content block */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="pl-12 md:pl-0 md:w-[45%] flex flex-col"
                >
                  <div className="clay-card p-4 sm:p-6 bg-white flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[#800020] text-[10px] sm:text-xs font-bold uppercase tracking-wider">2026 - Tốt Nghiệp</span>
                      <h3 className="font-serif text-base sm:text-xl font-bold text-[#1E2022] mt-1 mb-2 sm:mb-3">Lễ Tốt Nghiệp Vẻ Vang</h3>
                      <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                        Trái ngọt cuối cùng sau những nỗ lực học tập và rèn luyện không ngừng nghỉ. Tấm bằng cử nhân chính thức cầm trên tay, khép lại chặng đường sinh viên tươi đẹp để sẵn sàng bước ra thế giới rộng lớn.
                      </p>
                    </div>
                    {/* Glassmorphic Image Container */}
                    <div className="relative h-40 sm:h-48 w-full rounded-2xl overflow-hidden glass-card p-1">
                      <div className="relative w-full h-full rounded-xl overflow-hidden">
                        <Image
                          src="/graduation.png"
                          alt="Graduation Milestone"
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Left empty spacer for desktop */}
                <div className="hidden md:block md:w-[45%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guestbook & Thank You Section */}
      <section className="relative w-full max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
          {/* Guestbook Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 clay-card p-6 sm:p-8 md:p-10 bg-white"
          >
            <span className="text-[#800020] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 block">Sổ lưu niệm</span>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1E2022] mb-4 sm:mb-6">
              Gửi Lời Chúc Mừng
            </h2>

            <form onSubmit={handleWishSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="guestName" className="block text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Tên của bạn
                </label>
                <input
                  id="guestName"
                  type="text"
                  required
                  placeholder="Ví dụ: Anh Nam, Bạn Minh Thư..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] bg-[#FDFBF7] text-[#1E2022] text-sm transition-all shadow-inner"
                />
              </div>

              <div>
                <label htmlFor="guestWish" className="block text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Lời chúc của bạn
                </label>
                <textarea
                  id="guestWish"
                  required
                  rows={4}
                  placeholder="Viết những suy nghĩ, cảm xúc hoặc lời chúc của bạn..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] bg-[#FDFBF7] text-[#1E2022] text-sm transition-all shadow-inner resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-3d-burgundy w-full py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer touch-manipulation"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isSuccess ? (
                  <>
                    <Check className="w-5 h-5 text-green-300" /> Đã gửi thành công!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Gửi Lời Chúc
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Wishes Display Stack / Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 flex flex-col h-full justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4 sm:mb-6 px-1 flex-wrap">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#800020] flex-shrink-0" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1E2022]">Lời Chúc Từ Mọi Người</h3>
                <span className="text-[10px] sm:text-xs bg-[#800020]/10 text-[#800020] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-bold">
                  {wishes.length}
                </span>
              </div>

              {/* 3D Floating / Flipped Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative">
                <AnimatePresence initial={false}>
                  {wishes.map((item) => {
                    const isFlipped = item.id ? !!flippedCards[item.id] : false;
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="perspective-1000 h-48 sm:h-52 w-full cursor-pointer group"
                        onClick={() => handleCardClick(item.id)}
                      >
                        {/* Inner flipper */}
                        <div className={`w-full h-full relative preserve-3d duration-500 transition-transform ${
                          isFlipped ? "rotate-y-180" : ""
                        }`}>
                          {/* Card Front */}
                          <div className={`absolute inset-0 backface-hidden rounded-2xl p-3 sm:p-5 flex flex-col justify-between border border-zinc-200/50 shadow-md ${getCardColor(wishes.indexOf(item))} hover:shadow-lg transition-shadow duration-300`}>
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-serif text-sm sm:text-base font-bold text-[#1E2022] truncate">
                                  {item.name}
                                </span>
                                <span className="text-[8px] sm:text-[10px] text-zinc-400 bg-white/60 px-1.5 sm:px-2 py-0.5 rounded border border-zinc-100 flex-shrink-0 whitespace-nowrap">
                                  {formatDateFromDatabase(item.created_at)}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-zinc-500 line-clamp-3 sm:line-clamp-4 mt-2 sm:mt-3 leading-relaxed">
                                {item.wishes}
                              </p>
                            </div>
                            <div className="flex justify-between items-center text-[8px] sm:text-[10px] text-[#800020] font-bold mt-2 pt-2 border-t border-zinc-100 gap-1">
                              <span className="truncate">Lật để xem</span>
                              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                            </div>
                          </div>

                          {/* Card Back (Flipped) */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#800020] text-[#FDFBF7] rounded-2xl p-3 sm:p-6 flex flex-col justify-between border border-white/10 shadow-lg">
                            <div className="overflow-y-auto max-h-32 sm:max-h-36 pr-1 custom-scrollbar">
                              <p className="font-serif text-xs sm:text-sm italic font-light leading-relaxed">
                                &ldquo;{item.wishes}&rdquo;
                              </p>
                            </div>
                            <div className="text-right border-t border-white/10 pt-2 sm:pt-2.5 mt-2 flex justify-between items-center gap-1">
                              <span className="text-[8px] sm:text-[10px] text-white/50">Lật lại</span>
                              <span className="font-serif text-[10px] sm:text-xs font-bold text-white tracking-wide truncate">
                                — {item.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Thank You Note & Digital Signature */}
            <div className="mt-10 sm:mt-14 p-4 sm:p-6 md:p-8 rounded-3xl bg-[#800020]/5 border border-[#800020]/15 relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
              {/* Floating interactive 3D heart decoration */}
              <motion.div 
                whileHover={{ scale: 1.25, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer text-[#800020] border border-[#800020]/10 flex-shrink-0 touch-manipulation"
                title="Bấm để thả tim"
                onClick={() => {
                  confetti({
                    particleCount: 40,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ["#800020", "#FDFBF7"]
                  });
                  confetti({
                    particleCount: 40,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ["#800020", "#FDFBF7"]
                  });
                }}
              >
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-[#800020] text-[#800020] animate-pulse" />
              </motion.div>

              <div>
                <p className="text-zinc-600 text-xs sm:text-sm italic leading-relaxed text-center sm:text-left">
                  &ldquo;Sự hiện diện của mọi người là niềm vinh hạnh lớn. Xin chân thành cảm ơn!&rdquo;
                </p>
                {/* Simulated Digital Signature */}
                <div className="mt-3 sm:mt-4 flex justify-center sm:justify-end">
                  <div className="text-right">
                    <span className="font-serif text-base sm:text-lg font-bold text-[#B72818] tracking-wide block">
                      Trần Duy Khải
                    </span>
                    <span className="text-[8px] sm:text-[10px] text-zinc-400 uppercase tracking-widest">
                      Tốt Nghiệp 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 sm:py-8 px-3 sm:px-4 text-center text-zinc-400 text-[10px] sm:text-xs border-t border-zinc-200/50 mt-12 sm:mt-16 bg-white/30 backdrop-blur z-10 relative">
        <p className="font-medium text-zinc-500 text-[10px] sm:text-xs">
          &copy; 2026 Trần Duy Khải. Made with ❤️ for Graduation Celebration.
        </p>
        <p className="text-[9px] sm:text-[10px] text-zinc-400 mt-1">
          Đại học Duy Tân - DTU
        </p>
      </footer>
    </div>
  );
}
