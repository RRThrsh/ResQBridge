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

const LANDING_DEFAULTS = {
  hero: {
    badge: "Palawan Wildlife Rescue & Conservation Center",
    title: "Helping Animals, Protecting Nature",
    description: "Submit reports for wildlife sightings, stray animals, rescue emergencies, and animal welfare concerns across Palawan communities.",
  },
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
  location: {
    title: "Location",
    subtitle: "Visit us at our rescue center in Palawan.",
    center: { lat: 9.799447, lng: 118.693766 },
  },
  howItWorks: { title: "", subtitle: "", steps: [] },
  successStories: { title: "", subtitle: "", stories: [] },
  gallery: { title: "", subtitle: "", images: [] },
  volunteer: { title: "", subtitle: "", roles: [], requirements: [], cta: { label: "", link: "" } },
  partners: { title: "", subtitle: "", partners: [] },
  newsEvents: {
    title: "News & Events",
    subtitle: "Stay updated on rescues, releases, and upcoming community activities.",
    news: [],
    events: [],
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
    contact: { ...LANDING_DEFAULTS.contact, ...(stored.contact || {}) },
    faq: stored.faq || LANDING_DEFAULTS.faq,
    carousel: stored.carousel || LANDING_DEFAULTS.carousel,
    location: { ...LANDING_DEFAULTS.location, ...(stored.location || {}) },
    howItWorks: { ...LANDING_DEFAULTS.howItWorks, ...(stored.howItWorks || {}) },
    successStories: { ...LANDING_DEFAULTS.successStories, ...(stored.successStories || {}) },
    gallery: { ...LANDING_DEFAULTS.gallery, ...(stored.gallery || {}) },
    volunteer: { ...LANDING_DEFAULTS.volunteer, ...(stored.volunteer || {}) },
    partners: { ...LANDING_DEFAULTS.partners, ...(stored.partners || {}) },
    newsEvents: { ...LANDING_DEFAULTS.newsEvents, ...(stored.newsEvents || {}) },
  };

  const otpEnabled = await convexClient.query(anyApi.config.getConfigValue, { key: "otpEnabled" });

  res.json({ config: merged, defaults: LANDING_DEFAULTS, maintenanceMode: maintenanceMode === "true", maintenanceEndTime, otpEnabled: otpEnabled !== "false" });
};

const ALLOWED_SECTION_KEYS = new Set([
  "hero", "contact", "faq", "carousel",
  "location", "newsEvents", "howItWorks", "successStories", "gallery",
  "volunteer", "partners",
]);

const updateLandingConfig = async (req, res) => {
  const payload = {};
  for (const key of Object.keys(req.body)) {
    if (!ALLOWED_SECTION_KEYS.has(key)) continue;
    const val = req.body[key];
    if (val !== null && val !== undefined && typeof val !== "string") {
      payload[key] = val;
    }
  }

  await convexClient.mutation(anyApi.config.upsertConfig, {
    key: "landingContent",
    value: JSON.stringify(payload),
  });

  await logEvent({ req, userId: req.user.uuid, eventType: "landing_update", metadata: { sections: Object.keys(payload).join(", ") } });

  res.json({ message: "Landing page content updated." });
};

module.exports = { getConfig, updateConfig, getLandingConfig, updateLandingConfig, LANDING_DEFAULTS };
