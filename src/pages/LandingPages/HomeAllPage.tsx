import HeroSection from './Hero'
import FeaturesSection from './FeaturedSection'
import PreviewSection from './Preview'
import CTASection from './Cta'
import VideoDemo from './VideoDemo'

const HomeAllPage = () => {
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
