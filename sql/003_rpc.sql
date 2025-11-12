create or replace function track_event(kind text, payload jsonb)
returns text language plpgsql security definer as $$
declare
  clickid text := encode(gen_random_bytes(8), 'hex');
begin
  if kind = 'scan' then
    insert into scans(city,surface,affiliate_id,room_id,ip_hash,ua,sig_ok)
    values(payload->>'city', payload->>'surface', payload->>'affiliate_id', payload->>'room_id',
           payload->>'ip_hash', payload->>'ua', (payload->>'sig_ok')::boolean);
    return clickid;
  elsif kind = 'click' then
    insert into clicks(scan_id,partner,url,click_id)
    values((payload->>'scan_id')::uuid, payload->>'partner', payload->>'url', clickid);
    return clickid;
  else
    raise exception 'Unknown kind %', kind;
  end if;
end; $$;

create or replace function award_conversion(clickid text, payload jsonb)
returns void language plpgsql security definer as $$
declare
  aff text; ccity text;
begin
  select affiliate_id, city into aff, ccity from clicks c join scans s on s.id = c.scan_id where c.click_id = clickid;
  insert into conversions(click_id,payout_gross,net_after_fee,status,affiliate_id,city)
  values(clickid, (payload->>'payout_gross')::numeric, (payload->>'net_after_fee')::numeric,
         payload->>'status', aff, ccity);
end; $$;
