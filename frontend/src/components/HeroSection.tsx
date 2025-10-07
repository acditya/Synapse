const HeroSection = () => {
  return (
    <div className="header">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img 
            src="/National-MS-Society-1024x1024.avif" 
            alt="National Multiple Sclerosis Society Logo" 
            style={{ 
              height: '80px', 
              width: 'auto',
              marginRight: '1rem'
            }}
          />
        </div>
        <h1>NMSS Research Grant Application</h1>
        <p>Submit your research proposal to advance multiple sclerosis research and treatment</p>
      </div>
    </div>
  )
}

export default HeroSection
