// Demo shop catalogue.
//
// WHAT THIS IS, SO NOBODY EVER MISTAKES IT FOR SOMETHING ELSE.
//
// These rows are illustrative. The prices, data allowances, validity periods,
// network labels and supplier names are placeholders carried over from the
// design prototype, kept on purpose so the shop can be walked end to end and
// purchase intent can actually be measured before a supplier exists. Livdar has
// no commercial relationship with any of the suppliers named here, and nothing
// on this list is a confirmed offer.
//
// Three rules protect that distinction, and all three are enforced in code
// rather than remembered:
//
//   1. Every surface that renders these rows also renders DEMO_NOTICE. The
//      badge is part of the card component, not an optional prop, so a card
//      cannot be shown without it.
//   2. None of this data ever reaches structured data. There is no Product and
//      no Offer schema anywhere in the site, because publishing a price to
//      Google is telling Google the price is real. The quality gate fails the
//      build if an Offer or a Product appears.
//   3. The funnel ends at notify_signup. checkoutEnabled() is false while the
//      provider is the stub, so there is no payment step to reach.
//
// When a real supplier is connected, this file is deleted and the same
// components read the provider layer instead. The shape below is deliberately
// the shape a real plan will have.

// Suppliers named in the demo rows. Listed here so the filter UI has a stable
// order, and so the "not a partner" wording has one place to live.
export const DEMO_SUPPLIERS = [
  { key: 'holafly', name: 'Holafly', c1: '#14a86b', c2: '#5fe0a7' },
  { key: 'maya', name: 'Maya', c1: '#7a4dff', c2: '#a98bff' },
  { key: 'airalo', name: 'Airalo', c1: '#ff5a63', c2: '#ff8b90' },
  { key: 'saily', name: 'Saily', c1: '#f5c542', c2: '#ffe08a' },
  { key: 'nomad', name: 'Nomad', c1: '#161616', c2: '#555555' },
];

export const DEMO = true;

export const DEMO_PLANS = [
  { id: "japan", name: "Japan", flag: "🇯🇵", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "3 GB", days: "7 days", network: "5G", price: "€7.90" },
  { id: "turkey", name: "Turkey", flag: "🇹🇷", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "5 GB", days: "15 days", network: "4G/5G", price: "€8.90" },
  { id: "united-states", name: "United States", flag: "🇺🇸", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "10 GB", days: "30 days", network: "4G", price: "€9.90" },
  { id: "thailand", name: "Thailand", flag: "🇹🇭", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "15 GB", days: "7 days", network: "5G", price: "€11.70" },
  { id: "united-arab-emirates", name: "United Arab Emirates", flag: "🇦🇪", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "20 GB", days: "15 days", network: "4G/5G", price: "€12.90" },
  { id: "indonesia", name: "Indonesia", flag: "🇮🇩", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "Unlimited", days: "30 days", network: "4G", price: "€17.80" },
  { id: "switzerland", name: "Switzerland", flag: "🇨🇭", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "3 GB", days: "7 days", network: "5G", price: "€18.90" },
  { id: "united-kingdom", name: "United Kingdom", flag: "🇬🇧", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "5 GB", days: "15 days", network: "4G/5G", price: "€19.40" },
  { id: "spain", name: "Spain", flag: "🇪🇸", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "10 GB", days: "30 days", network: "4G", price: "€21.50" },
  { id: "italy", name: "Italy", flag: "🇮🇹", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "15 GB", days: "7 days", network: "5G", price: "€22.90" },
  { id: "france", name: "France", flag: "🇫🇷", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "20 GB", days: "15 days", network: "4G/5G", price: "€29.90" },
  { id: "canada", name: "Canada", flag: "🇨🇦", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "Unlimited", days: "30 days", network: "4G", price: "€33.90" },
  { id: "germany", name: "Germany", flag: "🇩🇪", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "3 GB", days: "7 days", network: "5G", price: "€7.90" },
  { id: "romania", name: "Romania", flag: "🇷🇴", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "5 GB", days: "15 days", network: "4G/5G", price: "€8.90" },
  { id: "greece", name: "Greece", flag: "🇬🇷", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "10 GB", days: "30 days", network: "4G", price: "€9.90" },
  { id: "portugal", name: "Portugal", flag: "🇵🇹", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "15 GB", days: "7 days", network: "5G", price: "€11.70" },
  { id: "netherlands", name: "Netherlands", flag: "🇳🇱", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "20 GB", days: "15 days", network: "4G/5G", price: "€12.90" },
  { id: "belgium", name: "Belgium", flag: "🇧🇪", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "Unlimited", days: "30 days", network: "4G", price: "€17.80" },
  { id: "austria", name: "Austria", flag: "🇦🇹", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "3 GB", days: "7 days", network: "5G", price: "€18.90" },
  { id: "poland", name: "Poland", flag: "🇵🇱", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "5 GB", days: "15 days", network: "4G/5G", price: "€19.40" },
  { id: "czechia", name: "Czechia", flag: "🇨🇿", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "10 GB", days: "30 days", network: "4G", price: "€21.50" },
  { id: "hungary", name: "Hungary", flag: "🇭🇺", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "15 GB", days: "7 days", network: "5G", price: "€22.90" },
  { id: "croatia", name: "Croatia", flag: "🇭🇷", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "20 GB", days: "15 days", network: "4G/5G", price: "€29.90" },
  { id: "slovenia", name: "Slovenia", flag: "🇸🇮", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "Unlimited", days: "30 days", network: "4G", price: "€33.90" },
  { id: "slovakia", name: "Slovakia", flag: "🇸🇰", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "3 GB", days: "7 days", network: "5G", price: "€7.90" },
  { id: "bulgaria", name: "Bulgaria", flag: "🇧🇬", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "5 GB", days: "15 days", network: "4G/5G", price: "€8.90" },
  { id: "serbia", name: "Serbia", flag: "🇷🇸", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "10 GB", days: "30 days", network: "4G", price: "€9.90" },
  { id: "albania", name: "Albania", flag: "🇦🇱", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "15 GB", days: "7 days", network: "5G", price: "€11.70" },
  { id: "montenegro", name: "Montenegro", flag: "🇲🇪", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "20 GB", days: "15 days", network: "4G/5G", price: "€12.90" },
  { id: "bosnia-and-herzegovina", name: "Bosnia and Herzegovina", flag: "🇧🇦", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "Unlimited", days: "30 days", network: "4G", price: "€17.80" },
  { id: "north-macedonia", name: "North Macedonia", flag: "🇲🇰", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "3 GB", days: "7 days", network: "5G", price: "€18.90" },
  { id: "ireland", name: "Ireland", flag: "🇮🇪", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "5 GB", days: "15 days", network: "4G/5G", price: "€19.40" },
  { id: "iceland", name: "Iceland", flag: "🇮🇸", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "10 GB", days: "30 days", network: "4G", price: "€21.50" },
  { id: "norway", name: "Norway", flag: "🇳🇴", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "15 GB", days: "7 days", network: "5G", price: "€22.90" },
  { id: "sweden", name: "Sweden", flag: "🇸🇪", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "20 GB", days: "15 days", network: "4G/5G", price: "€29.90" },
  { id: "finland", name: "Finland", flag: "🇫🇮", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "Unlimited", days: "30 days", network: "4G", price: "€33.90" },
  { id: "denmark", name: "Denmark", flag: "🇩🇰", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "3 GB", days: "7 days", network: "5G", price: "€7.90" },
  { id: "estonia", name: "Estonia", flag: "🇪🇪", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "5 GB", days: "15 days", network: "4G/5G", price: "€8.90" },
  { id: "latvia", name: "Latvia", flag: "🇱🇻", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "10 GB", days: "30 days", network: "4G", price: "€9.90" },
  { id: "lithuania", name: "Lithuania", flag: "🇱🇹", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "15 GB", days: "7 days", network: "5G", price: "€11.70" },
  { id: "luxembourg", name: "Luxembourg", flag: "🇱🇺", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "20 GB", days: "15 days", network: "4G/5G", price: "€12.90" },
  { id: "malta", name: "Malta", flag: "🇲🇹", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "Unlimited", days: "30 days", network: "4G", price: "€17.80" },
  { id: "cyprus", name: "Cyprus", flag: "🇨🇾", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "3 GB", days: "7 days", network: "5G", price: "€18.90" },
  { id: "georgia", name: "Georgia", flag: "🇬🇪", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "5 GB", days: "15 days", network: "4G/5G", price: "€19.40" },
  { id: "armenia", name: "Armenia", flag: "🇦🇲", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "10 GB", days: "30 days", network: "4G", price: "€21.50" },
  { id: "azerbaijan", name: "Azerbaijan", flag: "🇦🇿", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "15 GB", days: "7 days", network: "5G", price: "€22.90" },
  { id: "israel", name: "Israel", flag: "🇮🇱", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "20 GB", days: "15 days", network: "4G/5G", price: "€29.90" },
  { id: "jordan", name: "Jordan", flag: "🇯🇴", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "Unlimited", days: "30 days", network: "4G", price: "€33.90" },
  { id: "qatar", name: "Qatar", flag: "🇶🇦", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "3 GB", days: "7 days", network: "5G", price: "€7.90" },
  { id: "saudi-arabia", name: "Saudi Arabia", flag: "🇸🇦", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "5 GB", days: "15 days", network: "4G/5G", price: "€8.90" },
  { id: "kuwait", name: "Kuwait", flag: "🇰🇼", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "10 GB", days: "30 days", network: "4G", price: "€9.90" },
  { id: "bahrain", name: "Bahrain", flag: "🇧🇭", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "15 GB", days: "7 days", network: "5G", price: "€11.70" },
  { id: "oman", name: "Oman", flag: "🇴🇲", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "20 GB", days: "15 days", network: "4G/5G", price: "€12.90" },
  { id: "egypt", name: "Egypt", flag: "🇪🇬", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "Unlimited", days: "30 days", network: "4G", price: "€17.80" },
  { id: "morocco", name: "Morocco", flag: "🇲🇦", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "3 GB", days: "7 days", network: "5G", price: "€18.90" },
  { id: "tunisia", name: "Tunisia", flag: "🇹🇳", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "5 GB", days: "15 days", network: "4G/5G", price: "€19.40" },
  { id: "south-africa", name: "South Africa", flag: "🇿🇦", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "10 GB", days: "30 days", network: "4G", price: "€21.50" },
  { id: "kenya", name: "Kenya", flag: "🇰🇪", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "15 GB", days: "7 days", network: "5G", price: "€22.90" },
  { id: "tanzania", name: "Tanzania", flag: "🇹🇿", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "20 GB", days: "15 days", network: "4G/5G", price: "€29.90" },
  { id: "uganda", name: "Uganda", flag: "🇺🇬", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "Unlimited", days: "30 days", network: "4G", price: "€33.90" },
  { id: "ghana", name: "Ghana", flag: "🇬🇭", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "3 GB", days: "7 days", network: "5G", price: "€7.90" },
  { id: "nigeria", name: "Nigeria", flag: "🇳🇬", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "5 GB", days: "15 days", network: "4G/5G", price: "€8.90" },
  { id: "senegal", name: "Senegal", flag: "🇸🇳", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "10 GB", days: "30 days", network: "4G", price: "€9.90" },
  { id: "mauritius", name: "Mauritius", flag: "🇲🇺", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "15 GB", days: "7 days", network: "5G", price: "€11.70" },
  { id: "seychelles", name: "Seychelles", flag: "🇸🇨", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "20 GB", days: "15 days", network: "4G/5G", price: "€12.90" },
  { id: "australia", name: "Australia", flag: "🇦🇺", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "Unlimited", days: "30 days", network: "4G", price: "€17.80" },
  { id: "new-zealand", name: "New Zealand", flag: "🇳🇿", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "3 GB", days: "7 days", network: "5G", price: "€18.90" },
  { id: "singapore", name: "Singapore", flag: "🇸🇬", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "5 GB", days: "15 days", network: "4G/5G", price: "€19.40" },
  { id: "malaysia", name: "Malaysia", flag: "🇲🇾", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "10 GB", days: "30 days", network: "4G", price: "€21.50" },
  { id: "vietnam", name: "Vietnam", flag: "🇻🇳", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "15 GB", days: "7 days", network: "5G", price: "€22.90" },
  { id: "philippines", name: "Philippines", flag: "🇵🇭", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "20 GB", days: "15 days", network: "4G/5G", price: "€29.90" },
  { id: "south-korea", name: "South Korea", flag: "🇰🇷", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "Unlimited", days: "30 days", network: "4G", price: "€33.90" },
  { id: "china", name: "China", flag: "🇨🇳", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "3 GB", days: "7 days", network: "5G", price: "€7.90" },
  { id: "hong-kong", name: "Hong Kong", flag: "🇭🇰", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "5 GB", days: "15 days", network: "4G/5G", price: "€8.90" },
  { id: "taiwan", name: "Taiwan", flag: "🇹🇼", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "10 GB", days: "30 days", network: "4G", price: "€9.90" },
  { id: "india", name: "India", flag: "🇮🇳", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "15 GB", days: "7 days", network: "5G", price: "€11.70" },
  { id: "sri-lanka", name: "Sri Lanka", flag: "🇱🇰", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "20 GB", days: "15 days", network: "4G/5G", price: "€12.90" },
  { id: "nepal", name: "Nepal", flag: "🇳🇵", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "Unlimited", days: "30 days", network: "4G", price: "€17.80" },
  { id: "cambodia", name: "Cambodia", flag: "🇰🇭", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "3 GB", days: "7 days", network: "5G", price: "€18.90" },
  { id: "laos", name: "Laos", flag: "🇱🇦", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "5 GB", days: "15 days", network: "4G/5G", price: "€19.40" },
  { id: "myanmar", name: "Myanmar", flag: "🇲🇲", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "10 GB", days: "30 days", network: "4G", price: "€21.50" },
  { id: "maldives", name: "Maldives", flag: "🇲🇻", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "15 GB", days: "7 days", network: "5G", price: "€22.90" },
  { id: "mexico", name: "Mexico", flag: "🇲🇽", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "20 GB", days: "15 days", network: "4G/5G", price: "€29.90" },
  { id: "brazil", name: "Brazil", flag: "🇧🇷", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "Unlimited", days: "30 days", network: "4G", price: "€33.90" },
  { id: "argentina", name: "Argentina", flag: "🇦🇷", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "3 GB", days: "7 days", network: "5G", price: "€7.90" },
  { id: "chile", name: "Chile", flag: "🇨🇱", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "5 GB", days: "15 days", network: "4G/5G", price: "€8.90" },
  { id: "peru", name: "Peru", flag: "🇵🇪", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "10 GB", days: "30 days", network: "4G", price: "€9.90" },
  { id: "colombia", name: "Colombia", flag: "🇨🇴", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "15 GB", days: "7 days", network: "5G", price: "€11.70" },
  { id: "ecuador", name: "Ecuador", flag: "🇪🇨", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "20 GB", days: "15 days", network: "4G/5G", price: "€12.90" },
  { id: "bolivia", name: "Bolivia", flag: "🇧🇴", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "Unlimited", days: "30 days", network: "4G", price: "€17.80" },
  { id: "uruguay", name: "Uruguay", flag: "🇺🇾", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "3 GB", days: "7 days", network: "5G", price: "€18.90" },
  { id: "paraguay", name: "Paraguay", flag: "🇵🇾", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "5 GB", days: "15 days", network: "4G/5G", price: "€19.40" },
  { id: "costa-rica", name: "Costa Rica", flag: "🇨🇷", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "10 GB", days: "30 days", network: "4G", price: "€21.50" },
  { id: "panama", name: "Panama", flag: "🇵🇦", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "15 GB", days: "7 days", network: "5G", price: "€22.90" },
  { id: "guatemala", name: "Guatemala", flag: "🇬🇹", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "20 GB", days: "15 days", network: "4G/5G", price: "€29.90" },
  { id: "dominican-republic", name: "Dominican Republic", flag: "🇩🇴", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "Unlimited", days: "30 days", network: "4G", price: "€33.90" },
  { id: "puerto-rico", name: "Puerto Rico", flag: "🇵🇷", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "3 GB", days: "7 days", network: "5G", price: "€7.90" },
  { id: "jamaica", name: "Jamaica", flag: "🇯🇲", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "5 GB", days: "15 days", network: "4G/5G", price: "€8.90" },
  { id: "bahamas", name: "Bahamas", flag: "🇧🇸", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "10 GB", days: "30 days", network: "4G", price: "€9.90" },
  { id: "barbados", name: "Barbados", flag: "🇧🇧", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "15 GB", days: "7 days", network: "5G", price: "€11.70" },
  { id: "aruba", name: "Aruba", flag: "🇦🇼", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "20 GB", days: "15 days", network: "4G/5G", price: "€12.90" },
  { id: "cura-ao", name: "Curaçao", flag: "🇨🇼", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "Unlimited", days: "30 days", network: "4G", price: "€17.80" },
  { id: "bermuda", name: "Bermuda", flag: "🇧🇲", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "3 GB", days: "7 days", network: "5G", price: "€18.90" },
  { id: "belize", name: "Belize", flag: "🇧🇿", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "5 GB", days: "15 days", network: "4G/5G", price: "€19.40" },
  { id: "el-salvador", name: "El Salvador", flag: "🇸🇻", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "10 GB", days: "30 days", network: "4G", price: "€21.50" },
  { id: "honduras", name: "Honduras", flag: "🇭🇳", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "15 GB", days: "7 days", network: "5G", price: "€22.90" },
  { id: "nicaragua", name: "Nicaragua", flag: "🇳🇮", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "20 GB", days: "15 days", network: "4G/5G", price: "€29.90" },
  { id: "kazakhstan", name: "Kazakhstan", flag: "🇰🇿", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "Unlimited", days: "30 days", network: "4G", price: "€33.90" },
  { id: "uzbekistan", name: "Uzbekistan", flag: "🇺🇿", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "3 GB", days: "7 days", network: "5G", price: "€7.90" },
  { id: "kyrgyzstan", name: "Kyrgyzstan", flag: "🇰🇬", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "5 GB", days: "15 days", network: "4G/5G", price: "€8.90" },
  { id: "mongolia", name: "Mongolia", flag: "🇲🇳", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "10 GB", days: "30 days", network: "4G", price: "€9.90" },
  { id: "pakistan", name: "Pakistan", flag: "🇵🇰", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "15 GB", days: "7 days", network: "5G", price: "€11.70" },
  { id: "bangladesh", name: "Bangladesh", flag: "🇧🇩", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "20 GB", days: "15 days", network: "4G/5G", price: "€12.90" },
  { id: "macau", name: "Macau", flag: "🇲🇴", supplier: "Holafly", supplierKey: "holafly", c1: "#14a86b", c2: "#5fe0a7", data: "Unlimited", days: "30 days", network: "4G", price: "€17.80" },
  { id: "fiji", name: "Fiji", flag: "🇫🇯", supplier: "Maya", supplierKey: "maya", c1: "#6c3fe8", c2: "#a080ff", data: "3 GB", days: "7 days", network: "5G", price: "€18.90" },
  { id: "french-polynesia", name: "French Polynesia", flag: "🇵🇫", supplier: "Airalo", supplierKey: "airalo", c1: "#ff5a63", c2: "#ff8b90", data: "5 GB", days: "15 days", network: "4G/5G", price: "€19.40" },
  { id: "guam", name: "Guam", flag: "🇬🇺", supplier: "Saily", supplierKey: "saily", c1: "#3158ff", c2: "#6f87ff", data: "10 GB", days: "30 days", network: "4G", price: "€21.50" },
  { id: "new-caledonia", name: "New Caledonia", flag: "🇳🇨", supplier: "Nomad", supplierKey: "nomad", c1: "#161616", c2: "#555", data: "15 GB", days: "7 days", network: "5G", price: "€22.90" },
];

export function demoPlanCount() {
  return DEMO_PLANS.length;
}

// Filters the shop offers. Each one is a pure predicate over a row, so the
// same definitions drive the chips, the counts and any future server rendering
// without the three drifting apart.
export const DEMO_FILTERS = [
  { key: 'all', labelKey: 'popular', test: () => true },
  { key: 'under10', labelKey: 'under10', test: (p) => priceValue(p) < 10 },
  { key: 'tenGb', labelKey: 'tenGb', test: (p) => dataValue(p) >= 10 },
  { key: 'thirtyDays', labelKey: 'thirtyDays', test: (p) => daysValue(p) >= 30 },
  { key: 'unlimited', labelKey: 'unlimited', test: (p) => /unlimited/i.test(p.data) },
  { key: 'fiveG', labelKey: 'fiveG', test: (p) => p.network.includes('5G') },
];

export function priceValue(plan) {
  const n = parseFloat(String(plan.price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : Infinity;
}

export function dataValue(plan) {
  if (/unlimited/i.test(plan.data)) return Infinity;
  const n = parseFloat(String(plan.data).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function daysValue(plan) {
  const n = parseFloat(String(plan.days).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// The badge rotation from the prototype. Derived from the row rather than
// stored, so it cannot drift out of sync when rows are added or removed.
const BADGES = ['bestValue', 'popular', 'largeData', 'travellerPick', 'premium', 'topPick'];

export function badgeKeyFor(plan, index) {
  if (/unlimited/i.test(plan.data)) return 'unlimited';
  if (dataValue(plan) >= 20) return 'largeData';
  if (priceValue(plan) < 9) return 'bestValue';
  return BADGES[index % BADGES.length];
}
