import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Modal from '../../components/ui/Modal.jsx'
import { auth } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const API_BASE = '/api/v1'

export default function Register() {
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [otpEnabled, setOtpEnabled] = useState(true)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE}/landing-config`)
      .then((r) => r.json())
      .then((d) => setOtpEnabled(d.otpEnabled))
      .catch(() => {})
  }, [])

  async function handleSendOtp() {
    if (!email) return
    setOtpLoading(true)
    setError('')
    setOtpMessage('')
    try {
      const data = await auth.sendOtp(email)
      if (data.otpRequired === false) {
        setOtpEnabled(false)
        setOtpMessage('OTP is disabled. You can register directly.')
      } else {
        setOtpSent(true)
        setOtpMessage('OTP sent to your email.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const data = await auth.register({
        firstName,
        lastName,
        phoneNumber: phone,
        email,
        password,
        confirmPassword,
        otp,
      })
      login(data.token, data.user)
      navigate('/rescuer/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-lg">
          <div className="text-center">
            <Link to="/" className="text-2xl font-bold text-green-600">ResQBridge</Link>
            <h1 className="mt-6 text-2xl font-light text-gray-900">Create an account</h1>
            <p className="mt-1 text-sm text-gray-400">Join ResQBridge and help protect Palawan wildlife</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            {otpMessage && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">{otpMessage}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="Juan"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="Dela Cruz"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder="+63 9XX XXX XXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="you@example.com"
                  required
                />
                {otpEnabled && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !email}
                    className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
                  >
                    {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {otpSent && otpEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="6-digit code"
                  required
                  maxLength={6}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="Repeat password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Address</legend>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Barangay</label>
                  <input
                    list="barangay-list"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="Type to search..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Street</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="Street"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-500">City</label>
                  <input
                    list="city-list"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="Type to search..."
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-500">Province</label>
                  <input
                    list="province-list"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="Type to search..."
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-500">Zipcode</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="Zipcode"
                  />
                </div>
              </div>
            </fieldset>

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
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span>
                I agree to the{' '}
                <button type="button" onClick={() => setShowTerms(true)} className="font-medium text-green-700 underline-offset-2 hover:underline">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" onClick={() => setShowPrivacy(true)} className="font-medium text-green-700 underline-offset-2 hover:underline">
                  Privacy Policy
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/v1/login" className="font-medium text-green-700 underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link to="/" className="text-xs text-gray-400 underline-offset-2 hover:underline hover:text-gray-600">
            &larr; Back to Home
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
