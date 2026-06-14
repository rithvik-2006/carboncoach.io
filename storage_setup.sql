-- Set up Storage for Uploads
insert into storage.buckets (id, name, public) 
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

create policy "Users can upload their own files" 
on storage.objects for insert 
with check ( bucket_id = 'uploads' and auth.uid() = owner );

create policy "Users can view their own files" 
on storage.objects for select 
using ( bucket_id = 'uploads' and auth.uid() = owner );

create policy "Users can delete their own files" 
on storage.objects for delete 
using ( bucket_id = 'uploads' and auth.uid() = owner );
