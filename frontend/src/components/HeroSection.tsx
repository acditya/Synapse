const HeroSection = () => {
  return (
    <div className="header">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: '1rem' }}>
          <img 
            src="/National-MS-Society-1024x1024.avif" 
            alt="National Multiple Sclerosis Society Logo" 
            style={{ 
              height: '80px', 
              width: 'auto'
            }}
          />
          <img 
            src="/image-removebg-preview (36).png" 
            alt="Synapse Logo" 
            style={{ 
              height: '60px',
              width: 'auto'
            }}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--nmss-black)' }}>
            NMSS Research Grant Application
          </h2>
          <p>Submit your research proposal to advance multiple sclerosis research and treatment</p>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
