export interface DomesticReport {
  id: string
  type: 'missing' | 'found' | 'stray' | 'injured'
  animalName: string
  species: 'dog' | 'cat' | 'bird' | 'other'
  breed?: string
  color: string
  location: string
  description: string
  contactName: string
  contactNumber: string
  image: string
  date: string
  status: 'open' | 'reunited' | 'resolved'
}

export const domesticReports: DomesticReport[] = [
  {
    id: 'dr-001',
    type: 'missing',
    animalName: 'Mochi',
    species: 'dog',
    breed: 'Shih Tzu',
    color: 'White and brown',
    location: 'San Pedro, Puerto Princesa City',
    description: 'Small Shih Tzu, very friendly, wearing a red collar with a bone tag. Last seen near the wet market on Saturday morning. Responds to name Mochi.',
    contactName: 'Maria Santos',
    contactNumber: '09XX-XXX-XXXX',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    date: '2026-05-24',
    status: 'open'
  },
  {
    id: 'dr-002',
    type: 'found',
    animalName: 'Unknown',
    species: 'cat',
    color: 'Orange tabby',
    location: 'Rizal Ave, Puerto Princesa City',
    description: 'Found an orange tabby cat near the pharmacy. Very thin and appears malnourished. Currently being cared for. Has a small notch on the right ear.',
    contactName: 'Juan dela Cruz',
    contactNumber: '09XX-XXX-XXXX',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    date: '2026-05-25',
    status: 'open'
  },
  {
    id: 'dr-003',
    type: 'stray',
    animalName: 'Unknown',
    species: 'dog',
    color: 'Black and white',
    location: 'Barangay Tiniguiban',
    description: 'Medium-sized stray dog roaming near the elementary school. Appears healthy but skittish. Children have been feeding it but it needs proper care.',
    contactName: 'Ana Reyes',
    contactNumber: '09XX-XXX-XXXX',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
    date: '2026-05-23',
    status: 'open'
  },
  {
    id: 'dr-004',
    type: 'missing',
    animalName: 'Banana',
    species: 'bird',
    breed: 'Lovebird',
    color: 'Yellow and green',
    location: 'Malvar St., Puerto Princesa City',
    description: 'Escaped lovebird, named Banana. Yellow-green plumage, very vocal and not afraid of people. May fly toward windows or land on outstretched hands.',
    contactName: 'Robert Uy',
    contactNumber: '09XX-XXX-XXXX',
    image: 'https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=400&h=400&fit=crop',
    date: '2026-05-22',
    status: 'open'
  },
  {
    id: 'dr-005',
    type: 'injured',
    animalName: 'Unknown',
    species: 'cat',
    color: 'Gray striped',
    location: 'National Highway near Sta. Lourdes',
    description: 'Injured cat found on the roadside, possible vehicle strike. Has a limp on the right hind leg. Currently at a local resident\'s home receiving water.',
    contactName: 'Liza Dimacali',
    contactNumber: '09XX-XXX-XXXX',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    date: '2026-05-26',
    status: 'open'
  },
  {
    id: 'dr-006',
    type: 'found',
    animalName: 'Unknown',
    species: 'dog',
    breed: 'Aspin',
    color: 'Brown with white markings',
    location: 'Mangingisda, Puerto Princesa City',
    description: 'Found a friendly adult aspin near the pier. Well-socialized, possibly someone\'s lost pet. Has an old scar on the left ear. Male, approximately 2–3 years old.',
    contactName: 'Ben Mapano',
    contactNumber: '09XX-XXX-XXXX',
    image: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&h=400&fit=crop',
    date: '2026-05-21',
    status: 'open'
  }
]

export const reportTypeLabels: Record<DomesticReport['type'], string> = {
  missing: 'Missing Pet',
  found: 'Found Animal',
  stray: 'Stray Animal',
  injured: 'Injured Animal',
}

export const reportTypeColors: Record<DomesticReport['type'], string> = {
  missing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  found: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  stray: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  injured: 'bg-red-500/20 text-red-300 border-red-500/30',
}
