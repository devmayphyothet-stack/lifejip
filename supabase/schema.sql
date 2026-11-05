-- LifeJip V1 + V2 Supabase Database Schema
-- Offline-first cloud sync tables for admin_guides, recycling_items, medical_symptoms, situation_vocabs, and user_sync_profiles

create extension if not exists "uuid-ossp";

-- 1. Admin Guides & Step-by-Step Checklists
create table if not exists public.admin_guides (
  id text primary key,
  category text not null check (category in ('arc', 'visa', 'banking', 'housing')),
  title_ko text not null,
  title_mm text not null,
  subtitle_mm text not null,
  badge_text text not null,
  estimated_time text not null,
  official_url text,
  steps jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 2. Recycling Rules (분리수거)
create table if not exists public.recycling_items (
  id text primary key,
  category text not null check (category in ('general', 'food', 'plastic', 'vinyl', 'can_glass', 'paper')),
  category_ko text not null,
  category_mm text not null,
  name_ko text not null,
  name_mm text not null,
  how_to_dispose_mm text not null,
  warning_mm text not null,
  keywords text[] not null default '{}',
  bag_type_ko text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 3. Medical Symptoms & Clinic Department Mapping
create table if not exists public.medical_symptoms (
  id text primary key,
  body_part text not null check (body_part in ('head', 'throat_resp', 'stomach', 'dental', 'skin', 'joint_muscle', 'eye_ear')),
  symptom_ko text not null,
  doctor_sentence_ko text not null,
  symptom_mm text not null,
  pronunciation_mm text not null,
  department_id text not null,
  is_urgent boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 4. Situation Phrasebook (출입국, 은행, 부동산, 병원 접수, 약국)
create table if not exists public.situation_vocabs (
  id text primary key,
  category text not null check (category in ('immigration', 'bank', 'realestate', 'hospital', 'pharmacy')),
  category_ko text not null,
  category_mm text not null,
  korean text not null,
  burmese text not null,
  pronunciation_mm text not null,
  usage_tip_mm text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 5. V2 User Cloud Sync Profiles (Checklists, Bookmarks, Visa Countdown & Emergency Card)
create table if not exists public.user_sync_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_steps jsonb not null default '{}'::jsonb,
  bookmarked_phrases text[] not null default '{}',
  emergency_profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 6. V3 Community Survival Tips
create table if not exists public.community_tips (
  id text primary key,
  author_name text not null,
  author_badge text not null default '미얀마 교민',
  category_ko text not null default '생활 꿀팁',
  title_ko text not null,
  content_mm text not null,
  likes integer not null default 1,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.admin_guides enable row level security;
alter table public.recycling_items enable row level security;
alter table public.medical_symptoms enable row level security;
alter table public.situation_vocabs enable row level security;
alter table public.user_sync_profiles enable row level security;
alter table public.community_tips enable row level security;

create policy "Allow public read on community_tips"
  on public.community_tips for select using (true);

create policy "Allow public insert on community_tips"
  on public.community_tips for insert with check (true);

create policy "Allow public read on admin_guides"
  on public.admin_guides for select using (true);

create policy "Allow public read on recycling_items"
  on public.recycling_items for select using (true);

create policy "Allow public read on medical_symptoms"
  on public.medical_symptoms for select using (true);

create policy "Allow public read on situation_vocabs"
  on public.situation_vocabs for select using (true);

create policy "Users can view own sync profile"
  on public.user_sync_profiles for select using (auth.uid() = user_id);

create policy "Users can upsert own sync profile"
  on public.user_sync_profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own sync profile"
  on public.user_sync_profiles for update using (auth.uid() = user_id);
