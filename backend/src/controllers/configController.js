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
};

const getLandingConfig = async (_req, res) => {
  const raw = await convexClient.query(anyApi.config.getConfigValue, { key: "landingContent" });
  let stored = {};
  try { stored = raw ? JSON.parse(raw) : {}; } catch { stored = {}; }

  const merged = {
    hero: { ...LANDING_DEFAULTS.hero, ...(stored.hero || {}) },
    stats: stored.stats || LANDING_DEFAULTS.stats,
    contact: { ...LANDING_DEFAULTS.contact, ...(stored.contact || {}) },
    faq: stored.faq || LANDING_DEFAULTS.faq,
  };

  res.json({ config: merged, defaults: LANDING_DEFAULTS });
};

const updateLandingConfig = async (req, res) => {
  const { hero, stats, contact, faq } = req.body;

  const payload = {};
  if (hero) payload.hero = hero;
  if (stats) payload.stats = stats;
  if (contact) payload.contact = contact;
  if (faq) payload.faq = faq;

  await convexClient.mutation(anyApi.config.upsertConfig, {
    key: "landingContent",
    value: JSON.stringify(payload),
  });

  await logEvent({ req, userId: req.user.uuid, eventType: "landing_update", metadata: { sections: Object.keys(payload).join(", ") } });

  res.json({ message: "Landing page content updated." });
};

module.exports = { getConfig, updateConfig, getLandingConfig, updateLandingConfig, LANDING_DEFAULTS };
