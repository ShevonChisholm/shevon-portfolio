-- Portfolio CMS Storage policies
--
-- Run this script in the Supabase SQL Editor after creating:
--   - portfolio-media
--   - portfolio-documents
--
-- These policies authorize only authenticated users whose auth.users.id
-- matches admin_profiles.user_id. They do not use or expose a service-role key.
-- Supabase Storage already enables RLS on storage.objects. Do not attempt to
-- alter that managed table from the Dashboard SQL Editor.

drop policy if exists "Portfolio admins can insert media" on storage.objects;
create policy "Portfolio admins can insert media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] in ('projects', 'blog')
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Portfolio admins can update media" on storage.objects;
create policy "Portfolio admins can update media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] in ('projects', 'blog')
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] in ('projects', 'blog')
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Portfolio admins can delete media" on storage.objects;
create policy "Portfolio admins can delete media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] in ('projects', 'blog')
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Portfolio admins can select media" on storage.objects;
create policy "Portfolio admins can select media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] in ('projects', 'blog')
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Portfolio admins can insert documents" on storage.objects;
create policy "Portfolio admins can insert documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-documents'
  and (storage.foldername(name))[1] in ('documents', 'projects')
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Portfolio admins can update documents" on storage.objects;
create policy "Portfolio admins can update documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-documents'
  and (storage.foldername(name))[1] in ('documents', 'projects')
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'portfolio-documents'
  and (storage.foldername(name))[1] in ('documents', 'projects')
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Portfolio admins can delete documents" on storage.objects;
create policy "Portfolio admins can delete documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-documents'
  and (storage.foldername(name))[1] in ('documents', 'projects')
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Portfolio admins can select documents" on storage.objects;
create policy "Portfolio admins can select documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'portfolio-documents'
  and (storage.foldername(name))[1] in ('documents', 'projects')
  and exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  )
);

-- Verification helpers:
--
-- Confirm buckets and their public setting:
-- select id, name, public from storage.buckets
-- where id in ('portfolio-media', 'portfolio-documents');
--
-- Confirm the authenticated admin mapping:
-- select id, user_id from public.admin_profiles;
--
-- List active policies:
-- select policyname, cmd, roles, qual, with_check
-- from pg_policies
-- where schemaname = 'storage' and tablename = 'objects'
-- order by policyname;
