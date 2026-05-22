import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HeroSection from './Hero'
import FeaturesSection from './FeaturedSection'
import PreviewSection from './Preview'
import CTASection from './Cta'
import VideoDemo from './VideoDemo'

// Section IDs that the navbar links to. We accept incoming hashes that
// match this list and silently ignore anything else (so a stale or
// hand-crafted /#somethingelse doesn't try to scroll to a missing node).
const VALID_HASHES = new Set(['home', 'features', 'preview', 'cta'])

const HomeAllPage = () => {
  // Cross-page hash navigation support.
  //
  // When the user is on /login or /signup and clicks "Features" in the
  // navbar, Navbar.tsx calls navigate('/#features'). React Router mounts
  // this page with location.hash === '#features'. The browser's native
  // anchor behavior does NOT fire here because the SPA never actually
  // requested /#features — it just updated the in-memory location — so
  // we have to scroll ourselves.
  //
  // We also re-run on hash changes so clicking another nav link from
  // the same home page re-scrolls. (Navbar's same-page handler does its
  // own scroll, but if anything pushes a new hash via Link/<a> we want
  // this effect to catch it.)
  const location = useLocation()

  useEffect(() => {
    const raw = location.hash.replace(/^#/, '')
    if (!raw || !VALID_HASHES.has(raw)) return

    // Defer one frame so child sections have mounted and their IDs
    // exist in the DOM by the time we look them up. Without this,
    // landing on /#cta from another route would miss because <CTASection>
    // hasn't rendered yet on the first paint.
    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById(raw)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(id)
  }, [location.hash, location.key])

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <HeroSection />

      < VideoDemo />

      {/* Features Section */}
      <FeaturesSection />

      {/* Preview Section */}
      <PreviewSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

export default HomeAllPage
