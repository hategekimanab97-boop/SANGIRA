import React, { useState, useMemo, useEffect } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import { Business } from '../../../types';
import {
  Search,
  MapPin,
  Star,
  UtensilsCrossed,
  BedDouble,
  Building2,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  Phone,
  Mail,
  X,
  Smartphone,
  CreditCard,
  ChefHat,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface FacilitySlide {
  id: string;
  facility: string;
  headline: string;
  subtext: string;
  badge: string;
  location: string;
  imageUrl: string;
}

const FACILITY_SLIDES: FacilitySlide[] = [
  {
    id: 'pool',
    facility: 'Skyline Heated Infinity Pool & Sundeck',
    headline: 'Olympic Heated Infinity Pool',
    subtext: 'Basking sundeck & private loungers overlooking panoramic Kigali hills and Lake Kivu sunsets',
    badge: '5-Star Leisure',
    location: 'Kigali Serena & Lake Kivu Retreats',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1280&q=75',
  },
  {
    id: 'suite',
    facility: 'Presidential Panoramic Suite & Terrace',
    headline: 'Master Executive Suite',
    subtext: 'King plush bedding, marble soaking tub, and wrap-around terrace view of the 1,000 hills',
    badge: 'Luxury Stays',
    location: 'Kigali Marriott & Bisate Grand Villas',
    imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1280&q=75',
  },
  {
    id: 'dining',
    facility: 'Gourmet African Grill & Sommelier Cellar',
    headline: 'Fine Dining & Sommelier Cellar',
    subtext: 'Oak-smoked Nyama Choma, fresh Lake Kivu Sambaza, and curated vintage wine pairings',
    badge: 'Michelin Dining',
    location: 'The Retreat & Fusion Bistro',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1280&q=75',
  },
  {
    id: 'lodge',
    facility: 'Virunga Mountain Eco-Lodge & Fireplace',
    headline: 'Volcanoes Forest Hearth Lounge',
    subtext: 'Handcrafted volcanic stone fireplace with mist-covered rainforest canopy vistas',
    badge: 'Eco Sanctuary',
    location: 'Musanze Volcanoes Eco-Resort',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1280&q=75',
  },
  {
    id: 'rooftop',
    facility: '360° Sunset Skyline Rooftop & Mixology',
    headline: 'Sunset Craft Cocktail Skybar',
    subtext: 'Live saxophone jazz evenings, signature botanical cocktails, and sparkling city lights',
    badge: 'Rooftop Social',
    location: 'Inzora Rooftop & Kigali Heights',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1280&q=75',
  },
  {
    id: 'spa',
    facility: 'Botanical Wellness & Hydrotherapy Spa',
    headline: 'Thermal Baths & Rwandan Herbal Rituals',
    subtext: 'Deep-tissue aromatherapy, cedar sauna, and tranquil lakeside meditation pavilion',
    badge: 'Wellness Retreat',
    location: 'One&Only Nyungwe & Lake Sanctuary',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1280&q=75',
  },
];

export const LandingView: React.FC = () => {
  const { allBusinesses, setActiveBusiness, setRole, setActiveTab, menuItems, setIsAuthModalOpen } = useSangira();
  const { t, translateDescription } = useLanguage();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'menu' | 'rooms'>('overview');

  // Cinematic Cross-Fade + Ken Burns (Rotation: 6.5s, Fade: 1.2s, Zoom: 105% to 100%)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % FACILITY_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  // Filtered Businesses
  const filteredBusinesses = useMemo(() => {
    return allBusinesses.filter((b) => {
      // Status check
      if (b.status !== 'active') return false;

      // City check
      if (selectedCity !== 'all' && b.city !== selectedCity) return false;

      // Category check
      if (selectedCategory === 'hotel' && !b.hasHotelModule) return false;
      if (selectedCategory === 'restaurant' && b.type !== 'restaurant') return false;
      if (selectedCategory === 'bar' && b.type !== 'bar' && b.type !== 'lounge') return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(query);
        const matchesLoc = b.location.toLowerCase().includes(query);
        const matchesDesc = b.description?.toLowerCase().includes(query) ?? false;
        const matchesCity = b.city?.toLowerCase().includes(query) ?? false;
        const matchesDish = b.featuredDishes?.some((d) => d.toLowerCase().includes(query)) ?? false;
        const matchesAmenity = b.amenities?.some((a) => a.toLowerCase().includes(query)) ?? false;
        return matchesName || matchesLoc || matchesDesc || matchesCity || matchesDish || matchesAmenity;
      }

      return true;
    });
  }, [allBusinesses, searchQuery, selectedCity, selectedCategory]);

  // Handler: Customer 1-Click Launch into Live Menu
  const handleStartDining = (business: Business) => {
    setActiveBusiness(business);
    setRole('CUSTOMER');
    setActiveTab('menu');
  };

  // Handler: Launch into Venue Details
  const handleOpenDetails = (business: Business) => {
    setSelectedBusiness(business);
    setActiveModalTab('overview');
  };

  return (
    <div className="min-h-screen bg-[#FAF6EB] dark:bg-[#0A0E0C] text-stone-900 dark:text-stone-100 selection:bg-[#D4AF37] selection:text-stone-950">
      {/* 1. Public Top Navigation Bar with Gold Accent & Multilingual Translation Selector */}
      <nav className="sticky top-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#0E1310]/95 backdrop-blur-md border-b border-[#D4AF37]/35 dark:border-[#D4AF37]/25 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0E382B] text-[#D4AF37] border border-[#D4AF37]/50 flex items-center justify-center font-extrabold text-base tracking-wider shadow-sm">
              S
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-emerald-950 dark:text-stone-50 flex items-center">
                SANGIRA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="hidden sm:inline-flex text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-[#0E382B] dark:hover:text-[#D4AF37] whitespace-nowrap shrink-0 cursor-pointer"
            >
              List Your Venue
            </button>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#0E382B] hover:bg-[#144737] text-[#F3DF95] border border-[#D4AF37]/60 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              Staff Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Magnetic Customer Hero Section with Crystal Clear Automatic Hotel Facility Background Image Slider */}
      <header className="relative pt-6 pb-12 md:pt-10 md:pb-16 overflow-hidden border-b border-[#D4AF37]/30 dark:border-[#D4AF37]/20">
        {/* Background Facility Image Slider: Cinematic Cross-Fade (1.2s) + Ken Burns Zoom (105% to 100%) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {FACILITY_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <div
                key={slide.id}
                style={{
                  transition: isActive
                    ? 'opacity 1200ms ease-in-out, transform 6500ms cubic-bezier(0.16, 1, 0.3, 1)'
                    : 'opacity 1200ms ease-in-out, transform 0ms',
                }}
                className={`absolute inset-0 w-full h-full transform-gpu ${
                  isActive ? 'opacity-100 scale-100 z-0' : 'opacity-0 scale-[1.05] -z-10'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.facility}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>
            );
          })}
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-normal sm:tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] leading-snug text-balance">
              <span className="text-[#F3DF95] font-extrabold tracking-wider">SANGIRA</span>
              <span className="text-[#D4AF37] mx-1.5 sm:mx-2">·</span>
              <span className="font-medium text-stone-100">{t('hero.title').replace(/^SANGIRA\s*[–—\-]\s*/, '')}</span>
            </h1>

            {/* Live Search & Filter Bar (Compact, Smaller, and Frosted Transparent Glass) */}
            <div className="pt-1 max-w-lg mx-auto">
              <div className="bg-black/35 hover:bg-black/45 dark:bg-black/55 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-[#D4AF37]/50 shadow-2xl flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 transition-all">
                {/* Search query input */}
                <div className="relative flex-1 w-full flex items-center">
                  <Search className="w-3.5 h-3.5 text-[#F3DF95] absolute left-2.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hero.searchPlaceholder')}
                    className="w-full pl-8 pr-2 py-1 text-[11px] sm:text-xs bg-transparent rounded-lg border-0 focus:outline-hidden text-white placeholder:text-stone-300/80"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-0.5 text-stone-300 hover:text-white mr-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* City Selector */}
                <div className="flex items-center gap-1 border-t sm:border-t-0 sm:border-l border-white/20 pt-1 sm:pt-0 sm:pl-2 w-full sm:w-auto shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-transparent text-[11px] sm:text-xs font-medium text-stone-100 py-1 pr-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <option value="all" className="bg-stone-900 text-stone-100">{t('hero.allDestinations')}</option>
                    <option value="Kigali" className="bg-stone-900 text-stone-100">{t('hero.cityKigali')}</option>
                    <option value="Rubavu" className="bg-stone-900 text-stone-100">{t('hero.cityRubavu')}</option>
                    <option value="Musanze" className="bg-stone-900 text-stone-100">{t('hero.cityMusanze')}</option>
                  </select>
                </div>

                {/* Search action button in Gold & Forest (refined & compact) */}
                <a
                  href="#discover-venues"
                  className="px-3 py-1 sm:py-1.5 rounded-lg bg-[#0E382B]/85 hover:bg-[#0E382B] text-[#FAF6EB] border border-[#D4AF37]/60 font-semibold text-[11px] transition-all flex items-center justify-center gap-1 shrink-0 shadow-xs cursor-pointer w-full sm:w-auto"
                >
                  <Search className="w-3 h-3 text-[#D4AF37]" />
                  <span className="text-[#F3DF95]">{t('hero.discover')}</span>
                </a>
              </div>

              {/* Explore Hotels & Stays Button */}
              <div className="mt-3.5 flex items-center justify-center">
                <a
                  href="#discover-venues"
                  onClick={() => setSelectedCategory('all')}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] border border-[#D4AF37]/80 text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer group backdrop-blur-xs"
                >
                  <BedDouble className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[#F3DF95] tracking-wide">{t('hero.exploreHotelsButton')}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Featured Hotels & Restaurants Showcase */}
      <section id="discover-venues" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#D4AF37]/30 dark:border-[#D4AF37]/20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 dark:text-stone-50">
              {t('venues.heading')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
              {t('venues.subheading')}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400">
            <span>{t('venues.showing')} {filteredBusinesses.length} {t('venues.verifiedVenues')}</span>
            {selectedCity !== 'all' && <span>{t('venues.in')} {selectedCity}</span>}
          </div>
        </div>

        {/* Empty state */}
        {filteredBusinesses.length === 0 && (
          <div className="py-16 text-center max-w-md mx-auto space-y-4">
            <Building2 className="w-12 h-12 text-[#B89320] mx-auto" />
            <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">No properties match your search</h3>
            <p className="text-xs text-stone-500">Try clearing your filters or searching for another keyword or city.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-lg bg-[#0E382B] text-[#FAF6EB] text-xs font-semibold border border-[#D4AF37]/60"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBusinesses.map((biz) => {
            return (
              <article
                key={biz.id}
                className="group bg-[#FFFDF9] dark:bg-[#111714] rounded-2xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#D4AF37] transition-all flex flex-col"
              >
                {/* Property Hero Image with Overlay */}
                <div className="relative aspect-16/10 overflow-hidden bg-stone-200 dark:bg-stone-800">
                  <img
                    src={biz.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
                    alt={biz.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="bg-black/60 backdrop-blur-md text-[#FAF6EB] font-medium px-2.5 py-1 rounded-md text-[11px] border border-white/10">
                      {biz.type === 'hotel' ? '5-Star Hotel' : biz.type === 'restaurant' ? 'Fine Dining Bistro' : 'Rooftop Lounge'}
                    </span>
                    {biz.priceRange && (
                      <span className="bg-black/60 backdrop-blur-md text-[#D4AF37] font-mono font-semibold px-2 py-0.5 rounded text-[11px] border border-[#D4AF37]/30">
                        {biz.priceRange}
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Stats (Rating & City) */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span className="font-medium text-stone-200">{biz.city || 'Kigali'}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded font-mono text-[11px] border border-[#D4AF37]/40">
                      <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                      <span className="font-bold text-[#F3DF95]">{biz.rating || 4.9}</span>
                      <span className="text-stone-300">({biz.reviewCount || 120})</span>
                    </div>
                  </div>
                </div>

                {/* Property Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-emerald-950 dark:text-stone-100 group-hover:text-[#8B6E15] dark:group-hover:text-[#E6C665] transition-colors leading-snug">
                      {biz.name}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {translateDescription(biz.description || '')}
                    </p>

                    {/* Unboxed Metadata (Zero-Pill Discipline) */}
                    {biz.amenities && biz.amenities.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-600 dark:text-stone-400">
                        {biz.amenities.slice(0, 3).map((amenity, idx) => (
                          <React.Fragment key={amenity}>
                            <span>{translateDescription(amenity)}</span>
                            {idx < 2 && <span aria-hidden="true">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {/* Signature Dish / Cocktail Teaser */}
                    {biz.featuredDishes && biz.featuredDishes.length > 0 && (
                      <div className="pt-2 text-xs border-t border-[#D4AF37]/20 dark:border-[#D4AF37]/15 text-stone-700 dark:text-stone-300 flex items-baseline gap-1.5">
                        <UtensilsCrossed className="w-3 h-3 text-[#B89320] dark:text-[#D4AF37] shrink-0 self-center" />
                        <span className="text-stone-500 font-normal">{t('venues.specialty')}</span>
                        <span className="font-medium truncate">{translateDescription(biz.featuredDishes[0])}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing & 1-Click Action Buttons */}
                  <div className="pt-4 border-t border-[#D4AF37]/20 dark:border-[#D4AF37]/15 flex items-center justify-between gap-2">
                    <div>
                      {biz.roomStartingPrice ? (
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">{t('venues.nightlyStay')}</div>
                          <div className="font-mono font-bold text-sm text-[#8B6E15] dark:text-[#E6C665] tabular-nums">
                            {biz.roomStartingPrice.toLocaleString()} {t('common.rwf')}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">{t('venues.diningFloor')}</div>
                          <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                            {biz.tableCount} {t('venues.tablesReady')}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenDetails(biz)}
                        className="px-2.5 py-1.5 rounded-md border border-[#D4AF37]/40 dark:border-[#D4AF37]/30 hover:bg-[#FAF6EB] dark:hover:bg-stone-800 text-[11px] font-medium text-stone-800 dark:text-stone-200 transition-colors cursor-pointer"
                      >
                        {t('venues.details')}
                      </button>

                      <button
                        onClick={() => handleStartDining(biz)}
                        className="px-3 py-1.5 rounded-md bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] border border-[#D4AF37]/60 text-[11px] font-medium transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        title="Open interactive guest ordering menu for this venue"
                      >
                        <span className="text-[#F3DF95]">{t('venues.liveMenu')}</span>
                        <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. Why Guests Love Sangira-Powered Venues */}
      <section id="customer-experience" className="py-16 md:py-24 border-y border-[#D4AF37]/30 dark:border-[#D4AF37]/20 bg-[#FFFDF9] dark:bg-[#0E1310]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-stone-50">
              {t('exp.title')}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {t('exp.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-[#D4AF37]/30 dark:border-[#D4AF37]/20 bg-[#FAF6EB]/60 dark:bg-stone-900/30 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 text-[#8B6E15] dark:text-[#E6C665] border border-[#D4AF37]/40 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5 text-[#B89320]" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{t('exp.qrMenu')}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {t('exp.qrDesc')}
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#D4AF37]/30 dark:border-[#D4AF37]/20 bg-[#FAF6EB]/60 dark:bg-stone-900/30 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 text-[#8B6E15] dark:text-[#E6C665] border border-[#D4AF37]/40 flex items-center justify-center font-bold">
                <ChefHat className="w-5 h-5 text-[#B89320]" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{t('exp.splitTickets')}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {t('exp.splitDesc')}
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#D4AF37]/30 dark:border-[#D4AF37]/20 bg-[#FAF6EB]/60 dark:bg-stone-900/30 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 text-[#8B6E15] dark:text-[#E6C665] border border-[#D4AF37]/40 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5 text-[#B89320]" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{t('exp.momoPayment')}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {t('exp.momoDesc')}
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#D4AF37]/30 dark:border-[#D4AF37]/20 bg-[#FAF6EB]/60 dark:bg-stone-900/30 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 text-[#8B6E15] dark:text-[#E6C665] border border-[#D4AF37]/40 flex items-center justify-center font-bold">
                <BedDouble className="w-5 h-5 text-[#B89320]" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{t('exp.roomService')}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {t('exp.roomDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Prominent Hotel & Restaurant Onboarding / Partner Section */}
      <section id="property-partners" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0B2E23] via-[#0E382B] to-[#081F18] text-white rounded-3xl p-6 sm:p-12 lg:p-16 relative overflow-hidden border border-[#D4AF37]/40 shadow-xl">
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              <Building2 className="w-4 h-4" />
              <span>For Hospitality Owners & General Managers</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-balance">
              List Your Hotel or Restaurant on Sangira
            </h2>

            <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
              Join Rwanda's verified hospitality network. Streamline your kitchen, bar, front desk, and central inventory into one synchronized operating system in under 24 hours.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-200 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Multi-tenant isolated workspace</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Automated Kitchen & Bar split KDS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Warehouse stock requisition approval</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Instant MoMo cashier daily balancing</span>
              </div>
            </div>

            {/* Dual CTAs for Owners */}
            <div className="pt-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => setActiveTab('register')}
                className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#C59F2A] text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Register Your Business (5 Steps)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('status')}
                className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-xl border border-[#D4AF37]/60 hover:bg-[#D4AF37]/15 text-[#F3DF95] font-semibold text-xs sm:text-sm transition-all flex items-center cursor-pointer"
              >
                Track Registration Status
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Venue Preview Modal with Gold Hairline Trims */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] dark:bg-[#121915] rounded-3xl border border-[#D4AF37]/40 max-w-3xl w-full max-h-[92dvh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Image Header */}
            <div className="relative aspect-16/9 sm:aspect-16/7 bg-stone-900 shrink-0">
              <img
                src={selectedBusiness.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
                alt={selectedBusiness.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedBusiness(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
                    {selectedBusiness.type.toUpperCase()} · {selectedBusiness.city || 'KIGALI'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold">{selectedBusiness.name}</h3>
                </div>
                <div className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-[#D4AF37]/40">
                  <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="text-[#F3DF95]">{selectedBusiness.rating || 4.9}</span>
                </div>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/30 dark:border-stone-800 px-4 sm:px-6 pt-3 text-xs font-semibold overflow-x-auto scrollbar-none shrink-0">
              <button
                onClick={() => setActiveModalTab('overview')}
                className={`pb-2.5 px-2 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeModalTab === 'overview'
                    ? 'border-[#D4AF37] text-[#8B6E15] dark:text-[#E6C665]'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {t('modal.overview')}
              </button>
              <button
                onClick={() => setActiveModalTab('menu')}
                className={`pb-2.5 px-2 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeModalTab === 'menu'
                    ? 'border-[#D4AF37] text-[#8B6E15] dark:text-[#E6C665]'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {t('modal.menu')} ({menuItems.length})
              </button>
              {selectedBusiness.hasHotelModule && (
                <button
                  onClick={() => setActiveModalTab('rooms')}
                  className={`pb-2.5 px-2 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeModalTab === 'rooms'
                      ? 'border-[#D4AF37] text-[#8B6E15] dark:text-[#E6C665]'
                      : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  {t('modal.rooms')}
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {activeModalTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2">{t('modal.about')}</h4>
                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-xs">
                      {translateDescription(selectedBusiness.description)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-3">{t('modal.amenities')}</h4>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {selectedBusiness.amenities?.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                          <CheckCircle className="w-3.5 h-3.5 text-[#B89320] shrink-0" />
                          <span>{translateDescription(amenity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF6EB] dark:bg-stone-900/60 border border-[#D4AF37]/30 space-y-2">
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{selectedBusiness.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{selectedBusiness.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{selectedBusiness.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === 'menu' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{t('modal.chefSpecials')}</h4>
                    <span className="text-[11px] text-stone-500">{t('modal.contactlessNote')}</span>
                  </div>

                  <div className="divide-y divide-[#D4AF37]/20">
                    {menuItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 dark:text-stone-100">{translateDescription(item.name)}</span>
                            <span className="text-[10px] text-stone-400 font-mono">({item.department})</span>
                          </div>
                          <p className="text-stone-500 dark:text-stone-400 text-[11px] line-clamp-1">{translateDescription(item.description)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-[#8B6E15] dark:text-[#E6C665] tabular-nums">
                            {item.price.toLocaleString()} {t('common.rwf')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModalTab === 'rooms' && selectedBusiness.hasHotelModule && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{t('modal.featuredSuites')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-[#D4AF37]/35 dark:border-stone-800 bg-[#FAF6EB]/40 space-y-2">
                      <div className="font-bold text-sm">{translateDescription('Executive Lake View Suite')}</div>
                      <div className="text-stone-500 text-[11px]">{translateDescription('King bed, panoramic balcony, rain shower, and espresso bar.')}</div>
                      <div className="font-mono font-bold text-[#8B6E15] dark:text-[#E6C665] text-sm">145,000 {t('common.rwf')} {t('modal.night')}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-[#D4AF37]/35 dark:border-stone-800 bg-[#FAF6EB]/40 space-y-2">
                      <div className="font-bold text-sm">{translateDescription('Deluxe Garden Room')}</div>
                      <div className="text-stone-500 text-[11px]">{translateDescription('Queen bed, organic garden view, workspace, high-speed WiFi.')}</div>
                      <div className="font-mono font-bold text-[#8B6E15] dark:text-[#E6C665] text-sm">95,000 {t('common.rwf')} {t('modal.night')}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Primary 1-Click Action */}
            <div className="p-4 sm:p-6 bg-[#FAF6EB] dark:bg-stone-900/60 border-t border-[#D4AF37]/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[11px] text-stone-500 block">{t('modal.ready')}</span>
                <span className="font-bold text-xs text-stone-900 dark:text-stone-100">{selectedBusiness.name}</span>
              </div>

              <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className="min-h-[40px] px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-white cursor-pointer"
                >
                  {t('common.close')}
                </button>
                <button
                  onClick={() => {
                    handleStartDining(selectedBusiness);
                    setSelectedBusiness(null);
                  }}
                  className="min-h-[40px] px-5 py-2 rounded-lg bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] border border-[#D4AF37]/60 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[#F3DF95]">{t('modal.openQR')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Footer */}
      <footer className="py-12 bg-[#F5EEDC]/60 dark:bg-[#070A08] text-stone-600 dark:text-stone-400 text-xs border-t border-[#D4AF37]/30 dark:border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#0E382B] text-[#D4AF37] font-bold flex items-center justify-center text-xs">S</div>
                <span className="font-extrabold text-base tracking-tight text-emerald-950 dark:text-stone-100">SANGIRA</span>
                <span className="text-xs">· Rwandan Hospitality Network</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-sm">
                Empowering Rwanda's premier hotels, restaurants, and lounges with unified split ticketing, digital payments, and guest discovery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={() => setActiveTab('register')}
                className="hover:text-[#B89320] dark:hover:text-[#D4AF37] font-medium transition-colors"
              >
                Register a Hotel or Restaurant
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className="hover:text-[#B89320] dark:hover:text-[#D4AF37] font-medium transition-colors"
              >
                Check Application Status
              </button>
              <a href="#discover-venues" className="hover:text-[#B89320] dark:hover:text-[#D4AF37] font-medium transition-colors">
                Browse Kigali Venues
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-[#D4AF37]/25 dark:border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <span>© 2026 Sangira Hospitality Network. Kigali, Rwanda. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>Operating in Kigali · Rubavu · Musanze</span>
              <span>MTN Mobile Money Verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
