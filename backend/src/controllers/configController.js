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
  about: {
    title: "About Us",
    subtitle: "Palawan Wildlife Rescue & Conservation Center",
    description: "Founded in 2015, the Palawan Wildlife Rescue & Conservation Center is a non-profit organization dedicated to the rescue, rehabilitation, and release of wildlife across Palawan island. We work closely with local communities, government agencies, and international partners to protect the region's unique biodiversity.\n\nOur team of veterinarians, biologists, and trained volunteers responds to emergencies ranging from injured marine turtles and stranded dugongs to displaced civets and orphaned hornbills. Every year, we rehabilitate and release hundreds of animals back into their natural habitats.\n\nBeyond rescue work, we run community education programs, coastal clean-up drives, and habitat restoration projects aimed at reducing human-wildlife conflict and promoting sustainable coexistence.",
    mission: "To protect and preserve Palawan's wildlife through emergency rescue, professional rehabilitation, and community-centered conservation.",
    vision: "A Palawan where wildlife and communities thrive together in harmony.",
  },
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
  wildlifeGuide: [
    { name: 'Philippine Eagle', scientificName: 'Pithecophaga jefferyi', status: 'Critically Endangered', activeStatus: 'Day', habitat: 'Forest canopies', note: 'Report sightings immediately — do not approach.', images: [], hazard: '' },
    { name: 'Palawan Bearcat', scientificName: 'Arctictis binturong', status: 'Vulnerable', activeStatus: 'Night', habitat: 'Lowland forests', note: 'Nocturnal and shy. If found during daytime, it may be sick.', images: [], hazard: '' },
    { name: 'Hawksbill Turtle', scientificName: 'Eretmochelys imbricata', status: 'Critically Endangered', activeStatus: 'Both (Day & Night)', habitat: 'Coral reefs', note: 'If stranded, keep wet and contact rescue immediately.', images: [], hazard: '' },
    { name: 'Palawan Peacock-Pheasant', scientificName: 'Polyplectron napoleonis', status: 'Vulnerable', activeStatus: 'Day', habitat: 'Primary forests', note: 'Observe from a distance. Do not disturb nesting areas.', images: [], hazard: '' },
    { name: 'Dugong', scientificName: 'Dugong dugon', status: 'Vulnerable', activeStatus: 'Both (Day & Night)', habitat: 'Seagrass beds', note: 'Report any net entanglements to the coast guard.', images: [], hazard: '' },
    { name: 'Philippine Cockatoo', scientificName: 'Cacatua haematuropygia', status: 'Critically Endangered', activeStatus: 'Day', habitat: 'Mangroves & forests', note: 'Do not feed or attempt to keep as a pet.', images: [], hazard: '' },
  ],
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
    about: { ...LANDING_DEFAULTS.about, ...(stored.about || {}) },
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
    wildlifeGuide: (stored.wildlifeGuide || LANDING_DEFAULTS.wildlifeGuide).map((s) => ({
      ...s,
      images: s.images || (s.image ? [s.image] : []),
    })),
  };

  const otpEnabled = await convexClient.query(anyApi.config.getConfigValue, { key: "otpEnabled" });

  res.json({ config: merged, defaults: LANDING_DEFAULTS, maintenanceMode: maintenanceMode === "true", maintenanceEndTime, otpEnabled: otpEnabled !== "false" });
};

const ALLOWED_SECTION_KEYS = new Set([
  "about", "hero", "contact", "faq", "carousel",
  "location", "newsEvents", "howItWorks", "successStories", "gallery",
  "volunteer", "partners", "wildlifeGuide",
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
