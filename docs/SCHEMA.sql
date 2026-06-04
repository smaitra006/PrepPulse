-- PrepPulse Initial Database Schema

-- 1. Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Global Problem Library
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) UNIQUE NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    platform VARCHAR(50),
    topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL
);

-- 3. User Problem Tracking (Intersection Table)
CREATE TABLE user_problem_status (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'unsolved' CHECK (status IN ('unsolved', 'solved', 'revisiting', 'bookmarked', 'skipped')),
    notes TEXT,
    revision_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, problem_id)
);

-- 4. Global Companies Library
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100)
);

-- 5. User Company Applications (Intersection Table)
CREATE TABLE user_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'not applied' CHECK (status IN ('not applied', 'applied', 'OA pending', 'interview scheduled', 'rejected', 'offer received')),
    applied_date DATE,
    deadline DATE,
    priority VARCHAR(10) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id, role)
);
