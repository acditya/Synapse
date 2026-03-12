import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <div className="header header-tight">
      <div className="container hero-shell">
        <div className="hero-topbar">
          <div className="hero-brand">
            <img
              src="/National-MS-Society-1024x1024.avif"
              alt="National Multiple Sclerosis Society Logo"
            />
            <img
              src="/image-removebg-preview (36).png"
              alt="Synapse Logo"
            />
          </div>
          <div className="hero-links">
            <Link to="/" className="btn btn-outline">Home</Link>
            <Link to="/nmss-auditor-view" className="btn btn-secondary">NMSS Auditor View</Link>
          </div>
        </div>

        <div className="hero-copy">
          <h2>Researcher View - NMSS Grant Submission</h2>
          <p>Submit your research proposal to advance multiple sclerosis research and treatment</p>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
