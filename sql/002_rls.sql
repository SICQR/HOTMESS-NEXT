alter table users_public enable row level security;
alter table scans enable row level security;
alter table clicks enable row level security;
alter table conversions enable row level security;
alter table checkins enable row level security;
alter table messages enable row level security;
alter table escalations enable row level security;

create policy users_can_view_self on users_public for select using (auth.uid() = id);
create policy user_can_update_self on users_public for update using (auth.uid() = id);

create policy insert_own_checkin on checkins for insert with check (auth.uid() = user_id);
create policy select_own_checkin on checkins for select using (auth.uid() = user_id);

-- service inserts only
create policy service_insert_scans on scans for insert to service_role using (true);
create policy service_insert_clicks on clicks for insert to service_role using (true);
create policy service_insert_conversions on conversions for insert to service_role using (true);
