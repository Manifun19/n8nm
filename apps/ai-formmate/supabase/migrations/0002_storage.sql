-- ===========================================================================
-- AI FormMate — private storage buckets
--
-- Every bucket is PRIVATE. Files are only ever reached through short-lived
-- signed URLs created server-side for the owning user.
-- Object keys are namespaced as `<user_id>/<...>` and the policies below
-- enforce that the first path segment equals the caller's uid.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('documents',  'documents',  false, 20971520,
    array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('photos',     'photos',     false, 5242880,
    array['image/jpeg', 'image/png', 'image/webp']),
  ('signatures', 'signatures', false, 5242880,
    array['image/jpeg', 'image/png', 'image/webp']),
  ('screenshots','screenshots',false, 10485760,
    array['image/jpeg', 'image/png', 'image/webp']),
  ('application-pdfs', 'application-pdfs', false, 20971520,
    array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

do $$
declare
  b text;
begin
  foreach b in array array['documents', 'photos', 'signatures', 'screenshots', 'application-pdfs']
  loop
    execute format('drop policy if exists %I on storage.objects', b || '_owner_select');
    execute format($f$
      create policy %I on storage.objects for select to authenticated
      using (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)
    $f$, b || '_owner_select', b);

    execute format('drop policy if exists %I on storage.objects', b || '_owner_insert');
    execute format($f$
      create policy %I on storage.objects for insert to authenticated
      with check (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)
    $f$, b || '_owner_insert', b);

    execute format('drop policy if exists %I on storage.objects', b || '_owner_update');
    execute format($f$
      create policy %I on storage.objects for update to authenticated
      using (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)
    $f$, b || '_owner_update', b, b);

    execute format('drop policy if exists %I on storage.objects', b || '_owner_delete');
    execute format($f$
      create policy %I on storage.objects for delete to authenticated
      using (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)
    $f$, b || '_owner_delete', b);
  end loop;
end $$;
