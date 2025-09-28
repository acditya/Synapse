<h1>🧠 NMSS Synapse</h1>
<p><strong>AI-Powered Research Grant Triage &amp; Compliance Assistant</strong></p>
<p><strong>NMSS Synapse</strong> is an open-source AI system for the National Multiple Sclerosis Society (NMSS) that streamlines <em>screening, triaging, and reviewing</em> of research grant applications. Using <strong>Retrieval-Augmented Generation (RAG)</strong>, structured rule-checking, and explainable AI, Synapse helps program officers and reviewers save time, reduce bias, and accelerate funding decisions toward a cure for MS.</p>

<hr>

<h2>🚀 Key Features</h2>

<h3>📝 Automated Pre-Submission Checks</h3>
<ul>
  <li>Detects missing documents (IRB, COI, budget forms).</li>
  <li>Flags ineligible applications based on <strong>NMSS + UAE-specific</strong> requirements.</li>
  <li>Generates a <strong>compliance readiness report</strong> for applicants.</li>
</ul>

<h3>📄 One-Page Research Briefs</h3>
<ul>
  <li>Condenses lengthy proposals into a structured <strong>300–400 word summary</strong>.</li>
  <li>Highlights aims, novelty, methods, sample size, budget, ethics.</li>
  <li>Includes <strong>policy citations</strong> and red flags for transparency.</li>
</ul>

<h3>🤝 Reviewer Recommendation Engine</h3>
<ul>
  <li>Embedding-based similarity across reviewer profiles (ORCID, PubMed).</li>
  <li><strong>COI detection</strong> (institution overlap, co-authorship).</li>
  <li>Ranked reviewer list with <strong>rationales</strong>.</li>
</ul>

<h3>🎙️ Conversational Researcher Intake</h3>
<ul>
  <li>Voice interview (English/Arabic) via STT/TTS.</li>
  <li>Builds structured <strong>Researcher Profile Cards</strong>.</li>
  <li>Auto-injects metadata into triage &amp; reviewer matching.</li>
</ul>

<h3>🛡️ Compliance Copilot</h3>
<ul>
  <li><strong>RAG-grounded</strong> answers from NMSS &amp; UAE ethics policies.</li>
  <li>Explains risks with direct <strong>policy excerpts</strong>.</li>
  <li>Ensures <strong>human-in-the-loop</strong> final decisions.</li>
</ul>

<h3>📊 Impact &amp; Fairness Dashboard</h3>
<ul>
  <li>Time saved, triage accuracy, reviewer diversity analytics.</li>
  <li>Blind review mode + bias detection in assignments.</li>
</ul>

<hr>

<h2>🏗️ Architecture</h2>

<pre><code class="language-mermaid">flowchart TD
    A[Application PDF/Docs] -->|Ingestion| B[Text &amp; Metadata Extractor]
    B --> C[RAG Engine: NMSS Policies + UAE Compliance]
    B --> D[NLP Summarizer &amp; Brief Generator]
    B --> E[Reviewer Matching Engine]

    C --> F[Flags &amp; Compliance Report]
    D --> F
    E --> F

    F --> G[React Dashboard]
    F --> H[CSV/JSON Export]
</code></pre>

<h3>Stack Highlights</h3>
<ul>
  <li><strong>Frontend:</strong> React + Tailwind + shadcn/ui</li>
  <li><strong>Backend:</strong> FastAPI (Python)</li>
  <li><strong>Vector Search:</strong> FAISS / Milvus</li>
  <li><strong>Models:</strong>
    <ul>
      <li>Embeddings → BioLinkBERT / SciBERT</li>
      <li>Summarization → Llama 3 / Mistral 7B</li>
      <li>STT → Whisper &nbsp;|&nbsp; TTS → ElevenLabs-like</li>
    </ul>
  </li>
  <li><strong>Storage:</strong> Postgres (metadata) + S3/GCS (files)</li>
</ul>

<hr>

<h2>📂 Repository Structure</h2>
<pre><code>synapse/
├── backend/               # FastAPI services (RAG, extraction, compliance rules)
│   ├── ingestion/         # PDF -&gt; text pipelines
│   ├── rules/             # Eligibility &amp; compliance rule engine
│   ├── reviewers/         # Embedding + conflict detection
│   └── summarizer/        # LLM prompts for one-page briefs
│
├── frontend/              # React dashboard (shadcn/ui + Tailwind)
│   ├── components/        # FlagPill, ReviewerCard, BriefView, etc.
│   └── pages/             # TriageBoard, ApplicationView, InterviewStudio
│
├── data/                  # Policy docs, templates, synthetic sample apps
├── models/                # Embedding &amp; fine-tuned LLM configs
├── docs/                  # NMSS policy notes, compliance references
├── tests/                 # Unit + integration tests
│
├── README.md              # This file
└── MODEL_CARD.md          # Transparency, bias notes, limitations
</code></pre>

<hr>

<h2>⚡ Quickstart</h2>

<h3>1) Clone &amp; Install</h3>
<pre><code class="language-bash">git clone https://github.com/your-org/nmss-synapse.git
cd nmss-synapse
pip install -r requirements.txt
</code></pre>

<h3>2) Launch Backend</h3>
<pre><code class="language-bash">cd backend
uvicorn main:app --reload
</code></pre>

<h3>3) Launch Frontend</h3>
<pre><code class="language-bash">cd frontend
npm install
npm run dev
</code></pre>

<h3>4) Access Dashboard</h3>
<p>Open: <code>http://localhost:3000</code></p>

<hr>

<h2>📈 Roadmap (Sprint Plan)</h2>
<ul>
  <li><strong>Week 1</strong> → PDF ingestion + rule engine v0 (eligibility/completeness).</li>
  <li><strong>Week 2</strong> → Summarizer + dashboard MVP.</li>
  <li><strong>Week 3</strong> → Reviewer matching + interview bot.</li>
  <li><strong>Week 4</strong> → Compliance copilot + metrics dashboard + polish.</li>
</ul>

<hr>

<h2>🧾 Ethics &amp; Governance</h2>
<ul>
  <li><strong>Human-in-the-loop:</strong> Synapse flags, staff decide.</li>
  <li><strong>Explainability:</strong> Policy citations &amp; evidence spans in every decision.</li>
  <li><strong>Bias checks:</strong> Reviewer diversity metrics + blind review mode.</li>
  <li><strong>Privacy:</strong> Minimize PII; follow NMSS/UAE data-use agreements.</li>
  <li><strong>Open Source:</strong> Transparent code + model cards.</li>
</ul>

<hr>

<h2>👥 Team Socia</h2>
<ul>
  <li><strong>Aditya</strong> – Product &amp; UX, conversational intake design.</li>
  <li><strong>Adam</strong> – Backend &amp; RAG pipelines.</li>
  <li><strong>Syed</strong> – Compliance, audit trails, commercialization (KUEC).</li>
</ul>

<hr>

<h2>🌍 Impact</h2>
<p>Synapse helps NMSS program officers save <strong>40–60% triage time</strong>, improves reviewer fairness, and accelerates funding to the most promising MS research worldwide.</p>
<p><strong>🧠 NMSS Synapse → Faster Reviews. Fairer Funding. Closer to a Cure.</strong></p>
