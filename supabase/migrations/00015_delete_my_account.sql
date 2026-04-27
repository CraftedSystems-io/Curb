-- Apple App Review guideline 5.1.1(v) requires that any iOS app supporting
-- account creation also lets the user initiate account deletion from inside
-- the app. This RPC wipes the caller's profile and auth row, cascading to
-- everything that FK-references their profile (bookings, contractors,
-- messages, etc., per existing ON DELETE CASCADE rules in the schema).
--
-- Safety:
-- * SECURITY DEFINER so it can hit auth.users (which is locked down to
--   service_role normally).
-- * Only deletes the calling user — never accepts a target uuid.
-- * Returns void; client signs out after a successful call.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'not authenticated';
  end if;

  -- Profiles row (FK chains will cascade per existing schema).
  delete from public.profiles where id = caller;

  -- Finally drop the auth row so the user cannot log back in with the
  -- same credentials.
  delete from auth.users where id = caller;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
