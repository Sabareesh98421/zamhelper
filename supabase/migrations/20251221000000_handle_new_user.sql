-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (
    new.id,
    new.email
  )
  on conflict (id) do nothing; -- robust against duplicate events
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user insert
create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
