const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { logEvent } = require("../middleware/logAudit");

const getConfig = async (_req, res) => {
  const config = await convexClient.query(anyApi.config.getConfig);
  res.json({ config });
};

const updateConfig = async (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined || value === null) {
    return res.status(400).json({ message: "key and value are required." });
  }

  await convexClient.mutation(anyApi.config.upsertConfig, { key, value });

  await logEvent({ req, userId: req.user.uuid, eventType: "config_update", metadata: { key, value: value.slice(0, 200) } });

  res.json({ message: "Config updated.", config: { [key]: value } });
};

const CAROUSEL_COLORS = [
  'from-emerald-600 to-green-800',
  'from-amber-500 to-orange-700',
  'from-teal-600 to-cyan-800',
  'from-blue-600 to-indigo-800',
]

const LANDING_DEFAULTS = {
  hero: {
    badge: "Palawan Wildlife Rescue & Conservation Center",
    title: "Helping Animals, Protecting Nature",
    description: "Submit reports for wildlife sightings, stray animals, rescue emergencies, and animal welfare concerns across Palawan communities.",
  },
  stats: [
    { label: "Rescues", value: "12K+" },
    { label: "Teams", value: "500+" },
    { label: "Countries", value: "30+" },
    { label: "Response Time", value: "<5m" },
  ],
  contact: {
    emergencyHotline: "+63 (48) 123-4567",
    phone: "+63 (48) 434-1234",
    email: "rescue@palawanwildlife.org",
    address: "Irawan, Puerto Princesa City, Palawan 5300, Philippines",
    hours: "Monday – Sunday, 8:00 AM – 5:00 PM",
  },
  faq: [
    { q: "How do I report a wildlife emergency?", a: "Call our 24/7 hotline at +63 (48) 123-4567 or use the Report an Animal button on our homepage." },
    { q: "What should I do if I find an injured animal?", a: "Keep your distance, observe from a safe spot, and call our rescue hotline immediately." },
    { q: "Can I volunteer at the rescue center?", a: "Yes. We welcome volunteers for animal care, clean-up drives, and community education programs." },
    { q: "How are donated funds used?", a: "Donations go directly toward veterinary supplies, animal feed, facility maintenance, and community conservation programs." },
    { q: "Do you accept drop-off donations?", a: "Yes. In-kind donations can be dropped off during operating hours at our Irawan center." },
  ],
  carousel: [
    { title: "Wildlife Rescue", desc: "Responding to injured and stranded animals across Palawan's forests and coastlines.", image: "" },
    { title: "Community Education", desc: "Teaching local communities about wildlife protection and sustainable coexistence.", image: "" },
    { title: "Habitat Conservation", desc: "Preserving critical habitats for Palawan's endemic and endangered species.", image: "" },
    { title: "Marine Protection", desc: "Safeguarding sea turtles, dugongs, and coral reefs through active patrols.", image: "" },
  ],
  communityBoard: {
    title: "Community Board",
    subtitle: "Recent wildlife reports from across Palawan.",
  },
  location: {
    title: "Location",
    subtitle: "Visit us at our rescue center in Palawan.",
    center: { lat: 9.799447, lng: 118.693766 },
  },
  newsEvents: {
    title: "News & Events",
    subtitle: "Stay updated on rescues, releases, and upcoming community activities.",
    news: [
      { date: "Jun 8, 2026", title: "Rescue Center Reaches 12K Milestone", category: "Milestone", desc: "The center has successfully rescued and rehabilitated over 12,000 animals since opening its doors in 2015." },
      { date: "May 22, 2026", title: "New Mangrove Nursery Established", category: "Conservation", desc: "A partnership with local communities has planted 3,000 mangrove seedlings along Puerto Princesa coastline." },
      { date: "Apr 14, 2026", title: "Hawkbill Turtle Release at Tubbataha", category: "Release", desc: "After six months of rehabilitation, a juvenile hawksbill turtle was released back into the protected reef." },
    ],
    events: [
      { date: "Jul 15, 2026", title: "Wildlife First-Responder Training", location: "Rescue Center Auditorium", desc: "A hands-on workshop covering basic wildlife handling, emergency triage, and safe transport techniques." },
      { date: "Aug 5, 2026", title: "Coastal Clean-Up Drive", location: "Sabang Beach", desc: "Join volunteers for a morning of coastal cleanup followed by a short seminar on marine debris impact." },
      { date: "Sep 12, 2026", title: "Community Appreciation Day", location: "Rescue Center Grounds", desc: "Open house with guided tours, wildlife exhibits, kids activities, and a chance to meet the rescue team." },
    ],
  },
};

const getLandingConfig = async (_req, res) => {
  const raw = await convexClient.query(anyApi.config.getConfigValue, { key: "landingContent" });
  let stored = {};
  try { stored = raw ? JSON.parse(raw) : {}; } catch { stored = {}; }

  let maintenanceMode = await convexClient.query(anyApi.config.getConfigValue, { key: "maintenanceMode" });
  const maintenanceEndTime = await convexClient.query(anyApi.config.getConfigValue, { key: "maintenanceEndTime" });

  if (maintenanceMode === "true" && maintenanceEndTime && new Date(maintenanceEndTime) < new Date()) {
    await convexClient.mutation(anyApi.config.upsertConfig, { key: "maintenanceMode", value: "false" });
    maintenanceMode = "false";
  }

  const merged = {
    hero: { ...LANDING_DEFAULTS.hero, ...(stored.hero || {}) },
    stats: stored.stats || LANDING_DEFAULTS.stats,
    contact: { ...LANDING_DEFAULTS.contact, ...(stored.contact || {}) },
    faq: stored.faq || LANDING_DEFAULTS.faq,
    carousel: stored.carousel || LANDING_DEFAULTS.carousel,
    communityBoard: { ...LANDING_DEFAULTS.communityBoard, ...(stored.communityBoard || {}) },
    location: { ...LANDING_DEFAULTS.location, ...(stored.location || {}) },
    newsEvents: { ...LANDING_DEFAULTS.newsEvents, ...(stored.newsEvents || {}) },
  };

  res.json({ config: merged, defaults: LANDING_DEFAULTS, maintenanceMode: maintenanceMode === "true", maintenanceEndTime });
};

const updateLandingConfig = async (req, res) => {
  const { hero, stats, contact, faq, carousel, communityBoard, location, newsEvents } = req.body;

  const payload = {};
  if (hero) payload.hero = hero;
  if (stats) payload.stats = stats;
  if (contact) payload.contact = contact;
  if (faq) payload.faq = faq;
  if (carousel) payload.carousel = carousel;
  if (communityBoard) payload.communityBoard = communityBoard;
  if (location) payload.location = location;
  if (newsEvents) payload.newsEvents = newsEvents;

  await convexClient.mutation(anyApi.config.upsertConfig, {
    key: "landingContent",
    value: JSON.stringify(payload),
  });

  await logEvent({ req, userId: req.user.uuid, eventType: "landing_update", metadata: { sections: Object.keys(payload).join(", ") } });

  res.json({ message: "Landing page content updated." });
};

module.exports = { getConfig, updateConfig, getLandingConfig, updateLandingConfig, LANDING_DEFAULTS, CAROUSEL_COLORS };
