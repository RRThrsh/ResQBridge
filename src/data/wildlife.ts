export interface WildlifeSpecies {
  id: string
  commonName: string
  localName: string
  scientificName: string
  category: 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'marine'
  status: 'critically-endangered' | 'endangered' | 'vulnerable' | 'protected'
  habitat: string
  diet: string
  activeTime: 'diurnal' | 'nocturnal' | 'crepuscular'
  description: string
  safetyTips: string[]
  ecologicalImportance: string
  images: string[]
  tags: string[]
}

export const wildlifeSpecies: WildlifeSpecies[] = [
  {
    id: 'palawan-pangolin',
    commonName: 'Palawan Pangolin',
    localName: 'Balintong',
    scientificName: 'Manis culionensis',
    category: 'mammal',
    status: 'critically-endangered',
    habitat: 'Lowland and montane tropical forests, forest edges near agricultural areas',
    diet: 'Ants, termites, and their larvae',
    activeTime: 'nocturnal',
    description: 'The Palawan Pangolin is one of the world\'s most trafficked mammals, endemic to the Palawan island group. Covered in large, overlapping keratin scales that protect it from predators, it curls into a tight ball when threatened. A single pangolin can consume up to 70 million insects per year, making it an essential pest controller in Palawan\'s ecosystems.',
    safetyTips: [
      'Never attempt to handle or approach a pangolin',
      'Do not disturb its foraging area',
      'Report any sightings to PWRCC immediately',
      'Never purchase pangolin products — it is strictly illegal'
    ],
    ecologicalImportance: 'Pangolins are the primary natural control of ant and termite populations in Palawan forests, preventing ecological damage to trees and soil structures.',
   images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Manis_culionensis.jpg/440px-Manis_culionensis.jpg',
],
    tags: ['endemic', 'protected', 'nocturnal', 'mammal']
  },
  {
    id: 'philippine-cockatoo',
    commonName: 'Philippine Cockatoo',
    localName: 'Katala',
    scientificName: 'Cacatua haematuropygia',
    category: 'bird',
    status: 'critically-endangered',
    habitat: 'Coastal forests, mangroves, primary and secondary forests up to 600m',
    diet: 'Seeds, fruits, nuts, berries, and coconut flesh',
    activeTime: 'diurnal',
    description: 'The Katala, or Philippine Cockatoo, is a striking all-white bird with a red-and-yellow underwing flash. It is the only cockatoo endemic to the Philippines and one of the rarest parrots in the world. Palawan holds the largest remaining wild population, estimated at around 1,000 individuals.',
    safetyTips: [
      'Never approach nesting trees during breeding season (March–July)',
      'Do not attempt to capture or keep as a pet — it is illegal',
      'Avoid making loud noises near roosting sites',
      'Report all sightings with GPS coordinates to PWRCC'
    ],
    ecologicalImportance: 'Katala serve as important seed dispersers for large-fruited trees in coastal and lowland forests, helping forest regeneration across Palawan.',
    images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Manis_culionensis.jpg/440px-Manis_culionensis.jpg',
],
    tags: ['endemic', 'protected', 'diurnal', 'bird', 'parrot']
  },
  {
    id: 'palawan-bearcat',
    commonName: 'Palawan Bearcat',
    localName: 'Binturong',
    scientificName: 'Arctictis binturong',
    category: 'mammal',
    status: 'vulnerable',
    habitat: 'Dense tropical rainforest canopy, particularly near fig trees',
    diet: 'Fruits (especially figs), small mammals, birds, fish, insects',
    activeTime: 'nocturnal',
    description: 'The Binturong, or bearcat, is neither a bear nor a cat — it belongs to the civet family. It is the only Old World mammal with a prehensile tail, which it uses to grip branches. It smells distinctly of buttered popcorn due to a chemical compound in its urine. A remarkable Palawan rainforest resident.',
    safetyTips: [
      'Do not approach — it can bite and scratch severely when threatened',
      'Never attempt to domesticate or keep as a pet',
      'If found injured, contact PWRCC immediately',
      'Keep noise and light to a minimum near sighting areas'
    ],
    ecologicalImportance: 'Binturong are critical dispersers of strangler fig seeds, which would not germinate without passing through their digestive system. Without binturong, fig trees — and many species that depend on them — would decline.',
    images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Binturong_in_Overloon.jpg/440px-Binturong_in_Overloon.jpg',
],
    tags: ['vulnerable', 'nocturnal', 'mammal', 'canopy']
  },
  {
    id: 'palawan-monitor',
    commonName: 'Gray\'s Monitor Lizard',
    localName: 'Butikaw',
    scientificName: 'Varanus olivaceus',
    category: 'reptile',
    status: 'endangered',
    habitat: 'Primary and secondary forests, often near rivers and fruit trees',
    diet: 'Fruits, crabs, snails, small vertebrates — one of few frugivorous monitor lizards',
    activeTime: 'diurnal',
    description: 'Gray\'s Monitor Lizard is the world\'s only known primarily frugivorous monitor lizard, and is endemic to Palawan. It can reach up to 2 meters in length and is an excellent climber. Revered by indigenous Palawanon communities, it plays a vital role in the forest ecosystem.',
    safetyTips: [
      'Do not corner or provoke — it can deliver a powerful tail whip and scratch',
      'Keep dogs on leash in forest areas to prevent encounters',
      'Report hunting activity immediately to PWRCC',
      'Do not consume its meat — it is strictly protected'
    ],
    ecologicalImportance: 'As a fruit-eater, it disperses seeds of large-fruited trees across wide areas of forest, contributing significantly to Palawan forest regeneration.',
    images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Manis_culionensis.jpg/440px-Manis_culionensis.jpg',
],
    tags: ['endemic', 'endangered', 'diurnal', 'reptile', 'frugivore']
  },
  {
    id: 'palawan-flying-fox',
    commonName: 'Palawan Flying Fox',
    localName: 'Kabog',
    scientificName: 'Acerodon leucotis',
    category: 'mammal',
    status: 'vulnerable',
    habitat: 'Old-growth forest canopy, roosting in large cave systems and tall trees',
    diet: 'Fruits, flowers, nectar — especially figs, durian, and rambutan',
    activeTime: 'nocturnal',
    description: 'With a wingspan of up to 1.5 meters, the Palawan Flying Fox is one of the largest bats in the world. Despite its dramatic appearance, it is entirely fruit-eating and poses no threat to humans. Its colonies can number in the tens of thousands, and they travel enormous distances each night in search of fruiting trees.',
    safetyTips: [
      'Never disturb roost colonies — sudden disturbance causes colony abandonment',
      'Do not capture or hunt — it is fully protected',
      'Observe only at dusk from a safe distance',
      'If found grounded, do not handle — call PWRCC'
    ],
    ecologicalImportance: 'Flying foxes are the primary long-distance seed dispersers and pollinators for many large-fruited trees in Palawan. Without them, many fruit tree species would fail to regenerate.',
    images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Manis_culionensis.jpg/440px-Manis_culionensis.jpg',
],
    tags: ['vulnerable', 'nocturnal', 'mammal', 'bat', 'pollinator']
  },
  {
    id: 'sea-turtle',
    commonName: 'Green Sea Turtle',
    localName: 'Pawikan',
    scientificName: 'Chelonia mydas',
    category: 'marine',
    status: 'endangered',
    habitat: 'Coastal waters, seagrass beds, coral reefs, nesting on sandy beaches',
    diet: 'Seagrass, algae (adults); jellyfish, sponges (juveniles)',
    activeTime: 'diurnal',
    description: 'The Green Sea Turtle, or Pawikan, is one of the oldest creatures on Earth, with a lineage stretching back 110 million years. Females return to the exact beach where they were born to lay eggs — sometimes traveling thousands of kilometers. Palawan\'s beaches are critical nesting grounds for the Philippines\' pawikan populations.',
    safetyTips: [
      'Never approach nesting females at night — it causes nest abandonment',
      'Do not use artificial lights on nesting beaches during hatching season',
      'Remove any debris or fishing line you find near sea turtle habitat',
      'If you find an entangled or stranded turtle, call PWRCC immediately'
    ],
    ecologicalImportance: 'Green Sea Turtles maintain healthy seagrass beds which provide nursery habitat for many fish species. Their excrement also fertilizes seagrass meadows and provides nutrients to coral reefs.',
    images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Manis_culionensis.jpg/440px-Manis_culionensis.jpg',
],
    tags: ['endangered', 'diurnal', 'marine', 'reptile', 'nesting']
  },
  {
    id: 'palawan-hornbill',
    commonName: 'Palawan Hornbill',
    localName: 'Talusi',
    scientificName: 'Anthracoceros marchei',
    category: 'bird',
    status: 'vulnerable',
    habitat: 'Lowland primary forests and forest edges, usually near fruiting trees',
    diet: 'Fruits, large insects, small lizards, snakes',
    activeTime: 'diurnal',
    description: 'The Palawan Hornbill is a large, black-and-white bird with a distinctive casque on its bill. It is endemic to Palawan and its surrounding islands. During nesting, the female seals herself inside a tree hollow using a mixture of mud and droppings, while the male feeds her through a small slit — one of nature\'s most extraordinary breeding behaviors.',
    safetyTips: [
      'Never disturb nesting trees — the female is sealed inside and completely vulnerable',
      'Report any nest site you discover to PWRCC for monitoring',
      'Do not cut large-cavity trees which serve as nesting sites',
      'Observe only from a distance using binoculars'
    ],
    ecologicalImportance: 'Hornbills are major seed dispersers for large-seeded forest trees. They are known as the "farmers of the forest" because seeds germinate better after passing through their digestive system.',
    images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Manis_culionensis.jpg/440px-Manis_culionensis.jpg',
],
    tags: ['endemic', 'vulnerable', 'diurnal', 'bird', 'hornbill']
  },
  {
    id: 'clouded-monitor',
    commonName: 'Clouded Monitor',
    localName: 'Bayawak',
    scientificName: 'Varanus nebulosus',
    category: 'reptile',
    status: 'protected',
    habitat: 'Forests, mangroves, agricultural margins, urban edges',
    diet: 'Insects, eggs, small vertebrates, carrion, fish',
    activeTime: 'diurnal',
    description: 'The Clouded Monitor is a medium-sized monitor lizard commonly encountered near settlements and agricultural areas in Palawan. Despite its fearsome appearance, it prefers to flee from humans. It plays an important scavenger role in the ecosystem, helping clean up carrion and controlling pest populations.',
    safetyTips: [
      'Give it space and do not corner it — it will bite and scratch defensively',
      'Keep poultry enclosures secure to prevent conflicts',
      'Do not kill — it is fully protected under Philippine wildlife laws',
      'If found in a building, call PWRCC for safe removal'
    ],
    ecologicalImportance: 'Monitor lizards are important scavengers and pest controllers. They consume large quantities of insects, rodents, and carrion, helping maintain ecological balance near human settlements.',
   images: [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Manis_culionensis.jpg/440px-Manis_culionensis.jpg',
],
    tags: ['protected', 'diurnal', 'reptile', 'monitor', 'common']
  }
]

export const categories = ['All', 'mammal', 'bird', 'reptile', 'amphibian', 'marine'] as const
export type Category = typeof categories[number]

export const statusColors: Record<WildlifeSpecies['status'], string> = {
  'critically-endangered':
    'bg-red-500/15 text-zinc-900 dark:text-zinc-100 border-red-500/40',

  endangered:
    'bg-orange-500/15 text-zinc-900 dark:text-zinc-100 border-orange-500/40',

  vulnerable:
    'bg-yellow-500/15 text-zinc-900 dark:text-zinc-100 border-yellow-500/40',

  protected:
    'bg-emerald-500/15 text-zinc-900 dark:text-zinc-100 border-emerald-500/40',
}

export const statusLabels: Record<WildlifeSpecies['status'], string> = {
  'critically-endangered': 'Critically Endangered',
  'endangered': 'Endangered',
  'vulnerable': 'Vulnerable',
  'protected': 'Protected',
}
