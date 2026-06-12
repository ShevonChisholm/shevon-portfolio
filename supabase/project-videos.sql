-- Run this once in the Supabase SQL editor if project_videos has not been created.
-- The application keeps projects.video_url as a backwards-compatible fallback.

create table if not exists public.project_videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  video_type text not null default 'demo'
    check (
      video_type in (
        'website_walkthrough',
        'admin_cms_walkthrough',
        'mobile_experience',
        'technical_backend',
        'demo',
        'other'
      )
    ),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_videos_project_id_sort_order_idx
  on public.project_videos (project_id, sort_order);

alter table public.project_videos enable row level security;

drop policy if exists "Published project videos are publicly readable"
  on public.project_videos;
create policy "Published project videos are publicly readable"
  on public.project_videos
  for select
  using (is_published = true);

drop policy if exists "Portfolio admins can manage project videos"
  on public.project_videos;
create policy "Portfolio admins can manage project videos"
  on public.project_videos
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.admin_profiles
      where admin_profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_profiles
      where admin_profiles.user_id = auth.uid()
    )
  );

grant select on public.project_videos to anon, authenticated;
grant insert, update, delete on public.project_videos to authenticated;
