-- NMSS Synapse Database Schema
-- Comprehensive SQL script for Supabase integration
-- Includes all tables for applications, ARL assessments, scholar profiles, and reviewer matching

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'under_review', 'decision_pending', 'awarded', 'rejected');
CREATE TYPE reviewer_availability AS ENUM ('available', 'busy', 'unavailable');
CREATE TYPE funding_status AS ENUM ('completed', 'ongoing', 'pending');
CREATE TYPE media_sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE arl_level AS ENUM ('1', '2', '3', '4', '5', '6', '7', '8', '9');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    department VARCHAR(255),
    role VARCHAR(50) DEFAULT 'applicant', -- applicant, reviewer, admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    keywords TEXT[],
    budget DECIMAL(15,2),
    duration VARCHAR(50),
    status application_status DEFAULT 'draft',
    submitted_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application documents table
CREATE TABLE public.application_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- proposal, ethics, coi, cv, collaboration_letter
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application flags table
CREATE TABLE public.application_flags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    flag_type VARCHAR(50) NOT NULL, -- eligibility, compliance, conflict
    flag_message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scholar profiles table
CREATE TABLE public.scholar_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) UNIQUE NOT NULL,
    h_index INTEGER DEFAULT 0,
    total_citations INTEGER DEFAULT 0,
    last_5y_pubs INTEGER DEFAULT 0,
    reputation_score DECIMAL(5,2) DEFAULT 0,
    ms_relevance DECIMAL(5,2) DEFAULT 0,
    expertise TEXT[],
    topics TEXT[],
    collaboration_network TEXT[],
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Publications table
CREATE TABLE public.publications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scholar_profile_id UUID REFERENCES public.scholar_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    authors TEXT[],
    year INTEGER,
    journal VARCHAR(255),
    citations INTEGER DEFAULT 0,
    abstract TEXT,
    keywords TEXT[],
    ms_relevance DECIMAL(5,2) DEFAULT 0,
    impact_factor DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funding history table
CREATE TABLE public.funding_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scholar_profile_id UUID REFERENCES public.scholar_profiles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    agency VARCHAR(255),
    amount DECIMAL(15,2),
    year INTEGER,
    status funding_status,
    ms_related BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News profiles table
CREATE TABLE public.news_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) UNIQUE NOT NULL,
    mentions INTEGER DEFAULT 0,
    controversies TEXT[],
    risk_flags TEXT[],
    media_sentiment media_sentiment DEFAULT 'neutral',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News items table
CREATE TABLE public.news_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    news_profile_id UUID REFERENCES public.news_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source VARCHAR(255),
    date TIMESTAMP WITH TIME ZONE,
    sentiment media_sentiment DEFAULT 'neutral',
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviewers table
CREATE TABLE public.reviewers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) UNIQUE NOT NULL,
    expertise TEXT[],
    topics TEXT[],
    availability reviewer_availability DEFAULT 'available',
    reputation_score DECIMAL(5,2) DEFAULT 0,
    ms_relevance DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviewer conflicts table
CREATE TABLE public.reviewer_conflicts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reviewer_id UUID REFERENCES public.reviewers(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL, -- institutional, collaboration, personal
    conflict_description TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ARL assessments table
CREATE TABLE public.arl_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) UNIQUE NOT NULL,
    start_arl arl_level,
    goal_arl arl_level,
    current_arl arl_level,
    confidence DECIMAL(5,2) DEFAULT 0,
    rationale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ARL milestones table
CREATE TABLE public.arl_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    arl_assessment_id UUID REFERENCES public.arl_assessments(id) ON DELETE CASCADE,
    level arl_level NOT NULL,
    milestone_code VARCHAR(10) NOT NULL,
    met BOOLEAN DEFAULT FALSE,
    evidence_doc VARCHAR(255),
    evidence_quote TEXT,
    evidence_span JSONB, -- {start: number, end: number, page: number}
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STB interview answers table
CREATE TABLE public.stb_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    normalized_answer JSONB,
    evidence_links JSONB, -- [{doc: string, quote: string, slide: number}]
    confidence DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Benchmark scores table
CREATE TABLE public.benchmark_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) UNIQUE NOT NULL,
    feasibility DECIMAL(5,2) DEFAULT 0,
    novelty DECIMAL(5,2) DEFAULT 0,
    reproducibility DECIMAL(5,2) DEFAULT 0,
    budget_realism DECIMAL(5,2) DEFAULT 0,
    ethics DECIMAL(5,2) DEFAULT 0,
    reviewer_fit DECIMAL(5,2) DEFAULT 0,
    composite_score DECIMAL(5,2) DEFAULT 0,
    notes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External signals table
CREATE TABLE public.external_signals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) UNIQUE NOT NULL,
    h_index INTEGER DEFAULT 0,
    total_citations INTEGER DEFAULT 0,
    last_5y_pubs INTEGER DEFAULT 0,
    topics TEXT[],
    news_mentions INTEGER DEFAULT 0,
    risk_flags TEXT[],
    reputation_score DECIMAL(5,2) DEFAULT 0,
    rationale TEXT,
    rebuttal_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviewer assignments table
CREATE TABLE public.reviewer_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.reviewers(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.users(id),
    match_score DECIMAL(5,2) DEFAULT 0,
    match_reasons TEXT[],
    status VARCHAR(20) DEFAULT 'assigned', -- assigned, accepted, declined, completed
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(application_id, reviewer_id)
);

-- Reviewer reviews table
CREATE TABLE public.reviewer_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.reviewer_assignments(id) ON DELETE CASCADE,
    scientific_merit DECIMAL(5,2),
    feasibility DECIMAL(5,2),
    innovation DECIMAL(5,2),
    budget_appropriateness DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    comments TEXT,
    recommendation VARCHAR(20), -- approve, reject, revise
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE public.audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    actor_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- application, review, assessment
    target_id UUID NOT NULL,
    before_data JSONB,
    after_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_submitted_date ON public.applications(submitted_date);

CREATE INDEX idx_scholar_profiles_user_id ON public.scholar_profiles(user_id);
CREATE INDEX idx_scholar_profiles_ms_relevance ON public.scholar_profiles(ms_relevance);
CREATE INDEX idx_scholar_profiles_reputation_score ON public.scholar_profiles(reputation_score);

CREATE INDEX idx_publications_scholar_profile_id ON public.publications(scholar_profile_id);
CREATE INDEX idx_publications_year ON public.publications(year);
CREATE INDEX idx_publications_ms_relevance ON public.publications(ms_relevance);

CREATE INDEX idx_reviewers_availability ON public.reviewers(availability);
CREATE INDEX idx_reviewers_ms_relevance ON public.reviewers(ms_relevance);

CREATE INDEX idx_arl_assessments_application_id ON public.arl_assessments(application_id);
CREATE INDEX idx_arl_milestones_assessment_id ON public.arl_milestones(arl_assessment_id);
CREATE INDEX idx_arl_milestones_level ON public.arl_milestones(level);

CREATE INDEX idx_stb_answers_application_id ON public.stb_answers(application_id);
CREATE INDEX idx_benchmark_scores_application_id ON public.benchmark_scores(application_id);
CREATE INDEX idx_external_signals_application_id ON public.external_signals(application_id);

CREATE INDEX idx_reviewer_assignments_application_id ON public.reviewer_assignments(application_id);
CREATE INDEX idx_reviewer_assignments_reviewer_id ON public.reviewer_assignments(reviewer_id);
CREATE INDEX idx_reviewer_assignments_status ON public.reviewer_assignments(status);

CREATE INDEX idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX idx_audit_log_target ON public.audit_log(target_type, target_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);

-- Create full-text search indexes
CREATE INDEX idx_applications_title_search ON public.applications USING gin(to_tsvector('english', title));
CREATE INDEX idx_applications_abstract_search ON public.applications USING gin(to_tsvector('english', abstract));
CREATE INDEX idx_publications_title_search ON public.publications USING gin(to_tsvector('english', title));
CREATE INDEX idx_publications_abstract_search ON public.publications USING gin(to_tsvector('english', abstract));

-- Create functions for common operations

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scholar_profiles_updated_at BEFORE UPDATE ON public.scholar_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviewers_updated_at BEFORE UPDATE ON public.reviewers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_arl_assessments_updated_at BEFORE UPDATE ON public.arl_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_benchmark_scores_updated_at BEFORE UPDATE ON public.benchmark_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_external_signals_updated_at BEFORE UPDATE ON public.external_signals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate ARL progress
CREATE OR REPLACE FUNCTION calculate_arl_progress(assessment_id UUID)
RETURNS TABLE(
    current_arl INTEGER,
    met_milestones INTEGER,
    total_milestones INTEGER,
    progress_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CAST(aa.current_arl AS INTEGER) as current_arl,
        COUNT(CASE WHEN am.met = TRUE THEN 1 END)::INTEGER as met_milestones,
        COUNT(am.id)::INTEGER as total_milestones,
        CASE 
            WHEN COUNT(am.id) > 0 THEN 
                (COUNT(CASE WHEN am.met = TRUE THEN 1 END)::DECIMAL / COUNT(am.id)::DECIMAL) * 100
            ELSE 0
        END as progress_percentage
    FROM public.arl_assessments aa
    LEFT JOIN public.arl_milestones am ON aa.id = am.arl_assessment_id
    WHERE aa.id = assessment_id
    GROUP BY aa.current_arl;
END;
$$ LANGUAGE plpgsql;

-- Function to get reviewer match score
CREATE OR REPLACE FUNCTION calculate_reviewer_match_score(
    app_id UUID,
    reviewer_id UUID
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    match_score DECIMAL(5,2) := 0;
    app_topics TEXT[];
    reviewer_topics TEXT[];
    topic_overlap INTEGER;
    ms_relevance_match DECIMAL(5,2);
    reputation_score DECIMAL(5,2);
    availability_score DECIMAL(5,2);
BEGIN
    -- Get application topics from scholar profile
    SELECT sp.topics INTO app_topics
    FROM public.applications a
    JOIN public.scholar_profiles sp ON a.user_id = sp.user_id
    WHERE a.id = app_id;
    
    -- Get reviewer topics
    SELECT r.topics INTO reviewer_topics
    FROM public.reviewers r
    WHERE r.id = reviewer_id;
    
    -- Calculate topic overlap (40% weight)
    SELECT COUNT(*) INTO topic_overlap
    FROM unnest(app_topics) AS app_topic
    WHERE EXISTS (
        SELECT 1 FROM unnest(reviewer_topics) AS rev_topic
        WHERE rev_topic ILIKE '%' || app_topic || '%'
    );
    
    IF array_length(app_topics, 1) > 0 THEN
        match_score := match_score + (topic_overlap::DECIMAL / array_length(app_topics, 1)::DECIMAL) * 40;
    END IF;
    
    -- Get MS relevance match (30% weight)
    SELECT 
        (100 - ABS(sp.ms_relevance - r.ms_relevance)) * 0.3
    INTO ms_relevance_match
    FROM public.applications a
    JOIN public.scholar_profiles sp ON a.user_id = sp.user_id
    JOIN public.reviewers r ON r.id = reviewer_id
    WHERE a.id = app_id;
    
    match_score := match_score + COALESCE(ms_relevance_match, 0);
    
    -- Get reputation score (20% weight)
    SELECT r.reputation_score * 0.2
    INTO reputation_score
    FROM public.reviewers r
    WHERE r.id = reviewer_id;
    
    match_score := match_score + COALESCE(reputation_score, 0);
    
    -- Get availability score (10% weight)
    SELECT 
        CASE 
            WHEN r.availability = 'available' THEN 100 * 0.1
            WHEN r.availability = 'busy' THEN 50 * 0.1
            ELSE 0
        END
    INTO availability_score
    FROM public.reviewers r
    WHERE r.id = reviewer_id;
    
    match_score := match_score + COALESCE(availability_score, 0);
    
    RETURN LEAST(match_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended reviewers
CREATE OR REPLACE FUNCTION get_recommended_reviewers(app_id UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
    reviewer_id UUID,
    reviewer_name VARCHAR(255),
    reviewer_email VARCHAR(255),
    institution VARCHAR(255),
    match_score DECIMAL(5,2),
    expertise TEXT[],
    topics TEXT[],
    availability reviewer_availability,
    reputation_score DECIMAL(5,2),
    ms_relevance DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as reviewer_id,
        u.name as reviewer_name,
        u.email as reviewer_email,
        u.institution,
        calculate_reviewer_match_score(app_id, r.id) as match_score,
        r.expertise,
        r.topics,
        r.availability,
        r.reputation_score,
        r.ms_relevance
    FROM public.reviewers r
    JOIN public.users u ON r.user_id = u.id
    WHERE r.availability != 'unavailable'
    ORDER BY calculate_reviewer_match_score(app_id, r.id) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    actor_uuid UUID,
    action_name VARCHAR(100),
    target_type_name VARCHAR(50),
    target_uuid UUID,
    before_json JSONB DEFAULT NULL,
    after_json JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_log (
        actor_id, action, target_type, target_id, before_data, after_data
    ) VALUES (
        actor_uuid, action_name, target_type_name, target_uuid, before_json, after_json
    );
END;
$$ LANGUAGE plpgsql;

-- Create views for common queries

-- View for application summaries
CREATE VIEW application_summaries AS
SELECT 
    a.id,
    a.title,
    a.status,
    a.submitted_date,
    a.due_date,
    u.name as applicant_name,
    u.institution,
    aa.current_arl,
    aa.goal_arl,
    bs.composite_score,
    COUNT(ra.id) as assigned_reviewers,
    COUNT(CASE WHEN ra.status = 'completed' THEN 1 END) as completed_reviews
FROM public.applications a
JOIN public.users u ON a.user_id = u.id
LEFT JOIN public.arl_assessments aa ON a.id = aa.application_id
LEFT JOIN public.benchmark_scores bs ON a.id = bs.application_id
LEFT JOIN public.reviewer_assignments ra ON a.id = ra.application_id
GROUP BY a.id, a.title, a.status, a.submitted_date, a.due_date, u.name, u.institution, aa.current_arl, aa.goal_arl, bs.composite_score;

-- View for reviewer profiles
CREATE VIEW reviewer_profiles AS
SELECT 
    r.id,
    u.name,
    u.email,
    u.institution,
    r.expertise,
    r.topics,
    r.availability,
    r.reputation_score,
    r.ms_relevance,
    sp.h_index,
    sp.total_citations,
    sp.last_5y_pubs
FROM public.reviewers r
JOIN public.users u ON r.user_id = u.id
LEFT JOIN public.scholar_profiles sp ON r.user_id = sp.user_id;

-- View for ARL progress
CREATE VIEW arl_progress_view AS
SELECT 
    aa.id as assessment_id,
    aa.application_id,
    aa.current_arl,
    aa.goal_arl,
    aa.confidence,
    COUNT(am.id) as total_milestones,
    COUNT(CASE WHEN am.met = TRUE THEN 1 END) as met_milestones,
    CASE 
        WHEN COUNT(am.id) > 0 THEN 
            (COUNT(CASE WHEN am.met = TRUE THEN 1 END)::DECIMAL / COUNT(am.id)::DECIMAL) * 100
        ELSE 0
    END as progress_percentage
FROM public.arl_assessments aa
LEFT JOIN public.arl_milestones am ON aa.id = am.arl_assessment_id
GROUP BY aa.id, aa.application_id, aa.current_arl, aa.goal_arl, aa.confidence;

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholar_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arl_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arl_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stb_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can read their own applications
CREATE POLICY "Users can read own applications" ON public.applications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "Users can create own applications" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own applications
CREATE POLICY "Users can update own applications" ON public.applications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can read their own application documents
CREATE POLICY "Users can read own application documents" ON public.application_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications a 
            WHERE a.id = application_documents.application_id 
            AND a.user_id = auth.uid()
        )
    );

-- Users can read their own scholar profiles
CREATE POLICY "Users can read own scholar profiles" ON public.scholar_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own scholar profiles
CREATE POLICY "Users can update own scholar profiles" ON public.scholar_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can read their own publications
CREATE POLICY "Users can read own publications" ON public.publications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.scholar_profiles sp 
            WHERE sp.id = publications.scholar_profile_id 
            AND sp.user_id = auth.uid()
        )
    );

-- Users can read their own news profiles
CREATE POLICY "Users can read own news profiles" ON public.news_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own ARL assessments
CREATE POLICY "Users can read own ARL assessments" ON public.arl_assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications a 
            WHERE a.id = arl_assessments.application_id 
            AND a.user_id = auth.uid()
        )
    );

-- Users can read their own STB answers
CREATE POLICY "Users can read own STB answers" ON public.stb_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications a 
            WHERE a.id = stb_answers.application_id 
            AND a.user_id = auth.uid()
        )
    );

-- Users can read their own benchmark scores
CREATE POLICY "Users can read own benchmark scores" ON public.benchmark_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications a 
            WHERE a.id = benchmark_scores.application_id 
            AND a.user_id = auth.uid()
        )
    );

-- Users can read their own external signals
CREATE POLICY "Users can read own external signals" ON public.external_signals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications a 
            WHERE a.id = external_signals.application_id 
            AND a.user_id = auth.uid()
        )
    );

-- Reviewers can read applications they're assigned to
CREATE POLICY "Reviewers can read assigned applications" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviewer_assignments ra 
            WHERE ra.application_id = applications.id 
            AND ra.reviewer_id IN (
                SELECT r.id FROM public.reviewers r 
                WHERE r.user_id = auth.uid()
            )
        )
    );

-- Reviewers can read their own assignments
CREATE POLICY "Reviewers can read own assignments" ON public.reviewer_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviewers r 
            WHERE r.id = reviewer_assignments.reviewer_id 
            AND r.user_id = auth.uid()
        )
    );

-- Reviewers can update their own assignments
CREATE POLICY "Reviewers can update own assignments" ON public.reviewer_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.reviewers r 
            WHERE r.id = reviewer_assignments.reviewer_id 
            AND r.user_id = auth.uid()
        )
    );

-- Reviewers can read their own reviews
CREATE POLICY "Reviewers can read own reviews" ON public.reviewer_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviewer_assignments ra 
            JOIN public.reviewers r ON ra.reviewer_id = r.id
            WHERE ra.id = reviewer_reviews.assignment_id 
            AND r.user_id = auth.uid()
        )
    );

-- Reviewers can create their own reviews
CREATE POLICY "Reviewers can create own reviews" ON public.reviewer_reviews
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.reviewer_assignments ra 
            JOIN public.reviewers r ON ra.reviewer_id = r.id
            WHERE ra.id = reviewer_reviews.assignment_id 
            AND r.user_id = auth.uid()
        )
    );

-- Admins can read all data (assuming admin role is stored in users.role)
CREATE POLICY "Admins can read all data" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Create sample data for development
INSERT INTO public.users (id, email, name, institution, department, role) VALUES
    (uuid_generate_v4(), 'admin@nmss.org', 'Admin User', 'NMSS', 'Administration', 'admin'),
    (uuid_generate_v4(), 'sarah.johnson@uc.edu', 'Dr. Sarah Johnson', 'University of California', 'Department of Neuroscience', 'applicant'),
    (uuid_generate_v4(), 'michael.chen@jhu.edu', 'Dr. Michael Chen', 'Johns Hopkins University', 'Department of Neurology', 'applicant'),
    (uuid_generate_v4(), 'lisa.rodriguez@stanford.edu', 'Dr. Lisa Rodriguez', 'Stanford University', 'Department of Physical Medicine', 'applicant'),
    (uuid_generate_v4(), 'emily.watson@harvard.edu', 'Dr. Emily Watson', 'Harvard Medical School', 'Department of Neurology', 'reviewer'),
    (uuid_generate_v4(), 'james.wilson@mit.edu', 'Dr. James Wilson', 'MIT', 'Department of Computer Science', 'reviewer'),
    (uuid_generate_v4(), 'maria.garcia@ucsf.edu', 'Dr. Maria Garcia', 'UCSF', 'Department of Neurology', 'reviewer');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a function to initialize a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, institution, department, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'institution', ''),
        COALESCE(NEW.raw_user_meta_data->>'department', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'applicant')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to get application statistics
CREATE OR REPLACE FUNCTION get_application_stats()
RETURNS TABLE(
    total_applications BIGINT,
    under_review BIGINT,
    awarded BIGINT,
    rejected BIGINT,
    pending BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'awarded' THEN 1 END) as awarded,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status IN ('draft', 'submitted') THEN 1 END) as pending
    FROM public.applications;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get reviewer statistics
CREATE OR REPLACE FUNCTION get_reviewer_stats()
RETURNS TABLE(
    total_reviewers BIGINT,
    available BIGINT,
    busy BIGINT,
    unavailable BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reviewers,
        COUNT(CASE WHEN availability = 'available' THEN 1 END) as available,
        COUNT(CASE WHEN availability = 'busy' THEN 1 END) as busy,
        COUNT(CASE WHEN availability = 'unavailable' THEN 1 END) as unavailable
    FROM public.reviewers;
END;
$$ LANGUAGE plpgsql;

-- Create a function to search applications
CREATE OR REPLACE FUNCTION search_applications(search_query TEXT)
RETURNS TABLE(
    id UUID,
    title VARCHAR(500),
    applicant_name VARCHAR(255),
    institution VARCHAR(255),
    status application_status,
    submitted_date TIMESTAMP WITH TIME ZONE,
    current_arl arl_level,
    composite_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        u.name as applicant_name,
        u.institution,
        a.status,
        a.submitted_date,
        aa.current_arl,
        bs.composite_score
    FROM public.applications a
    JOIN public.users u ON a.user_id = u.id
    LEFT JOIN public.arl_assessments aa ON a.id = aa.application_id
    LEFT JOIN public.benchmark_scores bs ON a.id = bs.application_id
    WHERE 
        a.title ILIKE '%' || search_query || '%' OR
        u.name ILIKE '%' || search_query || '%' OR
        u.institution ILIKE '%' || search_query || '%' OR
        a.abstract ILIKE '%' || search_query || '%'
    ORDER BY a.submitted_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to search reviewers
CREATE OR REPLACE FUNCTION search_reviewers(search_query TEXT)
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    email VARCHAR(255),
    institution VARCHAR(255),
    expertise TEXT[],
    topics TEXT[],
    availability reviewer_availability,
    reputation_score DECIMAL(5,2),
    ms_relevance DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        u.name,
        u.email,
        u.institution,
        r.expertise,
        r.topics,
        r.availability,
        r.reputation_score,
        r.ms_relevance
    FROM public.reviewers r
    JOIN public.users u ON r.user_id = u.id
    WHERE 
        u.name ILIKE '%' || search_query || '%' OR
        u.institution ILIKE '%' || search_query || '%' OR
        EXISTS (
            SELECT 1 FROM unnest(r.expertise) AS exp
            WHERE exp ILIKE '%' || search_query || '%'
        ) OR
        EXISTS (
            SELECT 1 FROM unnest(r.topics) AS topic
            WHERE topic ILIKE '%' || search_query || '%'
        )
    ORDER BY r.reputation_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Final comments
COMMENT ON DATABASE postgres IS 'NMSS Synapse Database - Comprehensive grant management system with ARL assessment and reviewer matching';
COMMENT ON TABLE public.applications IS 'Main applications table storing grant proposals';
COMMENT ON TABLE public.arl_assessments IS 'ARL (Application Readiness Level) assessments for applications';
COMMENT ON TABLE public.scholar_profiles IS 'Academic profiles with h-index, citations, and expertise';
COMMENT ON TABLE public.reviewers IS 'Reviewer profiles with expertise and availability';
COMMENT ON TABLE public.benchmark_scores IS 'Multi-dimensional benchmark scores for applications';
COMMENT ON TABLE public.external_signals IS 'External reputation signals from news and academic databases';

-- End of SYNAPSE_DB.sql
