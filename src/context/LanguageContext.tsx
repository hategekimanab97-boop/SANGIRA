import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

export type SupportedLanguage = 'en' | 'rw' | 'fr' | 'sw';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'sw', name: 'Kiswahili', nativeName: 'Kiswahili', flag: '🇹🇿' },
];

export interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  translateDescription: (text?: string) => string;
}

const DICTIONARY: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Top Bar & Navigation
    'brand.name': 'SANGIRA',
    'brand.tagline': "Rwanda's 5-Star Hospitality & Dining",
    'nav.exploreHotels': 'Explore Hotels & Stays',
    'nav.diningRooftops': 'Dining & Rooftops',
    'nav.listProperty': 'List Your Property',
    'nav.trackRegistration': 'Track Registration',
    'nav.joinPartner': 'Join Partner Network',
    'nav.simulateRole': 'Simulate Role:',

    // Hero Section
    'hero.title': 'SANGIRA – Where Everything Great Comes Together, Different Places, Endless Experiences.',
    'hero.subtitle': 'Explore verified luxury hotels, lakeside beach resorts, and rooftop jazz bistros. Browse live chef menus, view room availability, and dine contactless with MTN Mobile Money.',
    'hero.searchPlaceholder': 'Search hotel name, dish, or cocktail...',
    'hero.allDestinations': 'All Destinations',
    'hero.cityKigali': 'Kigali City',
    'hero.cityRubavu': 'Rubavu (Lake Kivu)',
    'hero.cityMusanze': 'Musanze (Volcanoes)',
    'hero.discover': 'Discover',
    'hero.exploreHotelsButton': 'Explore Hotels & Stays',

    // Facilities Slider
    'facility.pool.title': 'Skyline Heated Infinity Pool & Sundeck',
    'facility.pool.headline': 'Olympic Heated Infinity Pool',
    'facility.pool.subtext': 'Basking sundeck & private loungers overlooking panoramic Kigali hills and Lake Kivu sunsets',
    'facility.pool.badge': '5-Star Leisure',
    'facility.pool.location': 'Kigali Serena & Lake Kivu Retreats',

    'facility.suite.title': 'Presidential Panoramic Suite & Terrace',
    'facility.suite.headline': 'Master Executive Suite',
    'facility.suite.subtext': 'King plush bedding, marble soaking tub, and wrap-around terrace view of the 1,000 hills',
    'facility.suite.badge': 'Luxury Stays',
    'facility.suite.location': 'Kigali Marriott & Bisate Grand Villas',

    'facility.dining.title': 'Gourmet African Grill & Sommelier Cellar',
    'facility.dining.headline': 'Fine Dining & Sommelier Cellar',
    'facility.dining.subtext': 'Oak-smoked Nyama Choma, fresh Lake Kivu Sambaza, and curated vintage wine pairings',
    'facility.dining.badge': 'Michelin Dining',
    'facility.dining.location': 'The Retreat & Fusion Bistro',

    'facility.lodge.title': 'Virunga Mountain Eco-Lodge & Fireplace',
    'facility.lodge.headline': 'Volcanoes Forest Hearth Lounge',
    'facility.lodge.subtext': 'Handcrafted volcanic stone fireplace with mist-covered rainforest canopy vistas',
    'facility.lodge.badge': 'Eco Sanctuary',
    'facility.lodge.location': 'Musanze Volcanoes Eco-Resort',

    'facility.rooftop.title': '360° Sunset Skyline Rooftop & Mixology',
    'facility.rooftop.headline': 'Sunset Craft Cocktail Skybar',
    'facility.rooftop.subtext': 'Live saxophone jazz evenings, signature botanical cocktails, and sparkling city lights',
    'facility.rooftop.badge': 'Rooftop Social',
    'facility.rooftop.location': 'Inzora Rooftop & Kigali Heights',

    'facility.spa.title': 'Botanical Wellness & Hydrotherapy Spa',
    'facility.spa.headline': 'Thermal Baths & Rwandan Herbal Rituals',
    'facility.spa.subtext': 'Deep-tissue aromatherapy, cedar sauna, and tranquil lakeside meditation pavilion',
    'facility.spa.badge': 'Wellness Retreat',
    'facility.spa.location': 'One&Only Nyungwe & Lake Sanctuary',

    // Venue Catalog Section
    'venues.heading': 'Registered Hotels & Restaurants',
    'venues.subheading': 'Select any venue to view live menus, check room suites, or start ordering directly.',
    'venues.showing': 'Showing',
    'venues.verifiedVenues': 'verified venues',
    'venues.in': 'in',
    'venues.nightlyStay': 'Nightly Stay',
    'venues.diningFloor': 'Dining Floor',
    'venues.tablesReady': 'Tables Ready',
    'venues.specialty': 'Specialty:',
    'venues.details': 'Details',
    'venues.liveMenu': 'Live Menu',
    'venues.bookStay': 'Book Room / Stay',
    'venues.orderDine': 'Order / Dine Table',

    // Guest Experience Section
    'exp.title': 'The 5-Star Guest Experience',
    'exp.subtitle': 'No waiting for staff to bring printed menus or take credit cards away. Sangira connects dining tables and hotel suites directly to active kitchens and bars.',
    'exp.qrMenu': 'Instant QR Ordering',
    'exp.qrDesc': 'Scan table or suite code to browse photos, chef specials, and ingredient notes in 4 languages.',
    'exp.splitTickets': 'Split Kitchen & Bar',
    'exp.splitDesc': 'Drinks go straight to mixologists while food orders stream directly to chef KDS lines.',
    'exp.momoPayment': 'Instant MoMo & Visa',
    'exp.momoDesc': 'Pay via MTN Mobile Money, Airtel Money, or contactless card without staff handling POS terminals.',
    'exp.roomService': 'Hotel In-Room Dining',
    'exp.roomDesc': 'Guests in suites order gourmet breakfast and late-night supper directly charged to their room folio.',

    // Modal Venue Preview
    'modal.overview': 'Overview & Amenities',
    'modal.menu': 'Menu Highlights',
    'modal.rooms': 'Room Accommodations',
    'modal.about': 'About this Venue',
    'modal.amenities': 'Amenities & Facilities',
    'modal.ready': 'Ready to dine or stay?',
    'modal.openQR': 'Open Live QR Menu & Dine',
    'modal.chefSpecials': 'Live Chef Menu Specials',
    'modal.contactlessNote': 'Contactless QR ordering available',
    'modal.featuredSuites': 'Featured Suites & Stays',
    'modal.night': '/ night',

    // Customer Ordering Portal
    'customer.welcome': 'Welcome to',
    'customer.table': 'Table',
    'customer.room': 'Room Suite',
    'customer.contactlessTitle': 'Contactless 5-Star Dining Menu',
    'customer.contactlessSub': 'Fresh seasonal cuisine & signature Rwandan bar beverages · Prices include 18% VAT',
    'customer.orderingFor': 'Ordering for:',
    'customer.tabMenu': 'Menu Catalog',
    'customer.tabCart': 'Shopping Cart',
    'customer.tabTrack': 'Live Order Tracker',
    'customer.searchPlaceholder': 'Search dish or beverage...',
    'customer.categories.all': 'All Items',
    'customer.categories.food': 'Main Kitchen',
    'customer.categories.drinks': 'Bar & Cocktails',
    'customer.categories.dessert': 'Desserts',
    'customer.categories.specials': "Chef's Specials",
    'customer.prepMins': 'mins prep',
    'customer.addToOrder': 'Add to Order',
    'customer.yourOrder': 'Your Active Order',
    'customer.yourTableOrder': 'Your Table Order',
    'customer.clearCart': 'Clear Cart',
    'customer.cartEmpty': 'Your cart is empty.',
    'customer.browseFood': 'Browse Delicious Food & Drinks',
    'customer.subtotal': 'Subtotal',
    'customer.serviceFee': 'Service (10%)',
    'customer.vat': 'VAT (18% Included)',
    'customer.total': 'Total Payable',
    'customer.guestName': 'Guest Name / Reference (Optional)',
    'customer.namePlaceholder': 'Your name for table order announcement',
    'customer.settlementMethod': 'Select Settlement Method',
    'customer.placeOrder': 'Send Order to Kitchen & Bar',
    'customer.submitOrder': 'Submit Order to Kitchen & Bar',
    'customer.payWithMoMo': 'Pay with MTN / Airtel MoMo',
    'customer.orderPlaced': 'Order Sent to Kitchen!',
    'customer.orderStatus': 'Live Preparation Status',
    'customer.orderDispatchTracker': 'Live Kitchen & Bar Dispatch Tracker',
    'customer.orderMore': '← Order additional dishes or beverages',
    'customer.emptyCart': 'Your dining cart is empty. Pick a dish or drink to begin.',
    'customer.step1Title': 'Order Received & Split',
    'customer.step1Desc': 'Tickets routed to Kitchen and Bar displays',
    'customer.step2Title': 'Preparation in Progress',
    'customer.step2Desc': 'Chefs and bartenders crafting your dishes',
    'customer.step3Title': 'Plated & Ready for Service',
    'customer.step3Desc': 'Dishes chilled or hot on pass counter',
    'customer.step4Title': 'Delivered to Table',
    'customer.step4Desc': 'Confirmed by floor server team',

    // Roles & Staff
    'role.public': 'Public & Onboarding',
    'role.customer': 'Customer QR Menu',
    'role.admin': 'Platform Superadmin',
    'role.manager': 'Hotel & Restaurant Manager',
    'role.kitchen': 'Kitchen KDS Display',
    'role.bar': 'Bar & Mixology KDS',
    'role.stock': 'Stock & Central Inventory',
    'role.cashier': 'Cashier & MoMo Terminal',
    'role.server': 'Floor Server Terminal',

    // Common
    'common.language': 'Language',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.save': 'Save Changes',
    'common.active': 'Active',
    'common.rwf': 'RWF',
    'common.status': 'Status',
  },

  rw: {
    // Top Bar & Navigation
    'brand.name': 'SANGIRA',
    'brand.tagline': "Urubuga rw'Amahóteri n'Amafunguro Meza mu Rwanda",
    'nav.exploreHotels': "Sura Hoteli n'Amahóteri",
    'nav.diningRooftops': "Amafunguro n'Ibisenge",
    'nav.listProperty': 'Andikisha Hoteli / Resitora',
    'nav.trackRegistration': 'Kurikirana Kwiyandikisha',
    'nav.joinPartner': 'Injira mu Bafatanyabikorwa',
    'nav.simulateRole': 'Hitamo Icyo Uricyo:',

    // Hero Section
    'hero.title': 'SANGIRA – Aho Ibyiza Byose Bihurira, Ahantu Hatandukanye, Ibyiza Bitandukanye.',
    'hero.subtitle': 'Sura amahoteli yemejwe, ibiruhukiro biri ku kiyaga, n’utubari twiza two ku bisenge. Irebere menu z’abateka b’inzobere, reba ibyumba bihari, utumize wishyure na MTN MoMo.',
    'hero.searchPlaceholder': 'Shakisha izina rya hoteli, ifunguro, cyangwa icyinyobwa...',
    'hero.allDestinations': 'Ahantu Hose',
    'hero.cityKigali': 'Umujyi wa Kigali',
    'hero.cityRubavu': 'Rubavu (Ikiyaga cya Kivu)',
    'hero.cityMusanze': 'Musanze (Ibirunga)',
    'hero.discover': 'Shakisha',
    'hero.exploreHotelsButton': "Sura Hoteli n'Amahóteri",

    // Facilities Slider
    'facility.pool.title': "Pisine Ishyushye y'Indashyikirwa n'Uburuhukiro",
    'facility.pool.headline': 'Pisine Mpuzamahanga Ishyushye',
    'facility.pool.subtext': "Itegeye imisozi myiza ya Kigali n'uburanga bw'ikiyaga cya Kivu ku kurenga kw'izuba",
    'facility.pool.badge': "Uburuhukiro bw'Inyenyeri 5",
    'facility.pool.location': 'Kigali Serena & Ibiruhukiro bya Kivu',

    'facility.suite.title': "Icyumba cy'Abanyacyubahiro gifite Terasi",
    'facility.suite.headline': "Icyumba Gikuru cy'Indashyikirwa",
    'facility.suite.subtext': "Igitanda kinini gitoshye, ubwogero bwa marimari, no kureba imisozi igihumbi",
    'facility.suite.badge': 'Amahóteri Meza',
    'facility.suite.location': 'Kigali Marriott & Bisate Grand Villas',

    'facility.dining.title': "Amafunguro Asanzwe n'Akabari k'Ibyinzobere",
    'facility.dining.headline': "Amafunguro Meza n'Icyumba cya Divayi",
    'facility.dining.subtext': 'Inyama zokeje ziryoshye, isambaza nshya zo muri Kivu, na divayi yatoranyijwe neza',
    'facility.dining.badge': 'Amafunguro y’Ikirenga',
    'facility.dining.location': 'The Retreat & Fusion Bistro',

    'facility.lodge.title': "Icumbi ryo mu Birunga rifite Iziko",
    'facility.lodge.headline': "Uburuhukiro bwo mu Mashyamba y'Ibirunga",
    'facility.lodge.subtext': "Iziko ryubatswe mu mabuye y'ibirunga iteganye n'ibicu n'amashyamba kimeza",
    'facility.lodge.badge': 'Icyanya Gikungahaye',
    'facility.lodge.location': 'Musanze Volcanoes Eco-Resort',

    'facility.rooftop.title': "Hejuru ku Gisenge harebana n'Ikiyaga n'Umujyi",
    'facility.rooftop.headline': "Akabari ko ku Gisenge k'Ibitaramo",
    'facility.rooftop.subtext': "Ibitaramo bya saxofone, inzoga zikorwa mu bimera by'umwimerere, n'amatara y'umujyi",
    'facility.rooftop.badge': 'Ibisenge Byiza',
    'facility.rooftop.location': 'Inzora Rooftop & Kigali Heights',

    'facility.spa.title': "Ihuriro ryo Kwiyitaho n'Ubuvuzi bw'Amazi",
    'facility.spa.headline': "Ubwogero bw'Amazi Ashyushye n'Imiti Gakondo",
    'facility.spa.subtext': "Kunanura imikaya, sauna y'ibiti byiza, n'ahantu ho gutuza ku kiyaga",
    'facility.spa.badge': 'Ubuvuzi n’Uburuhukiro',
    'facility.spa.location': 'One&Only Nyungwe & Lake Sanctuary',

    // Venue Catalog Section
    'venues.heading': 'Amahóteri na Resitora Byemewe',
    'venues.subheading': 'Hitamo ahantu ushaka kureba menu, icyumba, cyangwa gutangira gutumiza ako kanya.',
    'venues.showing': 'Hagaragaye',
    'venues.verifiedVenues': 'ahantu hemejwe',
    'venues.in': 'muri',
    'venues.nightlyStay': 'Ijoro Rimwe',
    'venues.diningFloor': 'Ameza yo Kuriraho',
    'venues.tablesReady': 'Ameza Ahari',
    'venues.specialty': "Icy'Umwihariko:",
    'venues.details': 'Ibisobanuro',
    'venues.liveMenu': "Menu y'Ubu",
    'venues.bookStay': 'Fata Icyumba',
    'venues.orderDine': 'Tumiza ku Meza',

    // Guest Experience Section
    'exp.title': "Uburambe bw'Umukiriya bwo ku Rwego rwo Hewuru",
    'exp.subtitle': 'Nta gutegereza abakozi bazana impapuro za menu cyangwa amakarita. Sangira ihuriza ameza n’ibyumba by’amahoteli ku bikoni n’utubari ako kanya.',
    'exp.qrMenu': 'Gutumiza ako kanya kuri QR',
    'exp.qrDesc': 'Koresha telefoni usome kode yo ku meza urebe amafoto, amafunguro mashya, n’ibigize ibiryo mu ndimi 4.',
    'exp.splitTickets': 'Ibyiciro bya Gisivisi',
    'exp.splitDesc': 'Ibyo kunywa bijya ku bategura inzoga mu gihe ibiryo bihita byoherezwa ku bakora mu gikoni.',
    'exp.momoPayment': 'Kwishyura ako kanya na MoMo',
    'exp.momoDesc': 'Ishyura ukoresheje MTN Mobile Money, Airtel Money, cyangwa ikarita utarinze gutegereza imashini.',
    'exp.roomService': "Amafunguro mu Cyumba cya Hoteli",
    // Modal Venue Preview
    'modal.overview': "Incamake n'Ibikoresho",
    'modal.menu': "Amafunguro y'Imena",
    'modal.rooms': "Ibyumba Byiza by'Amahóteri",
    'modal.about': 'Ibyerekeye iyi Hoteli / Resitora',
    'modal.amenities': "Ibikoresho n'Ibyiza Bihari",
    'modal.ready': 'Witeguye gufungura cyangwa kurara?',
    'modal.openQR': 'Fungura Menu ya QR Utumize',
    'modal.chefSpecials': "Amafunguro y'Umwihariko w'Abateka",
    'modal.contactlessNote': 'Gutumiza kuri QR kudasaba guhura birakora',
    'modal.featuredSuites': "Ibyumba by'Akataraboneka Bihari",
    'modal.night': '/ ijoro',

    // Customer Ordering Portal
    'customer.welcome': 'Murakaza neza kuri',
    'customer.table': 'Ameza',
    'customer.room': 'Icyumba',
    'customer.contactlessTitle': "Menu y'Amafunguro y'Inyenyeri 5 Idakenera Guhura",
    'customer.contactlessSub': "Amafunguro meza n'ibinyobwa byo mu Rwanda · Ibiciro birimo 18% TVA",
    'customer.orderingFor': 'Kuri Table:',
    'customer.tabMenu': "Urutonde rw'Ibiryo",
    'customer.tabCart': 'Ikarita yo Kugura',
    'customer.tabTrack': 'Gukurikirana Ibyo Watumije',
    'customer.searchPlaceholder': 'Shakisha ifunguro cyangwa icyo kunywa...',
    'customer.categories.all': 'Bose',
    'customer.categories.food': "Igikoni Gikuru",
    'customer.categories.drinks': 'Akabari & Divayi',
    'customer.categories.dessert': 'Ibyoroshye (Desserts)',
    'customer.categories.specials': "Iby'Umwihariko",
    'customer.prepMins': 'min yo gutegura',
    'customer.addToOrder': 'Ongeraho',
    'customer.yourOrder': 'Ibyo Watumije',
    'customer.yourTableOrder': 'Ibyo Utumije kuri Table',
    'customer.clearCart': 'Komeza Ubusa',
    'customer.cartEmpty': 'Ikarita yawe irimo ubusa.',
    'customer.browseFood': "Reba Amafunguro n'Ibinyobwa",
    'customer.subtotal': 'Amafaranga yose',
    'customer.serviceFee': 'Serivisi (10%)',
    'customer.vat': 'TVA (18% Irabariwe)',
    'customer.total': 'Amafaranga yo Kwishyura',
    'customer.guestName': "Izina ry'Umukiriya (Ku bushake)",
    'customer.namePlaceholder': 'Izina ryawe ryo kumenyesha table',
    'customer.settlementMethod': 'Hitamo Uburyo bwo Kwishyura',
    'customer.placeOrder': 'Ohereza Ibyo Watumije mu Gikoni',
    'customer.submitOrder': 'Ohereza mu Gikoni & Akabari',
    'customer.payWithMoMo': 'Ishyura na MTN / Airtel MoMo',
    'customer.orderPlaced': 'Ibyo watumije byoherejwe mu gikoni!',
    'customer.orderStatus': 'Aho Bitunganyirizwa Ubu',
    'customer.orderDispatchTracker': 'Ikoranabuhanga ryo Gukurikirana Itumiza',
    'customer.orderMore': '← Tumiza ibindi biribwa cyangwa ibinyobwa',
    'customer.emptyCart': 'Nta kintu urashyiramo. Hitamo ifunguro cyangwa icyo kunywa.',
    'customer.step1Title': 'Itumiza Ryakiriwe & Ryatandukanyijwe',
    'customer.step1Desc': "Bikagejejwe kuri ekara z'igikoni n'akabari",
    'customer.step2Title': 'Birimo Gutegurwa',
    'customer.step2Desc': "Abateka n'abavanga ibinyobwa barimo kubitegura",
    'customer.step3Title': 'Byateguwe Neza Bitegereje Kugezwa',
    'customer.step3Desc': 'Ibiryo birashyushye ku meza yo gutanga',
    'customer.step4Title': 'Byageze ku Meza',
    'customer.step4Desc': "Byemejwe n'abakozi bo mu cyumba",

    // Roles & Staff
    'role.public': 'Ahabona & Kwiyandikisha',
    'role.customer': 'Menu ya QR y’Umukiriya',
    'role.admin': 'Umuyobozi Mukuru w’Urubuga',
    'role.manager': 'Umuyobozi wa Hoteli & Resitora',
    'role.kitchen': 'Imashini y’Igikoni (KDS)',
    'role.bar': 'Akabari n’Ibyo Kunywa',
    'role.stock': 'Ububiko n’Ibyinjira',
    'role.cashier': 'Icyumba cy’Imari & MoMo',
    'role.server': 'Ushinzwe Kwakira Abakiriya',

    // Common
    'common.language': 'Ururimi',
    'common.search': 'Shakisha',
    'common.filter': 'Hitamo',
    'common.close': 'Funga',
    'common.back': 'Subira Inyuma',
    'common.save': 'Bika Impinduka',
    'common.active': 'Birakora',
    'common.rwf': 'RWF',
    'common.status': 'Imiterere',
  },

  fr: {
    // Top Bar & Navigation
    'brand.name': 'SANGIRA',
    'brand.tagline': "L'Hospitalité & Gastronomie 5 Étoiles au Rwanda",
    'nav.exploreHotels': 'Explorer Hôtels et Séjours',
    'nav.diningRooftops': 'Gastronomie et Rooftops',
    'nav.listProperty': 'Inscrire votre Établissement',
    'nav.trackRegistration': 'Suivre Inscription',
    'nav.joinPartner': 'Rejoindre le Réseau Partenaire',
    'nav.simulateRole': 'Simuler le Rôle :',

    // Hero Section
    'hero.title': 'SANGIRA – Là où le Meilleur se Rassemble, Lieux Uniques, Expériences Infinies.',
    'hero.subtitle': "Découvrez des hôtels de luxe vérifiés, des complexes au bord du lac et des bistros jazz sur les toits. Consultez les menus des chefs, vérifiez la disponibilité des chambres et réglez sans contact par MTN Mobile Money.",
    'hero.searchPlaceholder': 'Recherchez un hôtel, un plat ou un cocktail...',
    'hero.allDestinations': 'Toutes les Destinations',
    'hero.cityKigali': 'Ville de Kigali',
    'hero.cityRubavu': 'Rubavu (Lac Kivu)',
    'hero.cityMusanze': 'Musanze (Volcans)',
    'hero.discover': 'Découvrir',
    'hero.exploreHotelsButton': 'Explorer Hôtels et Séjours',

    // Facilities Slider
    'facility.pool.title': 'Piscine à Débordement Chauffée et Terrasse',
    'facility.pool.headline': 'Piscine Olympique Chauffée',
    'facility.pool.subtext': 'Transats privés et terrasse avec vue panoramique sur les collines de Kigali et les couchers de soleil du lac Kivu',
    'facility.pool.badge': 'Loisirs 5 Étoiles',
    'facility.pool.location': 'Kigali Serena & Retraites du Lac Kivu',

    'facility.suite.title': 'Suite Présidentielle Panoramique et Terrasse',
    'facility.suite.headline': 'Suite Exécutive Supérieure',
    'facility.suite.subtext': 'Lit king-size somptueux, baignoire en marbre et vue panoramique sur les mille collines rwandaises',
    'facility.suite.badge': 'Séjours d’Exception',
    'facility.suite.location': 'Kigali Marriott & Bisate Grand Villas',

    'facility.dining.title': 'Grill Africain Gastronomique et Cave à Vins',
    'facility.dining.headline': 'Haute Gastronomie et Cave de Sommelier',
    'facility.dining.subtext': 'Nyama Choma fumée au chêne, Sambaza fraîches du lac Kivu et accords de grands crus sélectionnés',
    'facility.dining.badge': 'Cuisine Étoilée',
    'facility.dining.location': 'The Retreat & Fusion Bistro',

    'facility.lodge.title': 'Éco-Lodge et Cheminée des Montagnes des Virunga',
    'facility.lodge.headline': 'Salon avec Foyer au Cœur de la Forêt',
    'facility.lodge.subtext': 'Cheminée artisanale en pierre volcanique face à la canopée brumeuse de la forêt tropicale',
    'facility.lodge.badge': 'Sanctuaire Écologique',
    'facility.lodge.location': 'Musanze Volcanoes Eco-Resort',

    'facility.rooftop.title': 'Rooftop Panoramique 360° et Bar à Cocktails',
    'facility.rooftop.headline': 'Skybar au Coucher du Soleil',
    'facility.rooftop.subtext': 'Soirées jazz au saxophone en direct, cocktails botaniques signature et lumières scintillantes de la ville',
    'facility.rooftop.badge': 'Ambiance Rooftop',
    'facility.rooftop.location': 'Inzora Rooftop & Kigali Heights',

    'facility.spa.title': 'Spa Botanique de Bien-Être et Hydrothérapie',
    'facility.spa.headline': 'Bains Thermaux et Rituels aux Plantes Rwandaises',
    'facility.spa.subtext': 'Aromathérapie profonde, sauna en cèdre et pavillon de méditation serein au bord du lac',
    'facility.spa.badge': 'Bien-Être & Spa',
    'facility.spa.location': 'One&Only Nyungwe & Sanctuaire du Lac',

    // Venue Catalog Section
    'venues.heading': 'Hôtels et Restaurants Partenaires',
    'venues.subheading': 'Sélectionnez un établissement pour voir les menus, les chambres ou commander directement.',
    'venues.showing': 'Affichage de',
    'venues.verifiedVenues': 'établissements vérifiés',
    'venues.in': 'à',
    'venues.nightlyStay': 'Nuitée',
    'venues.diningFloor': 'Salle de Restaurant',
    'venues.tablesReady': 'Tables Prêtes',
    'venues.specialty': 'Spécialité :',
    'venues.details': 'Détails',
    'venues.liveMenu': 'Menu en Direct',
    'venues.bookStay': 'Réserver Chambre',
    'venues.orderDine': 'Commander à Table',

    // Guest Experience Section
    'exp.title': "L'Expérience Client 5 Étoiles",
    'exp.subtitle': 'Finie l’attente des menus papier ou des terminaux de cartes. Sangira connecte les tables et les suites directement aux cuisines et aux bars actifs.',
    'exp.qrMenu': 'Commande Instantanée par QR',
    'exp.qrDesc': 'Scannez le code de votre table pour parcourir les photos, les créations du chef et les allergènes en 4 langues.',
    'exp.splitTickets': 'Séparation Cuisine et Bar',
    'exp.splitDesc': 'Les boissons sont envoyées aux mixologues tandis que les plats sont dirigés directement vers les écrans KDS des chefs.',
    'exp.momoPayment': 'Paiement Instantané MoMo et Carte',
    'exp.momoDesc': 'Payez par MTN Mobile Money, Airtel Money ou carte bancaire sans manipulation de terminal par les serveurs.',
    'exp.roomService': 'Service d’Étage Hôtelier',
    'exp.roomDesc': 'Les clients des suites commandent petit-déjeuner gastronomique ou souper tardif directement imputés à la note de chambre.',

    // Modal Venue Preview
    'modal.overview': 'Aperçu & Équipements',
    'modal.menu': 'Sélection du Menu',
    'modal.rooms': 'Chambres & Hébergements',
    'modal.about': 'À Propos de cet Établissement',
    'modal.amenities': 'Équipements & Services',
    'modal.ready': 'Prêt à dîner ou séjourner ?',
    'modal.openQR': 'Ouvrir le Menu QR & Commander',
    'modal.chefSpecials': 'Créations Culinaires du Chef',
    'modal.contactlessNote': 'Commande QR sans contact disponible',
    'modal.featuredSuites': 'Suites & Chambres Remarquables',
    'modal.night': '/ nuit',

    // Customer Ordering Portal
    'customer.welcome': 'Bienvenue chez',
    'customer.table': 'Table',
    'customer.room': 'Chambre / Suite',
    'customer.contactlessTitle': 'Menu Gastronomique 5 Étoiles Sans Contact',
    'customer.contactlessSub': 'Cuisine fraîche de saison & boissons rwandaises d’exception · Prix TTC (TVA 18% incluse)',
    'customer.orderingFor': 'Commande pour :',
    'customer.tabMenu': 'Catalogue du Menu',
    'customer.tabCart': 'Panier de Commande',
    'customer.tabTrack': 'Suivi de Commande en Direct',
    'customer.searchPlaceholder': 'Rechercher un plat ou une boisson...',
    'customer.categories.all': 'Tous les Articles',
    'customer.categories.food': 'Cuisine & Plats Chauds',
    'customer.categories.drinks': 'Bar & Cocktails',
    'customer.categories.dessert': 'Desserts & Douceurs',
    'customer.categories.specials': 'Suggestions du Chef',
    'customer.prepMins': 'min de préparation',
    'customer.addToOrder': 'Ajouter au Panier',
    'customer.yourOrder': 'Votre Commande en Cours',
    'customer.yourTableOrder': 'Votre Commande de Table',
    'customer.clearCart': 'Vider le Panier',
    'customer.cartEmpty': 'Votre panier est vide.',
    'customer.browseFood': 'Découvrir nos Plats & Boissons',
    'customer.subtotal': 'Sous-total',
    'customer.serviceFee': 'Service (10%)',
    'customer.vat': 'TVA (18% Inclus)',
    'customer.total': 'Total à Payer',
    'customer.guestName': 'Nom du Client / Référence (Facultatif)',
    'customer.namePlaceholder': 'Votre nom pour l’annonce à table',
    'customer.settlementMethod': 'Mode de Paiement',
    'customer.placeOrder': 'Envoyer la Commande en Cuisine & Bar',
    'customer.submitOrder': 'Envoyer la Commande en Cuisine & Bar',
    'customer.payWithMoMo': 'Payer avec MTN / Airtel MoMo',
    'customer.orderPlaced': 'Commande envoyée avec succès !',
    'customer.orderStatus': 'État de Préparation en Direct',
    'customer.orderDispatchTracker': 'Suivi de Préparation Cuisine & Bar',
    'customer.orderMore': '← Commander d’autres plats ou boissons',
    'customer.emptyCart': 'Votre panier est vide. Choisissez un plat ou une boisson.',
    'customer.step1Title': 'Commande Reçue & Dispatchée',
    'customer.step1Desc': 'Tickets envoyés aux écrans de la cuisine et du bar',
    'customer.step2Title': 'Préparation en Cours',
    'customer.step2Desc': 'Les chefs et barmen préparent vos plats et cocktails',
    'customer.step3Title': 'Prêt pour le Service',
    'customer.step3Desc': 'Plats chauds ou frais au comptoir de service',
    'customer.step4Title': 'Servi à Table',
    'customer.step4Desc': 'Confirmé par les serveurs en salle',

    // Roles & Staff
    'role.public': 'Portail Public',
    'role.customer': 'Menu Client QR',
    'role.admin': 'Super-Administrateur',
    'role.manager': 'Directeur d’Hôtel & Restaurant',
    'role.kitchen': 'Affichage Cuisine (KDS)',
    'role.bar': 'Bar & Mixologie',
    'role.stock': 'Gestion des Stocks',
    'role.cashier': 'Caisse & Terminal MoMo',
    'role.server': 'Service en Salle',

    // Common
    'common.language': 'Langue',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.save': 'Enregistrer',
    'common.active': 'Actif',
    'common.rwf': 'RWF',
    'common.status': 'Statut',
  },

  sw: {
    // Top Bar & Navigation
    'brand.name': 'SANGIRA',
    'brand.tagline': 'Ukarimu na Milio ya Nyota 5 nchini Rwanda',
    'nav.exploreHotels': 'Gundua Hoteli na Malazi',
    'nav.diningRooftops': 'Milo na Maeneo ya Juu',
    'nav.listProperty': 'Sajili Biashara Yako',
    'nav.trackRegistration': 'Fuatilia Usajili',
    'nav.joinPartner': 'Jiunge na Mtandao wa Washirika',
    'nav.simulateRole': 'Chagua Wadhifa:',

    // Hero Section
    'hero.title': 'SANGIRA – Mahali Pazuri Panapokutanisha Bora Zote, Maeneo Mbalimbali, Uzoefu Usio na Kikomo.',
    'hero.subtitle': 'Chunguza hoteli za kifahari zilizothibitishwa, hoteli za kando ya ziwa, na mikahawa ya ghorofani. Tazama menyu za wapishi, vyumba vilivyopo, na uagize kidijitali ukilipa kwa MTN MoMo.',
    'hero.searchPlaceholder': 'Tafuta jina la hoteli, chakula, au kinywaji...',
    'hero.allDestinations': 'Maeneo Yote',
    'hero.cityKigali': 'Jiji la Kigali',
    'hero.cityRubavu': 'Rubavu (Ziwa Kivu)',
    'hero.cityMusanze': 'Musanze (Milima ya Volkano)',
    'hero.discover': 'Gundua',
    'hero.exploreHotelsButton': 'Gundua Hoteli na Malazi',

    // Facilities Slider
    'facility.pool.title': 'Bwawa la Kuogelea lenye Maji Moto na Sebule',
    'facility.pool.headline': 'Bwawa la Olimpiki lenye Maji Moto',
    'facility.pool.subtext': 'Sebule za jua na viti vya binafsi vinavyotazama milima ya Kigali na machweo ya Ziwa Kivu',
    'facility.pool.badge': 'Starehe ya Nyota 5',
    'facility.pool.location': 'Kigali Serena & Malazi ya Ziwa Kivu',

    'facility.suite.title': 'Chumba cha Rais chenye Mtazamo wa Panoramu',
    'facility.suite.headline': 'Chumba Kikuu cha Watendaji',
    'facility.suite.subtext': 'Kitanda kikubwa cha kifahari, bafu la marumaru, na mtaro unaotazama milima elfu moja ya Rwanda',
    'facility.suite.badge': 'Malazi ya Kifahari',
    'facility.suite.location': 'Kigali Marriott & Bisate Grand Villas',

    'facility.dining.title': 'Choma ya Kiafrika na Chumba cha Mvinyo',
    'facility.dining.headline': 'Mlo Bora na Mvinyo Teule',
    'facility.dining.subtext': 'Nyama Choma iliyochomwa vizuri, Sambaza safi za Ziwa Kivu, na divai zilizochaguliwa kwa uangalifu',
    'facility.dining.badge': 'Mlo wa Kifahari',
    'facility.dining.location': 'The Retreat & Fusion Bistro',

    'facility.lodge.title': 'Lodge ya Mazingira ya Milima ya Virunga',
    'facility.lodge.headline': 'Sebule ya Moto wa Msituni',
    'facility.lodge.subtext': 'Paa la mawe ya volkano na mtazamo wa misitu ya mvua yenye ukungu wa asili',
    'facility.lodge.badge': 'Hifadhi ya Asili',
    'facility.lodge.location': 'Musanze Volcanoes Eco-Resort',

    'facility.rooftop.title': 'Ghorofa ya Juu ya 360° ya Machweo na Visa',
    'facility.rooftop.headline': 'Skybar ya Visa vya Kipekee',
    'facility.rooftop.subtext': 'Muziki wa saksafoni wa moja kwa moja, visa vya asili, na mandhari ya taa za jiji',
    'facility.rooftop.badge': 'Mazingira ya Juu',
    'facility.rooftop.location': 'Inzora Rooftop & Kigali Heights',

    'facility.spa.title': 'Spa ya Ustawi wa Mimea na Tiba ya Maji',
    'facility.spa.headline': 'Mabafu ya Maji Moto na Dawa za Asili',
    'facility.spa.subtext': 'Masaji ya kina, sauna ya mierezi, na banda la kutulia kando ya ziwa',
    'facility.spa.badge': 'Ustawi na Afya',
    'facility.spa.location': 'One&Only Nyungwe & Hifadhi ya Ziwa',

    // Venue Catalog Section
    'venues.heading': 'Hoteli na Mikahawa Iliyosajiliwa',
    'venues.subheading': 'Chagua eneo lolote ili kuona menyu, vyumba, au kuanza kuagiza moja kwa moja.',
    'venues.showing': 'Inaonyesha',
    'venues.verifiedVenues': 'maeneo yaliyothibitishwa',
    'venues.in': 'katika',
    'venues.nightlyStay': 'Malazi ya Usiku',
    'venues.diningFloor': 'Ukumbi wa Chakula',
    'venues.tablesReady': 'Meza Tayari',
    'venues.specialty': 'Kipekee:',
    'venues.details': 'Maelezo',
    'venues.liveMenu': 'Menyu Moja kwa Moja',
    'venues.bookStay': 'Hifadhi Chumba',
    'venues.orderDine': 'Agiza kwa Meza',

    // Guest Experience Section
    'exp.title': 'Uzoefu wa Wageni wa Nyota 5',
    'exp.subtitle': 'Hakuna kusubiri watumishi walete menyu za karatasi au kuchukua kadi. Sangira huunganisha meza na vyumba vya hoteli moja kwa moja na jikoni na baa.',
    'exp.qrMenu': 'Kuagiza Papo Hapo kwa QR',
    'exp.qrDesc': 'Skeni msimbo kwenye meza ili kuona picha, mapendekezo ya mpishi, na viungo kwa lugha 4.',
    'exp.splitTickets': 'Mgawanyo wa Jikoni na Baa',
    'exp.splitDesc': 'Vinywaji huenda moja kwa moja kwa wahudumu wa baa huku chakula kikielekezwa kwenye skrini za wapishi jikoni.',
    'exp.momoPayment': 'Malipo ya Papo Hapo ya MoMo na Kadi',
    'exp.momoDesc': 'Lipa kwa MTN Mobile Money, Airtel Money au kadi ya benki bila kupitisha mashine ya POS.',
    'exp.roomService': 'Huduma ya Chakula Chumbani',
    'exp.roomDesc': 'Wageni vyumbani huagiza kifungua kinywa au mlo wa usiku unaoingizwa moja kwa moja kwenye bili ya chumba.',

    // Modal Venue Preview
    'modal.overview': 'Muhtasari & Vifaa',
    'modal.menu': 'Muhtasari wa Menyu',
    'modal.rooms': 'Vyumba vya Kulala',
    'modal.about': 'Kuhusu Eneo Hili',
    'modal.amenities': 'Vifaa & Huduma',
    'modal.ready': 'Uko tayari kula au kulala?',
    'modal.openQR': 'Fungua Menyu ya QR & Agiza',
    'modal.chefSpecials': 'Vyakula Maalum vya Mpishi',
    'modal.contactlessNote': 'Kuagiza bila kugusa kwa QR kupatikana',
    'modal.featuredSuites': 'Vyumba Bora vya Kipekee',
    'modal.night': '/ usiku',

    // Customer Ordering Portal
    'customer.welcome': 'Karibu',
    'customer.table': 'Meza',
    'customer.room': 'Chumba',
    'customer.contactlessTitle': 'Menyu ya Chakula ya Nyota 5 Bila Kugusa',
    'customer.contactlessSub': 'Vyakula safi vya msimu na vinywaji bora vya Rwanda · Bei zinajumuisha 18% VAT',
    'customer.orderingFor': 'Kuagiza kwa ajili ya:',
    'customer.tabMenu': 'Orodha ya Menyu',
    'customer.tabCart': 'Kikapu cha Ununuzi',
    'customer.tabTrack': 'Ufuatiliaji wa Moja kwa Moja',
    'customer.searchPlaceholder': 'Tafuta chakula au kinywaji...',
    'customer.categories.all': 'Vitu Vyote',
    'customer.categories.food': 'Jiko Kuu',
    'customer.categories.drinks': 'Baa & Visa',
    'customer.categories.dessert': 'Kitindamlo (Dessert)',
    'customer.categories.specials': 'Mapendekezo Maalum',
    'customer.prepMins': 'dakika za maandalizi',
    'customer.addToOrder': 'Ongeza kwenye Agizo',
    'customer.yourOrder': 'Agizo Lako la Sasa',
    'customer.yourTableOrder': 'Agizo Lako la Meza',
    'customer.clearCart': 'Futa Kikapu',
    'customer.cartEmpty': 'Kikapu chako kiko tupu.',
    'customer.browseFood': 'Vinjari Vyakula na Vinywaji',
    'customer.subtotal': 'Jumla Ndogo',
    'customer.serviceFee': 'Huduma (10%)',
    'customer.vat': 'Kodi ya VAT (18% Imejumuishwa)',
    'customer.total': 'Jumla ya Kulipa',
    'customer.guestName': 'Jina la Mgeni / Nambari (Hiari)',
    'customer.namePlaceholder': 'Jina lako la kuita kwenye meza',
    'customer.settlementMethod': 'Chagua Njia ya Malipo',
    'customer.placeOrder': 'Tuma Agizo Jikoni na Baa',
    'customer.submitOrder': 'Tuma Agizo Jikoni & Baa',
    'customer.payWithMoMo': 'Lipa kwa MTN / Airtel MoMo',
    'customer.orderPlaced': 'Agizo limetumwa jikoni!',
    'customer.orderStatus': 'Hali ya Maandalizi ya Moja kwa Moja',
    'customer.orderDispatchTracker': 'Kifuatiliaji cha Agizo Jikoni & Baani',
    'customer.orderMore': '← Agiza vyakula au vinywaji vingine',
    'customer.emptyCart': 'Kikapu chako kiko tupu. Chagua chakula au kinywaji kuanza.',
    'customer.step1Title': 'Agizo Limepokelewa & Kugawanywa',
    'customer.step1Desc': 'Tiketi zimeelekezwa kwenye skrini za jikoni na baa',
    'customer.step2Title': 'Maandalizi Yanaendelea',
    'customer.step2Desc': 'Wapishi na wahudumu wa baa wanaandaa maagizo yako',
    'customer.step3Title': 'Tayari Kutolewa',
    'customer.step3Desc': 'Vyakula viko tayari kwenye kaunta ya huduma',
    'customer.step4Title': 'Kimewasilishwa Mezani',
    'customer.step4Desc': 'Imethibitishwa na mhudumu wa ukumbini',

    // Roles & Staff
    'role.public': 'Ukurasa wa Umma',
    'role.customer': 'Menyu ya QR ya Mgeni',
    'role.admin': 'Msimamizi Mkuu wa Mfumo',
    'role.manager': 'Meneja wa Hoteli na Mkahawa',
    'role.kitchen': 'Skrini ya Jikoni (KDS)',
    'role.bar': 'Baa na Vinywaji',
    'role.stock': 'Hesabu na Ghala Kuu',
    'role.cashier': 'Kituo cha Malipo na MoMo',
    'role.server': 'Mhudumu wa Ukumbini',

    // Common
    'common.language': 'Lugha',
    'common.search': 'Tafuta',
    'common.filter': 'Chuja',
    'common.close': 'Funga',
    'common.back': 'Rudi',
    'common.save': 'Hifadhi Mabadiliko',
    'common.active': 'Inatumika',
    'common.rwf': 'RWF',
    'common.status': 'Hali',
  },
};

// Descriptions translation mapping for hotels and specialties
const DESCRIPTION_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {},
  rw: {
    'Chic culinary sanctuary in leafy Kiyovu blending Rwandan organic produce with French culinary finesse, artisan cocktails, and acoustic jazz evenings.':
      "Ahantu heza cyane h'indashyikirwa i Kiyovu hahuza ibiribwa by'umwimerere byo mu Rwanda n'ubuhanga bw'abafaransa, ibyo kunywa bidasanzwe n'umuziki wa jazi buri mugoroba.",
    'Historic luxury hotel set amid tropical gardens offering fine international dining, Olympic swimming pool, executive suites, and poolside cocktail lounge.':
      "Hoteli y'amateka y'akataraboneka iri mu busitani butoshye itanga amafunguro mpuzamahanga, pisine nini yo kogeramo, ibyumba by'abanyacyubahiro n'akabari ko ku mazi.",
    'Lakeside beach resort boasting private sandy shores, Lake Kivu sunset dining, fresh grilled tilapia & sambaza, water sports, and mountain views.':
      "Icyanya cy'akarusho ku mucanga w'ikiyaga cya Kivu gitanga amafunguro ku kurenga kw'izuba, ifi na sambaza zokeje neza, imikino yo mu mazi no kureba imisozi myiza.",
    'Intimate eco-luxury boutique lodge in the foothills of Volcanoes National Park featuring farm-to-table volcanic soil dining, fireplace lounges, and gorilla trek briefings.':
      "Icumbi ryiza cyane ry'akataraboneka mu birunga ritanga amafunguro ahingwa mu butaka bw'ibirunga, iziko ryaka neza no gutegura ingendo zo gusura ingagi.",
    'Vibrant rooftop lounge overlooking Kigali skyline with artisanal botanical cocktails, craft beers, Nyama Choma tapas, and weekly afro-house DJ sessions.':
      "Akabari kagezweho ko hejuru ku gisenge gateganye n'umujyi wa Kigali karangwamo ibyo kunywa bidasanzwe, inyama zokeje n'umuziki ukunzwe.",
    'Sophisticated 5-star international hotel in downtown Kigali featuring multiple world-class restaurants, ballroom venues, luxury spa, and executive club floor.':
      "Hoteli ikomeye y'inyenyeri 5 hagati mu mujyi wa Kigali irimo resitora mpuzamahanga zikomeye, ahakorerwa ibirori bikomeye, ubwogero bwa sipaa n'ibyumba byo hejuru.",
    'Acoustic Jazz Evenings': 'Ibitaramo bya Jazi buri Mugoroba',
    'Lake Kivu Beachfront': 'Ku Nkombe z’Ikiyaga cya Kivu',
    'Forest Hearth Lounge': 'Uburuhukiro bwo mu Mashyamba',
    'Infinity Skyline Pool': 'Pisine Nini Ireba Umujyi',
    'Rooftop Sunset Lounge': 'Akabari ko ku Gisenge',
    'Grilled Lake Kivu Tilapia': 'Ifi ya Tilapiya Yokeje yo muri Kivu',
    'Volcanoes Organic Brochette': 'Burushete y’Inyama zo mu Birunga',
    'Smoked Nyama Choma Platter': 'Inyama Zokeje Zidasanzwe',
    'Rwandan Bourbon Vanilla Gelato': 'Barafuto ya Vanila yo mu Rwanda',
    'Kigali Sunset Passion Mocktail': 'Icyo Kunywa cy’Imbuto za Pasiteri',
    // Amenities
    'Olympic Swimming Pool': 'Pisine Nini Mpuzamahanga',
    'Private Balcony': 'Balko Yihariye',
    'High-Speed WiFi': 'Interineti Yihuta Cyane (WiFi)',
    'Espresso Machine': 'Imashini ya Kawa ya Espresso',
    'Lake View Terrace': 'Iterasi Ireba Ikiyaga',
    'Fine Dining Restaurant': 'Resitora y’Inyenyeri 5',
    'Cocktail Bar': 'Akabari k’Ibyo Kunywa',
    'Spa & Wellness': 'Ubuzima & Sipaa',
    'Volcano View': 'Kureba Ibirunga',
    'Private Fireplace': 'Iziko Ryiteguye',
    'Gorilla Trek Briefing': 'Guhabwa Amakuru ku Ngagi',
    'Rooftop Bar': 'Akabari ko ku Gisenge',
    'Panoramic City View': 'Kureba Umujyi Wose',
    'Craft Cocktails': 'Kuvanga Inzoga Byihariye',
    'Live Music & DJs': 'Umuziki w’Akarusho na Ba DJ',
    'Conference Ballroom': 'Icyumba Cyagutse cy’Inama',
    'Business Center': 'Ibiro by’Ubucuruzi',
    'Executive Club Lounge': 'Uburuhukiro bw’Abanyacyubahiro',
    // Suites & Rooms
    'Executive Lake View Suite': 'Icyumba cy’Abakuru Kireba Ikiyaga',
    'King bed, panoramic balcony, rain shower, and espresso bar.': 'Uburiri bunini, balko ireba kure, ishawa igezweho, na kawa ya espresso.',
    'Deluxe Garden Room': 'Icyumba cy’Akarusho Giteganye n’Ubusitani',
    'Queen bed, organic garden view, workspace, high-speed WiFi.': 'Uburiri bwa Queen, kureba ubusitani, ameza yo gukoreraho, interineti yihuta.',
    // Menu Items & Descriptions
    'Grilled Beef Fillet Mignon': 'Inyama Zokeje za Filet Mignon',
    'Charcoal-grilled tenderloin with garlic crushed potatoes and green pepper sauce.': 'Inyama yoroshye yokejwe ku makara hamwe n’ibirayi byasizwe tungurusumu na sosi ya puwavuron.',
    'Gisenyi Lake Tilapia & Fries': 'Ifi ya Tilapiya yo ku Gisenyi n’Ifiriti',
    'Whole crispy spiced tilapia served with fresh lemon herb dip and golden hand-cut fries.': 'Ifi yose ikaranze irimo ibirungo iteguranywe indimu n’amashaza n’ifiriti nziza cyane.',
    'Artisan Gourmet Cheeseburger': 'Burugeri y’Inyama n’Iforomaji ya Gishwati',
    'Aged beef patty, melted Gishwati gouda, caramelized onions, brioche bun, and rosemary fries.': 'Inyama y’inka nziza, iforomaji yashonze ya Gishwati, ibitunguru biteguye neza n’ifiriti ya rozemari.',
    'Virunga Signature Mojito': 'Moyito y’Akarusho ya Virunga',
    'White rum muddled with fresh garden mint, organic lime wedges, pure cane sugar, and club soda.': 'Rumu yera ivanze n’amababi y’intoki, indimu y’umwimerere, isukari y’igisheke na soda.',
    'Maracuja Passion Fruit Cooler': 'Icyo Kunywa cy’Imbuto za Marakuja',
    'Fresh Rwandan yellow passion fruit pressed with crushed ice, mint leaves, and effervescent soda.': 'Imbuto za marakuja z’umuhondo zo mu Rwanda zikandishijwe barafu, amababi ya mint na soda.',
    'Dark Chocolate Lava Cake': 'Keke y’Umutobe wa Chokora y’Umukara',
    'Warm molten chocolate fondant infused with Rwandan bourbon vanilla bean, vanilla bean gelato.': 'Chokora ishyushye ivanze na vanila y’umwimerere yo mu Rwanda hamwe na gelato nziza.',
  },
  fr: {
    'Chic culinary sanctuary in leafy Kiyovu blending Rwandan organic produce with French culinary finesse, artisan cocktails, and acoustic jazz evenings.':
      "Sanctuaire culinaire chic dans le quartier verdoyant de Kiyovu mariant produits biologiques rwandais, finesse culinaire française, cocktails artisanaux et soirées jazz acoustiques.",
    'Historic luxury hotel set amid tropical gardens offering fine international dining, Olympic swimming pool, executive suites, and poolside cocktail lounge.':
      "Hôtel de luxe historique niché dans des jardins tropicaux proposant une gastronomie internationale raffinée, piscine olympique, suites exécutives et bar lounge au bord de l'eau.",
    'Lakeside beach resort boasting private sandy shores, Lake Kivu sunset dining, fresh grilled tilapia & sambaza, water sports, and mountain views.':
      "Complexe hôtelier au bord du lac Kivu avec plages de sable privées, dîners au coucher du soleil, tilapia et sambaza grillés frais, sports nautiques et vues imprenables sur les montagnes.",
    'Intimate eco-luxury boutique lodge in the foothills of Volcanoes National Park featuring farm-to-table volcanic soil dining, fireplace lounges, and gorilla trek briefings.':
      "Éco-lodge intimiste de luxe au pied du parc national des Volcans, proposant une cuisine du terroir volcanique, des salons avec cheminée et des briefings pour les treks des gorilles.",
    'Vibrant rooftop lounge overlooking Kigali skyline with artisanal botanical cocktails, craft beers, Nyama Choma tapas, and weekly afro-house DJ sessions.':
      "Lounge vibrant sur le toit surplombant la skyline de Kigali, proposant cocktails botaniques artisanaux, bières locales, tapas Nyama Choma et sessions DJ afro-house hebdomadaires.",
    'Sophisticated 5-star international hotel in downtown Kigali featuring multiple world-class restaurants, ballroom venues, luxury spa, and executive club floor.':
      "Hôtel international 5 étoiles sophistiqué au centre-ville de Kigali comprenant plusieurs restaurants renommés, salons de réception, spa de luxe et étage exécutif.",
    'Acoustic Jazz Evenings': 'Soirées Jazz Acoustique',
    'Lake Kivu Beachfront': 'Plage Privée du Lac Kivu',
    'Forest Hearth Lounge': 'Salon avec Foyer Forestier',
    'Infinity Skyline Pool': 'Piscine Panoramique à Débordement',
    'Rooftop Sunset Lounge': 'Lounge sur le Toit au Coucher du Soleil',
    'Grilled Lake Kivu Tilapia': 'Tilapia Grillé du Lac Kivu',
    'Volcanoes Organic Brochette': 'Brochette Bio des Volcans',
    'Smoked Nyama Choma Platter': 'Plateau de Nyama Choma Fumée',
    'Rwandan Bourbon Vanilla Gelato': 'Glace Vanille Bourbon du Rwanda',
    'Kigali Sunset Passion Mocktail': 'Mocktail Passion Coucher de Soleil de Kigali',
    // Amenities
    'Olympic Swimming Pool': 'Piscine Olympique',
    'Private Balcony': 'Balcon Privatif',
    'High-Speed WiFi': 'Wi-Fi Haut Débit',
    'Espresso Machine': 'Machine à Café Espresso',
    'Lake View Terrace': 'Terrasse Vue sur le Lac',
    'Fine Dining Restaurant': 'Restaurant Gastronomique',
    'Cocktail Bar': 'Bar à Cocktails',
    'Spa & Wellness': 'Spa & Espace Bien-Être',
    'Volcano View': 'Vue sur les Volcans',
    'Private Fireplace': 'Cheminée Privative',
    'Gorilla Trek Briefing': 'Briefing Safari Gorilles',
    'Rooftop Bar': 'Bar Panoramique sur le Toit',
    'Panoramic City View': 'Vue Panoramique sur la Ville',
    'Craft Cocktails': 'Cocktails Créatifs & Botaniques',
    'Live Music & DJs': 'Concerts Live & DJs',
    'Conference Ballroom': 'Grande Salle de Réception',
    'Business Center': 'Centre d’Affaires',
    'Executive Club Lounge': 'Salon Exécutif Privé',
    // Suites & Rooms
    'Executive Lake View Suite': 'Suite Exécutive avec Vue sur le Lac',
    'King bed, panoramic balcony, rain shower, and espresso bar.': 'Lit King-size, balcon panoramique, douche à l’italienne et bar à espresso.',
    'Deluxe Garden Room': 'Chambre Deluxe Côté Jardin',
    'Queen bed, organic garden view, workspace, high-speed WiFi.': 'Lit Queen-size, vue sur le jardin biologique, espace de travail, Wi-Fi haut débit.',
    // Menu Items & Descriptions
    'Grilled Beef Fillet Mignon': 'Filet Mignon de Bœuf Grillé',
    'Charcoal-grilled tenderloin with garlic crushed potatoes and green pepper sauce.': 'Filet tendre grillé au feu de bois avec écrasé de pommes de terre à l’ail et sauce au poivre vert.',
    'Gisenyi Lake Tilapia & Fries': 'Tilapia du Lac de Gisenyi & Frites Maison',
    'Whole crispy spiced tilapia served with fresh lemon herb dip and golden hand-cut fries.': 'Tilapia entier croustillant épicé servi avec émulsion d’herbes au citron et frites dorées coupées main.',
    'Artisan Gourmet Cheeseburger': 'Cheeseburger Gourmet Artisanal',
    'Aged beef patty, melted Gishwati gouda, caramelized onions, brioche bun, and rosemary fries.': 'Steak de bœuf affiné, gouda fondu de Gishwati, oignons caramélisés, pain brioché et frites au romarin.',
    'Virunga Signature Mojito': 'Mojito Signature des Virunga',
    'White rum muddled with fresh garden mint, organic lime wedges, pure cane sugar, and club soda.': 'Rhum blanc pilé à la menthe fraîche du jardin, quartiers de citron vert bio, sucre de canne pur et eau gazeuse.',
    'Maracuja Passion Fruit Cooler': 'Rafraîchissement Passion Maracuja',
    'Fresh Rwandan yellow passion fruit pressed with crushed ice, mint leaves, and effervescent soda.': 'Fruits de la passion jaunes rwandais pressés avec glace pilée, feuilles de menthe et eau pétillante.',
    'Dark Chocolate Lava Cake': 'Moelleux Coulant au Chocolat Noir',
    'Warm molten chocolate fondant infused with Rwandan bourbon vanilla bean, vanilla bean gelato.': 'Fondant tiède au chocolat coulant infusé à la vanille Bourbon du Rwanda, glace artisanale à la vanille.',
  },
  sw: {
    'Chic culinary sanctuary in leafy Kiyovu blending Rwandan organic produce with French culinary finesse, artisan cocktails, and acoustic jazz evenings.':
      "Hifadhi ya kisasa ya upishi katika eneo lenye miti la Kiyovu inayochanganya mazao ya asili ya Rwanda na ufundi wa Kifaransa, visa maalum, na muziki wa jazi jioni.",
    'Historic luxury hotel set amid tropical gardens offering fine international dining, Olympic swimming pool, executive suites, and poolside cocktail lounge.':
      "Hoteli ya kifahari ya kihistoria katikati ya bustani za kitropiki inayotoa mlo bora wa kimataifa, bwawa la kuogelea la Olimpiki, vyumba vya hadhi ya juu, na baa ya pembeni mwa bwawa.",
    'Lakeside beach resort boasting private sandy shores, Lake Kivu sunset dining, fresh grilled tilapia & sambaza, water sports, and mountain views.':
      "Hoteli ya kando ya Ziwa Kivu yenye fuo za kibinafsi za mchanga, mikahawa ya machweo, samaki aina ya Sato na Sambaza safi za kuchomwa, michezo ya majini, na mandhari ya milima.",
    'Intimate eco-luxury boutique lodge in the foothills of Volcanoes National Park featuring farm-to-table volcanic soil dining, fireplace lounges, and gorilla trek briefings.':
      "Lodge ya kipekee ya mazingira kwenye mteremko wa Hifadhi ya Kitaifa ya Volkano yenye vyakula vya asili vya udongo wa volkano, sebule za moto, na maandalizi ya kutazama sokwe.",
    'Vibrant rooftop lounge overlooking Kigali skyline with artisanal botanical cocktails, craft beers, Nyama Choma tapas, and weekly afro-house DJ sessions.':
      "Sebule ya kusisimua ya ghorofani inayotazama anga ya Kigali yenye visa asili vya mimea, bia za kienyeji, Nyama Choma, na maonyesho ya kila wiki ya ma-DJ wa afro-house.",
    'Sophisticated 5-star international hotel in downtown Kigali featuring multiple world-class restaurants, ballroom venues, luxury spa, and executive club floor.':
      "Hoteli ya kisasa ya nyota 5 katikati mwa jiji la Kigali yenye migahawa ya kiwango cha juu cha kimataifa, kumbi za mikutano, spa ya anasa, na ghorofa ya kipekee ya watendaji.",
    'Acoustic Jazz Evenings': 'Jioni za Muziki wa Jazz',
    'Lake Kivu Beachfront': 'Pwani ya Ziwa Kivu',
    'Forest Hearth Lounge': 'Sebule ya Moto wa Msituni',
    'Infinity Skyline Pool': 'Bwawa la Panoramu la Angani',
    'Rooftop Sunset Lounge': 'Sebule ya Ghorofani ya Machweo',
    'Grilled Lake Kivu Tilapia': 'Sato wa Kuchoma wa Ziwa Kivu',
    'Volcanoes Organic Brochette': 'Mshikaki wa Asili wa Volkano',
    'Smoked Nyama Choma Platter': 'Sahani ya Nyama Choma ya Kukaanga',
    'Rwandan Bourbon Vanilla Gelato': 'Barafu ya Vanila ya Rwanda',
    'Kigali Sunset Passion Mocktail': 'Kinywaji cha Pasheni cha Machweo ya Kigali',
    // Amenities
    'Olympic Swimming Pool': 'Bwawa la Kuogelea la Olimpiki',
    'Private Balcony': 'Varanda ya Kibinafsi',
    'High-Speed WiFi': 'WiFi ya Kasi ya Juu',
    'Espresso Machine': 'Mashine ya Kahawa ya Espresso',
    'Lake View Terrace': 'Ukumbi Unaotazama Ziwa',
    'Fine Dining Restaurant': 'Mkahawa wa Hadhi ya Juu',
    'Cocktail Bar': 'Baa ya Vinywaji Maalum',
    'Spa & Wellness': 'Spa na Ustawi wa Afya',
    'Volcano View': 'Mandhari ya Volkano',
    'Private Fireplace': 'Makaa ya Moto ya Kibinafsi',
    'Gorilla Trek Briefing': 'Maelezo ya Kutembelewa kwa Sokwe',
    'Rooftop Bar': 'Baa ya Ghorofani',
    'Panoramic City View': 'Mandhari ya Jiji Lote',
    'Craft Cocktails': 'Vinywaji vya Asili Vilivyochanganywa',
    'Live Music & DJs': 'Muziki wa Moja kwa Moja na Ma-DJ',
    'Conference Ballroom': 'Ukumbi Mkubwa wa Mikutano',
    'Business Center': 'Kituo cha Biashara',
    'Executive Club Lounge': 'Sebule ya Kipekee ya Watendaji',
    // Suites & Rooms
    'Executive Lake View Suite': 'Chumba cha Kifahari cha Mtazamo wa Ziwa',
    'King bed, panoramic balcony, rain shower, and espresso bar.': 'Kitanda kikubwa cha King, varanda ya panoramiki, bafu ya kisasa na kahawa ya espresso.',
    'Deluxe Garden Room': 'Chumba cha Kifahari cha Bustani',
    'Queen bed, organic garden view, workspace, high-speed WiFi.': 'Kitanda cha Queen, mtazamo wa bustani asili, meza ya kazi na WiFi ya kasi.',
    // Menu Items & Descriptions
    'Grilled Beef Fillet Mignon': 'Mnofu wa Ng’ombe wa Kuchoma (Fillet Mignon)',
    'Charcoal-grilled tenderloin with garlic crushed potatoes and green pepper sauce.': 'Mnofu laini wa kuchomwa na viazi vilivyopondwa na kitunguu saumu pamoja na mchuzi wa pilipili hoho.',
    'Gisenyi Lake Tilapia & Fries': 'Sato wa Ziwa Gisenyi na Viazi vya Kukaanga',
    'Whole crispy spiced tilapia served with fresh lemon herb dip and golden hand-cut fries.': 'Samaki mzima wa Sato aliyekaangwa na viungo akitolewa na mchuzi wa ndimu na viazi safi vya kukaangwa.',
    'Artisan Gourmet Cheeseburger': 'Baga Maalum ya Nyama na Jibini ya Gishwati',
    'Aged beef patty, melted Gishwati gouda, caramelized onions, brioche bun, and rosemary fries.': 'Nyama nzuri ya ng’ombe, jibini iliyoyeyuka ya Gishwati, vitunguu tamu, mkate wa briocha na viazi vya rozmari.',
    'Virunga Signature Mojito': 'Kinywaji Maalum cha Mojito cha Virunga',
    'White rum muddled with fresh garden mint, organic lime wedges, pure cane sugar, and club soda.': 'Ramu nyeupe iliyochanganywa na mnanaa safi wa bustani, ndimu asili, sukari ya miwa na soda.',
    'Maracuja Passion Fruit Cooler': 'Kiburudisho cha Pasheni ya Marakuja',
    'Fresh Rwandan yellow passion fruit pressed with crushed ice, mint leaves, and effervescent soda.': 'Pasheni ya manjano ya Rwanda iliyokamuliwa na barafu, majani ya mnanaa na soda inayotoa povu.',
    'Dark Chocolate Lava Cake': 'Keki ya Chokoleti Nyeusi Inayomwagika',
    'Warm molten chocolate fondant infused with Rwandan bourbon vanilla bean, vanilla bean gelato.': 'Chokoleti tamu ya joto iliyotiwa vanila asili ya Rwanda pamoja na aiskrimu bora ya vanila.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('sangira_preferred_lang') as SupportedLanguage;
    return saved && ['en', 'rw', 'fr', 'sw'].includes(saved) ? saved : 'en';
  });

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('sangira_preferred_lang', lang);
    } catch {
      // Ignore in restricted environments
    }
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    const langDict = DICTIONARY[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const defaultDict = DICTIONARY.en;
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  }, [language]);

  const translateDescription = useCallback((text?: string): string => {
    if (!text || language === 'en') return text || '';
    const mapping = DESCRIPTION_TRANSLATIONS[language];
    if (mapping && mapping[text]) {
      return mapping[text];
    }
    return text;
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    translateDescription,
  }), [language, setLanguage, t, translateDescription]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
