import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Brain,
  ClipboardCheck,
  Eye,
  FlaskConical,
  LineChart,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  const [heroPointer, setHeroPointer] = useState({ x: 50, y: 50 })
  const [frame, setFrame] = useState(0)

  const acceptanceStages = useMemo(
    () => [
      { id: 'submitted', title: 'Submitted', detail: 'Application package received', icon: ClipboardCheck, start: 0, end: 55 },
      { id: 'ai', title: 'AI Review', detail: 'Clarification + quality scoring', icon: Bot, start: 56, end: 120 },
      { id: 'ethics', title: 'Ethics Check', detail: 'COI and protocol validated', icon: ShieldCheck, start: 121, end: 185 },
      { id: 'audit', title: 'Auditor Review', detail: 'NMSS reviewer adjudication', icon: Eye, start: 186, end: 250 },
      { id: 'accepted', title: 'Accepted', detail: 'Funding recommendation issued', icon: BadgeCheck, start: 251, end: 320 }
    ],
    []
  )

  const totalFrames = 360

  const particleWave = useMemo(
    () =>
      Array.from({ length: 96 }, (_, index) => ({
        id: index,
        x: (index / 95) * 100,
        delay: (index % 12) * 0.28,
        duration: 5.5 + (index % 7) * 0.35,
        drift: ((index % 9) - 4) * 6,
        size: 2 + (index % 3)
      })),
    []
  )

  useEffect(() => {
    let animationFrame = 0
    const start = performance.now()
    const fps = 30

    const tick = (now: number) => {
      const elapsed = now - start
      const nextFrame = Math.floor((elapsed / 1000) * fps) % totalFrames
      setFrame(nextFrame)
      animationFrame = requestAnimationFrame(tick)
    }

    animationFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.reveal-section')
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const handleHeroMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setHeroPointer({ x, y })
  }

  const heroCursorStyle = {
    '--nx': `${((heroPointer.x - 50) / 50).toFixed(3)}`,
    '--ny': `${((heroPointer.y - 50) / 50).toFixed(3)}`,
    '--mx': `${heroPointer.x}%`,
    '--my': `${heroPointer.y}%`,
    '--rx': `${((heroPointer.y - 50) / -10).toFixed(2)}deg`,
    '--ry': `${((heroPointer.x - 50) / 8).toFixed(2)}deg`,
    '--dx': `${(heroPointer.x - 50).toFixed(2)}px`,
    '--dy': `${(heroPointer.y - 50).toFixed(2)}px`,
    '--card-rx-main': `${((heroPointer.y - 50) / -26).toFixed(2)}deg`,
    '--card-ry-main': `${((heroPointer.x - 50) / -22).toFixed(2)}deg`,
    '--card-rx-side': `${((heroPointer.y - 50) / -40).toFixed(2)}deg`,
    '--card-ry-side': `${((heroPointer.x - 50) / -34).toFixed(2)}deg`,
    '--card-dx-main': `${((heroPointer.x - 50) * 0.04).toFixed(2)}px`,
    '--card-dy-main': `${((heroPointer.y - 50) * 0.03).toFixed(2)}px`,
    '--card-dx-side': `${((heroPointer.x - 50) * 0.025).toFixed(2)}px`,
    '--card-dy-side': `${((heroPointer.y - 50) * 0.02).toFixed(2)}px`,
    '--card-hover-dx': `${((heroPointer.x - 50) * 0.12).toFixed(2)}px`,
    '--card-hover-dy': `${((heroPointer.y - 50) * 0.1).toFixed(2)}px`,
    '--pillow-shift-x': `${((heroPointer.x - 50) * 0.22).toFixed(2)}px`,
    '--pillow-shift-y': `${((heroPointer.y - 50) * 0.18).toFixed(2)}px`,
    '--pillow-light-x': `${((50 - heroPointer.x) * 0.35).toFixed(2)}px`,
    '--pillow-light-y': `${((50 - heroPointer.y) * 0.35).toFixed(2)}px`,
    '--pillow-dark-x': `${((heroPointer.x - 50) * 0.28).toFixed(2)}px`,
    '--pillow-dark-y': `${((heroPointer.y - 50) * 0.28).toFixed(2)}px`
  } as CSSProperties

  const activeStageIndex = acceptanceStages.findIndex(
    (stage) => frame >= stage.start && frame <= stage.end
  )
  const normalizedActiveStageIndex =
    activeStageIndex === -1
      ? acceptanceStages.length - 1
      : activeStageIndex

  const activeStage = acceptanceStages[normalizedActiveStageIndex]
  const globalProgress = Math.min(100, (frame / acceptanceStages[acceptanceStages.length - 1].end) * 100)
  const activeStageNumber = normalizedActiveStageIndex + 1

  return (
    <div className="landing-page">
      <section
        className="landing-top-shell"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={() => setHeroPointer({ x: 50, y: 50 })}
        style={heroCursorStyle}
      >
        <div className="hero-neural-field" aria-hidden="true">
          <div className="hero-pillow-map" />
          <div className="neural-links" />
          {['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8'].map((node) => (
            <span key={node} className={`neural-node ${node}`} />
          ))}
        </div>

        <div className="landing-nav modern-nav">
          <div className="landing-brand modern-brand">
            <img src="/National-MS-Society-1024x1024.avif" alt="National Multiple Sclerosis Society logo" />
            <img src="/image-removebg-preview (36).png" alt="Synapse logo" />
          </div>
          <div className="landing-nav-actions">
            <span className="landing-mode-badge">Demo Mode</span>
            <Link to="/researcher-view" className="landing-nav-launch">
              Launch App
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="landing-hero-grid">
          <div className="landing-hero-content">
          <div className="landing-chip">
            <Sparkles size={16} />
            Next-generation NMSS grant lifecycle intelligence
          </div>
          <h1>Synapse for NMSS Research Excellence</h1>
          <p>
            The intelligent research platform for high-trust grant intake, AI clarification, ethical risk checks,
            and reviewer-ready decisioning.
          </p>
            <div className="landing-kpis">
              <div><strong>6</strong><span>Sequential stages</span></div>
              <div><strong>&lt; 10s</strong><span>AI triage latency</span></div>
              <div><strong>98%</strong><span>Validation coverage</span></div>
            </div>
          <div className="landing-cta">
            <Link to="/researcher-view" className="landing-btn landing-btn-primary">
              Researcher View
              <ArrowRight size={16} />
            </Link>
            <Link to="/nmss-auditor-view" className="landing-btn landing-btn-ghost">NMSS Auditor View</Link>
          </div>
          </div>

          <div className="landing-preview-cards">
            <article className="preview-card preview-card-zig preview-left preview-card-main">
              <span className="preview-badge">Researcher Intake</span>
              <h3>EBV-MS Longitudinal Cohort Submission</h3>
              <p>Applicant verified, proposal analyzed, and ethics package attached.</p>
              <div className="preview-meta">
                <span>Validation 100%</span>
                <span>AI Ready</span>
              </div>
            </article>
            <article className="preview-card preview-card-zig preview-right preview-card-side">
              <span className="preview-badge">AI Clarification</span>
              <h3>4 High-priority questions completed</h3>
              <p>Methodology, translational pathway, and global cohort representation verified.</p>
            </article>
            <article className="preview-card preview-card-zig preview-left preview-card-side">
              <span className="preview-badge">Auditor Review</span>
              <h3>Recommendation pending committee decision</h3>
              <p>Application packet is complete and queued for NMSS review board adjudication.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-architecture reveal-section">
        <div className="architecture-visual">
          <div className="architecture-card">
            <div className="architecture-header">
              <span>NMSS Research Architecture</span>
              <span className="architecture-live">Active</span>
            </div>
            <div className="architecture-stages">
              <span>Intake</span>
              <span>Validate</span>
              <span>Clarify</span>
              <span>Review</span>
            </div>
            <div className="architecture-pipeline">Hybrid processing + RAG pipeline</div>
            <div className="architecture-tags">
              <span>Applicant Data</span>
              <span>AI Evaluation</span>
              <span>NMSS Policy Rules</span>
            </div>
            <div className="architecture-stats">
              <div><strong>6</strong><span>Core services</span></div>
              <div><strong>8.3s</strong><span>Avg. Analysis</span></div>
              <div><strong>98.5%</strong><span>Accuracy</span></div>
            </div>
          </div>
        </div>

        <div className="landing-feature-grid">
          <article className="landing-feature-card glass">
            <FlaskConical size={18} />
            <h3>Researcher-first workflow</h3>
            <p>Structured multi-step submissions with guided validation and completion checkpoints.</p>
          </article>
          <article className="landing-feature-card glass">
            <Bot size={18} />
            <h3>AI clarification engine</h3>
            <p>Automated follow-up prompts ensure scientific rigor and complete proposal intent.</p>
          </article>
          <article className="landing-feature-card glass">
            <ShieldCheck size={18} />
            <h3>Built-in compliance checks</h3>
            <p>Ethics, budget, and conflict declarations are continuously validated.</p>
          </article>
          <article className="landing-feature-card glass">
            <ClipboardCheck size={18} />
            <h3>Auditor-grade trail</h3>
            <p>All scoring and decisions remain transparent and traceable for NMSS review teams.</p>
          </article>
          <article className="landing-feature-card glass">
            <LineChart size={18} />
            <h3>Portfolio intelligence</h3>
            <p>Track application quality and risk trends across reviewer queues in real time.</p>
          </article>
          <article className="landing-feature-card glass">
            <Brain size={18} />
            <h3>Decision augmentation</h3>
            <p>AI provides context and not conclusions, preserving reviewer authority.</p>
          </article>
        </div>
      </section>

      <section className="landing-acceptance-remotion reveal-section">
        <div className="acceptance-shell">
          <div className="acceptance-header">
            <p className="landing-eyebrow">acceptance flow</p>
            <h3>Watch how Synapse moves a proposal to acceptance.</h3>
          </div>

          <div className="acceptance-track">
            {acceptanceStages.map((stage) => {
              const isDone = frame > stage.end
              const isActive = frame >= stage.start && frame <= stage.end
              const localProgress = isDone
                ? 100
                : isActive
                  ? ((frame - stage.start) / Math.max(1, stage.end - stage.start)) * 100
                  : 0

              return (
                <article key={stage.id} className={`acceptance-stage ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="acceptance-stage-head">
                    <span className="acceptance-stage-icon">
                      <stage.icon size={13} />
                    </span>
                    <div>
                      <strong>{stage.title}</strong>
                      <span>{stage.detail}</span>
                    </div>
                  </div>
                  <div className="acceptance-stage-progress">
                    <span style={{ width: `${localProgress}%` }} />
                  </div>
                </article>
              )
            })}
          </div>

          <div className="acceptance-live-card">
            <div className="acceptance-live-top">
              <span className="acceptance-live-item">
                <span className="acceptance-dot" />
                Live pipeline simulation
              </span>
              <span className="acceptance-live-item">Stage {activeStageNumber} of {acceptanceStages.length}</span>
              <span className="acceptance-live-item">{globalProgress.toFixed(0)}% complete</span>
            </div>
            <p>
              Current step: <strong>{activeStage.title}</strong> - {activeStage.detail}
            </p>
          </div>
        </div>
      </section>

      <section className="landing-final-cta reveal-section">
        <div className="particle-wave" aria-hidden="true">
          {particleWave.map((particle) => (
            <span
              key={particle.id}
              className="particle-dot"
              style={
                {
                  '--x': `${particle.x}%`,
                  '--d': `${particle.delay}s`,
                  '--dur': `${particle.duration}s`,
                  '--drift': particle.drift,
                  '--size': `${particle.size}px`
                } as CSSProperties
              }
            />
          ))}
        </div>
        <p className="landing-eyebrow">Go Live with Synapse</p>
        <h2>See NMSS grants run with speed and confidence.</h2>
        <p>Launch the researcher flow or open auditor view to experience the full Synapse lifecycle.</p>
        <div className="landing-cta">
          <Link to="/researcher-view" className="landing-btn landing-btn-primary">
            Launch Researcher View
            <ArrowRight size={16} />
          </Link>
          <Link to="/nmss-auditor-view" className="landing-btn landing-btn-ghost">Open NMSS Auditor View</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <img src="/image-removebg-preview (36).png" alt="Synapse logo" />
          <span>Synapse x NMSS</span>
        </div>
        <span>2026 Synapse Platform</span>
      </footer>
    </div>
  )
}

export default LandingPage
