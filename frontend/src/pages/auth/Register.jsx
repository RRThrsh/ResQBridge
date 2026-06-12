import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../components/ui/Modal.jsx'
import { InputField } from '../../components/ui'

export default function Register() {
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-light text-gray-900 sm:text-3xl">Register</h1>
        <p className="mt-2 text-sm text-gray-400">Create your ResQBridge account.</p>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="First Name" placeholder="Juan" />
            <InputField label="Last Name" placeholder="Dela Cruz" />
          </div>
          <InputField label="Phone" type="tel" placeholder="+63 9XX XXX XXXX" />
          <InputField label="Email" type="email" placeholder="you@example.com" />
          <InputField label="Password" type="password" placeholder="At least 8 characters" />
          <InputField label="Confirm Password" type="password" placeholder="Repeat password" />
          <p className="text-sm font-medium text-gray-700">Address</p>
          <div className="grid grid-cols-2 gap-4">
            <div><InputField label="Barangay" placeholder="Type to search..." list="barangay-list" /></div>
            <InputField label="Street" placeholder="Street" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="City" placeholder="Type to search..." list="city-list" />
            <InputField label="Province" placeholder="Type to search..." list="province-list" />
            <InputField label="Zipcode" placeholder="Zipcode" />
          </div>

          <datalist id="barangay-list">
            <option value="Irawan" />
            <option value="San Miguel" />
            <option value="Bancao-Bancao" />
            <option value="San Jose" />
            <option value="Sta. Monica" />
            <option value="Tagburos" />
            <option value="Sta. Lourdes" />
            <option value="Mabuhay" />
            <option value="Light House" />
            <option value="Mandaragat" />
            <option value="Tiniguiban" />
            <option value="San Pedro" />
            <option value="San Manuel" />
            <option value="Lucbuan" />
            <option value="Sicsican" />
            <option value="Sta. Cruz" />
            <option value="Babuyan" />
            <option value="Bagong Sikat" />
            <option value="Bagong Silang" />
            <option value="Buenavista" />
          </datalist>
          <datalist id="city-list">
            <option value="Puerto Princesa City" />
            <option value="Aborlan" />
            <option value="Narra" />
            <option value="Quezon" />
            <option value="Brooke's Point" />
            <option value="Bataraza" />
            <option value="Rizal" />
            <option value="Sofronio Española" />
            <option value="El Nido" />
            <option value="Coron" />
            <option value="Taytay" />
            <option value="Roxas" />
            <option value="San Vicente" />
            <option value="Busuanga" />
            <option value="Culion" />
            <option value="Linapacan" />
            <option value="Magsaysay" />
            <option value="Cagayancillo" />
            <option value="Araceli" />
            <option value="Dumaran" />
          </datalist>
          <datalist id="province-list">
            <option value="Palawan" />
          </datalist>
          <label className="flex items-start gap-2 text-sm text-gray-500">
            <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
            <span>I agree to the{' '}
              <button type="button" onClick={() => setShowTerms(true)} className="text-green-700 underline underline-offset-2 hover:text-green-800">Terms of Service</button>
              {' '}and{' '}
              <button type="button" onClick={() => setShowPrivacy(true)} className="text-green-700 underline underline-offset-2 hover:text-green-800">Privacy Policy</button>
            </span>
          </label>
          <button type="submit" className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-800">
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-green-700 underline underline-offset-2 hover:text-green-800">
            Login
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link to="/" className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600">
            Back to Home
          </Link>
        </p>
      </div>

      <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service" size="lg">
        <div className="space-y-4 text-sm leading-relaxed text-gray-600">
          <p>By using ResQBridge, you agree to the following terms:</p>
          <h4 className="font-medium text-gray-900">1. Use of Service</h4>
          <p>ResQBridge connects users with wildlife rescue teams. The platform is provided as-is for informational and emergency coordination purposes. Always verify critical information directly with authorized rescue personnel.</p>
          <h4 className="font-medium text-gray-900">2. User Conduct</h4>
          <p>You agree not to submit false reports, misuse emergency channels, or upload harmful content. Accounts found violating these rules may be suspended.</p>
          <h4 className="font-medium text-gray-900">3. Limitation of Liability</h4>
          <p>ResQBridge is not liable for any damages arising from the use or inability to use the platform, including delayed emergency responses caused by network or system failures.</p>
          <h4 className="font-medium text-gray-900">4. Changes</h4>
          <p>We reserve the right to update these terms at any time. Users will be notified of material changes via email or platform notice.</p>
        </div>
      </Modal>

      <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy" size="lg">
        <div className="space-y-4 text-sm leading-relaxed text-gray-600">
          <h4 className="font-medium text-gray-900">1. Information We Collect</h4>
          <p>We collect information you provide when creating an account, submitting reports, or contacting us, including your name, email address, and location data when you enable it.</p>
          <h4 className="font-medium text-gray-900">2. How We Use Information</h4>
          <p>Your information is used to facilitate wildlife rescue coordination, improve our services, and communicate with you about your reports or inquiries. Location data is used only for mapping and routing purposes.</p>
          <h4 className="font-medium text-gray-900">3. Data Sharing</h4>
          <p>We do not sell your personal data. Information may be shared with rescue teams and partner organizations solely for emergency coordination and rehabilitation efforts.</p>
          <h4 className="font-medium text-gray-900">4. Data Security</h4>
          <p>We implement reasonable security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
          <h4 className="font-medium text-gray-900">5. Contact</h4>
          <p>For privacy-related concerns, email us at privacy@palawanwildlife.org.</p>
        </div>
      </Modal>
    </div>
  )
}
