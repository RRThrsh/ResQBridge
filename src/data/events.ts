export interface NewsEvent {
  id: string
  type: 'event' | 'news'
  title: string
  excerpt: string
  body: string
  date: string
  image: string
  category: string
}

export const newsEvents: NewsEvent[] = [
  {
    id: 'ev-001',
    type: 'event',
    title: 'World Environment Day — Palawan Coastal Cleanup',
    excerpt: 'Join us for a massive coastal cleanup drive along Puerto Princesa Bay in celebration of World Environment Day.',
    body: 'The PWRCC invites all Palawan residents and visitors to join our World Environment Day Coastal Cleanup drive on June 5, 2026. We will gather at the Puerto Princesa City Baywalk starting at 6:00 AM. Bring gloves, reusable bags, and sun protection. Breakfast and refreshments will be provided. All participants will receive a certificate of participation.',
    date: '2026-06-05',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=500&fit=crop',
    category: 'Conservation'
  },
  {
    id: 'ev-002',
    type: 'event',
    title: 'Pangolin Awareness Walk — Puerto Princesa City',
    excerpt: 'Walk with us through the streets of Puerto Princesa to raise awareness about the Palawan Pangolin\'s plight.',
    body: 'Every year on the third Saturday of May, the world celebrates World Pangolin Day. Join us for a community awareness walk starting from the PWRCC grounds, through Rizal Avenue, and ending at Baywalk. The walk will feature educational booths, pangolin mascots, and interactive activities for children.',
    date: '2026-05-31',
    image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=500&fit=crop',
    category: 'Awareness'
  },
  {
    id: 'ev-003',
    type: 'event',
    title: 'Wildlife Photography Workshop',
    excerpt: 'Learn ethical wildlife photography techniques from professional photographers and conservation workers.',
    body: 'PWRCC partners with local photographers to offer a 2-day ethical wildlife photography workshop. Participants will learn camera settings, fieldcraft, and most importantly, how to photograph wildlife without causing disturbance or stress. Limited to 20 participants. Registration required.',
    date: '2026-06-14',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop',
    category: 'Workshop'
  },
  {
    id: 'nw-001',
    type: 'news',
    title: 'Rescued Pangolin Returns to the Wild After 3-Month Rehabilitation',
    excerpt: 'A critically injured Palawan Pangolin rescued from an illegal trader has been successfully rehabilitated and released.',
    body: 'After three months of intensive care at the PWRCC, a female Palawan Pangolin that was confiscated from an illegal wildlife trader has been successfully released back into protected forest habitat in the southern tip of Palawan. The pangolin, named "Ilaw" by PWRCC staff, arrived severely malnourished and dehydrated. Thanks to the dedication of our wildlife veterinary team, she has made a full recovery.',
    date: '2026-05-20',
    image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=500&fit=crop',
    category: 'Rescue'
  },
  {
    id: 'nw-002',
    type: 'news',
    title: 'PWRCC Partners with Barangays for Stray Animal Monitoring',
    excerpt: 'A new community-based stray animal monitoring program launches across 12 barangays in Puerto Princesa City.',
    body: 'The PWRCC has signed MOAs with 12 barangays in Puerto Princesa City to establish community animal welfare committees. Each barangay will designate trained volunteers to monitor stray animals, facilitate TNVR (Trap, Neuter, Vaccinate, Return) programs, and coordinate with PWRCC for animal rescue and rehabilitation needs. The program aims to humanely manage the city\'s stray animal population.',
    date: '2026-05-15',
    image: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=800&h=500&fit=crop',
    category: 'Program'
  },
  {
    id: 'nw-003',
    type: 'news',
    title: 'Katala Nesting Season Begins — Report Disturbances Immediately',
    excerpt: 'The Philippine Cockatoo breeding season is underway. PWRCC urges the public to report any nest disturbances.',
    body: 'The Philippine Cockatoo (Katala) nesting season runs from March to July. During this period, PWRCC urges all residents and tourists to be especially vigilant near known nesting trees in the Palawan forest edge. Any disturbance to nesting trees — including loud noise, light flashing, and tree cutting — must be reported immediately via DWARRMS. Violators face criminal penalties under the Philippine Wildlife Act.',
    date: '2026-05-10',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&h=500&fit=crop',
    category: 'Alert'
  }
]
