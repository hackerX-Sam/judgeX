-- =====================================================================
-- ⚡ JUDGEX PRODUCTION SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =====================================================================
-- Execute this script in your Supabase SQL Editor (https://app.supabase.com)
-- =====================================================================

-- Enable required UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Developer',
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    country TEXT,
    institution TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2. PROBLEMS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL, -- Markdown problem statement
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    constraints TEXT,
    input_format TEXT,
    output_format TEXT,
    examples JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    time_limit INTEGER NOT NULL DEFAULT 1000, -- Milliseconds
    memory_limit INTEGER NOT NULL DEFAULT 256, -- Megabytes
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 3. TEST CASES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN NOT NULL DEFAULT false, -- true for sample testcases, false for hidden evaluation testcases
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 4. SUBMISSIONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    language TEXT NOT NULL CHECK (language IN ('cpp', 'python', 'javascript', 'typescript', 'c', 'go', 'rust', 'java')),
    source_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'COMPILATION_ERROR', 'RUNTIME_ERROR')),
    execution_time INTEGER, -- in ms
    memory_used INTEGER, -- in MB
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. USER PROBLEM PROGRESS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_problem_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ATTEMPTED' CHECK (status IN ('ATTEMPTED', 'SOLVED')),
    best_submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
    solved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

-- =====================================================================
-- ⚡ PERFORMANCE INDEXES
-- =====================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_problems_slug ON public.problems(slug);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_published ON public.problems(is_published);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem ON public.submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.user_problem_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_problem ON public.test_cases(problem_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_sample ON public.test_cases(is_sample);

-- =====================================================================
-- ⚡ AUTOMATIC USER PROFILE CREATION TRIGGER ON SIGNUP
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_username TEXT;
BEGIN
    assigned_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::text FROM 1 FOR 6)
    );

    INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        assigned_username,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Developer'),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    )
    ON CONFLICT (id) DO UPDATE
    SET updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problem_progress ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- RLS POLICIES: PROFILES
-- ---------------------------------------------------------------------
-- Anyone can view user profile summaries
CREATE POLICY "Public profiles are readable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- ---------------------------------------------------------------------
-- RLS POLICIES: PROBLEMS
-- ---------------------------------------------------------------------
-- Public users can view published problems. Admins can view all problems.
CREATE POLICY "Published problems are readable by everyone" 
    ON public.problems FOR SELECT 
    USING (
        is_published = true 
        OR (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        ))
    );

-- Only Admins can insert, update, or delete problems
CREATE POLICY "Admins can insert problems" 
    ON public.problems FOR INSERT 
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update problems" 
    ON public.problems FOR UPDATE 
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete problems" 
    ON public.problems FOR DELETE 
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ---------------------------------------------------------------------
-- RLS POLICIES: TEST CASES (CRITICAL SECURITY)
-- ---------------------------------------------------------------------
-- Public/Authenticated normal users CAN ONLY READ sample testcases.
-- Hidden testcases (is_sample = false) are STRICTLY BLOCKED from direct client queries.
CREATE POLICY "Sample testcases are readable by authenticated users" 
    ON public.test_cases FOR SELECT 
    USING (
        is_sample = true 
        OR (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        ))
    );

-- Only Admins can manage testcases
CREATE POLICY "Admins can manage testcases" 
    ON public.test_cases FOR ALL 
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ---------------------------------------------------------------------
-- RLS POLICIES: SUBMISSIONS
-- ---------------------------------------------------------------------
-- Users can read their own submissions. Admins can read all.
CREATE POLICY "Users can view own submissions" 
    ON public.submissions FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Authenticated users can insert their own submission
CREATE POLICY "Users can insert own submission" 
    ON public.submissions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- RLS POLICIES: USER PROBLEM PROGRESS
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view own progress" 
    ON public.user_problem_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress" 
    ON public.user_problem_progress FOR ALL 
    USING (auth.uid() = user_id);

-- =====================================================================
-- ⚡ INITIAL SEED DATA FOR PROBLEMS & TESTCASES
-- =====================================================================

INSERT INTO public.problems (id, title, slug, description, difficulty, constraints, input_format, output_format, examples, tags, time_limit, memory_limit, is_published)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Two Sum',
    'two-sum',
    'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    'Easy',
    '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    'First line contains array nums as space-separated integers. Second line contains target integer.',
    'Two space-separated indices representing the positions of the two numbers.',
    '[{"input": "2 7 11 15\\n9", "output": "0 1", "explanation": "nums[0] + nums[1] == 9, so return [0, 1]"}, {"input": "3 2 4\\n6", "output": "1 2"}]'::jsonb,
    ARRAY['Array', 'Hash Table'],
    1000,
    256,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Valid Parentheses',
    'valid-parentheses',
    'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    'Easy',
    '1 <= s.length <= 10^4\ns consists of parentheses only `()[]{}`.',
    'A single string s.',
    'Output true if valid, false otherwise.',
    '[{"input": "()[]{}", "output": "true"}, {"input": "(]", "output": "false"}]'::jsonb,
    ARRAY['String', 'Stack'],
    1000,
    256,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Reverse Linked List',
    'reverse-linked-list',
    'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    'Easy',
    '0 <= Number of nodes <= 5000\n-5000 <= Node.val <= 5000',
    'Space-separated list of node values.',
    'Reversed space-separated list of values.',
    '[{"input": "1 2 3 4 5", "output": "5 4 3 2 1"}]'::jsonb,
    ARRAY['Linked List', 'Recursion'],
    1000,
    256,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Sample and Hidden Test Cases
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample)
VALUES
-- Two Sum
('11111111-1111-1111-1111-111111111111', '2 7 11 15' || chr(10) || '9', '0 1', true),
('11111111-1111-1111-1111-111111111111', '3 2 4' || chr(10) || '6', '1 2', true),
('11111111-1111-1111-1111-111111111111', '3 3' || chr(10) || '6', '0 1', false), -- Hidden testcase
('11111111-1111-1111-1111-111111111111', '1 5 8 19 24 33' || chr(10) || '42', '3 4', false), -- Hidden testcase

-- Valid Parentheses
('22222222-2222-2222-2222-222222222222', '()[]{}', 'true', true),
('22222222-2222-2222-2222-222222222222', '(]', 'false', true),
('22222222-2222-2222-2222-222222222222', '{[]}', 'true', false), -- Hidden testcase
('22222222-2222-2222-2222-222222222222', '((((((', 'false', false) -- Hidden testcase
ON CONFLICT DO NOTHING;
