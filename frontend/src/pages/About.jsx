export default function About() {
  return (
    <div className="px-6 py-16 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-light text-gray-900 sm:text-4xl">About Us</h1>
        <p className="mt-3 text-sm text-gray-400">
          Palawan Wildlife Rescue &amp; Conservation Center
        </p>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-gray-600">
          <p>
            Founded in 2015, the Palawan Wildlife Rescue &amp; Conservation Center is a non-profit
            organization dedicated to the rescue, rehabilitation, and release of wildlife across
            Palawan island. We work closely with local communities, government agencies, and
            international partners to protect the region's unique biodiversity.
          </p>
          <p>
            Our team of veterinarians, biologists, and trained volunteers responds to emergencies
            ranging from injured marine turtles and stranded dugongs to displaced civets and
            orphaned hornbills. Every year, we rehabilitate and release hundreds of animals back
            into their natural habitats.
          </p>
          <p>
            Beyond rescue work, we run community education programs, coastal clean-up drives, and
            habitat restoration projects aimed at reducing human-wildlife conflict and promoting
            sustainable coexistence.
          </p>
        </div>

        <hr className="my-10 border-gray-200" />

        <h2 className="text-2xl font-light text-gray-900">Mission &amp; Vision</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-medium text-gray-900">Mission</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              To protect and preserve Palawan's wildlife through emergency rescue, professional
              rehabilitation, and community-centered conservation.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-medium text-gray-900">Vision</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              A Palawan where wildlife and communities thrive together in harmony.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
