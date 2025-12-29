-- Create enum type for plan
CREATE TYPE plan AS ENUM ('free', 'pro', 'free_trial_over');

-- Create tables
CREATE TABLE organization (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    name TEXT,
    image_url TEXT,
    allowed_responses_count INTEGER,
    plan plan
);

CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    email TEXT,
    organization_id TEXT REFERENCES organization(id)
);

CREATE TABLE interviewer (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    agent_id TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    audio TEXT,
    empathy INTEGER NOT NULL,
    exploration INTEGER NOT NULL,
    rapport INTEGER NOT NULL,
    speed INTEGER NOT NULL
);

CREATE TABLE interview (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    name TEXT,
    description TEXT,
    objective TEXT,
    organization_id TEXT REFERENCES organization(id),
    user_id TEXT REFERENCES "user"(id),
    interviewer_id INTEGER REFERENCES interviewer(id),
    is_active BOOLEAN DEFAULT true,
    is_anonymous BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    logo_url TEXT,
    theme_color TEXT,
    url TEXT,
    readable_slug TEXT,
    questions JSONB,
    quotes JSONB[],
    insights TEXT[],
    respondents TEXT[],
    question_count INTEGER,
    response_count INTEGER,
    time_duration TEXT
);

CREATE TABLE response (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    interview_id TEXT REFERENCES interview(id),
    name TEXT,
    email TEXT,
    call_id TEXT,
    candidate_status TEXT,
    duration INTEGER,
    details JSONB,
    analytics JSONB,
    is_analysed BOOLEAN DEFAULT false,
    is_ended BOOLEAN DEFAULT false,
    is_viewed BOOLEAN DEFAULT false,
    tab_switch_count INTEGER
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    interview_id TEXT REFERENCES interview(id),
    email TEXT,
    feedback TEXT,
    satisfaction INTEGER
);

CREATE TABLE job (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    organization_id TEXT REFERENCES organization(id) NOT NULL,
    user_id TEXT REFERENCES "user"(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_type TEXT NOT NULL,
    location_details TEXT,
    employment_type TEXT NOT NULL,
    skills JSONB NOT NULL,
    experience TEXT NOT NULL,
    qualifications JSONB NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    benefits JSONB,
    deadline TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    openings INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    application_count INTEGER DEFAULT 0
);

CREATE TABLE job_application (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    job_id TEXT REFERENCES job(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    resume_text TEXT,
    cover_letter TEXT,
    ats_analysis JSONB,
    ats_score INTEGER,
    status TEXT DEFAULT 'new',
    is_viewed BOOLEAN DEFAULT false,
    interview_id TEXT REFERENCES interview(id),
    source TEXT DEFAULT 'careers_page'
);

-- Indexes for performance
CREATE INDEX idx_job_organization ON job(organization_id);
CREATE INDEX idx_job_active ON job(is_active, is_archived);
CREATE INDEX idx_job_deadline ON job(deadline);
CREATE INDEX idx_application_job ON job_application(job_id);
CREATE INDEX idx_application_status ON job_application(status);
CREATE INDEX idx_application_ats_score ON job_application(ats_score DESC);
CREATE INDEX idx_application_email ON job_application(email);
