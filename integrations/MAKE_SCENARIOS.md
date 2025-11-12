# Make.com Scenarios (spec)

## 1) webhook.scan_to_hub
POST /r hit → validate HMAC → write `scans` via rpc.track_event(kind='scan') → respond with JSON for mobile hub.

**Webhook payload**
```json
{ "city":"london", "surface":"flag", "affiliate_id":"aff123", "room_id":"ldn01", "ip_hash":"…", "ua":"…", "sig_ok":true }
```

## 2) webhook.click_to_partner
Create click → append UTM → redirect.

```json
{ "scan_id":"<uuid>", "partner":"uber", "url":"https://…" }
```

## 3) webhook.partner_postback
```json
{ "click_id":"abcd1234", "payout_gross":6.5, "net_after_fee":6.0, "status":"approved" }
```

## 4) cron.night_drops
Hourly 21–05 push city message with /ride CTA.

## 5) cron.radio_sync
At :20/:50 send stinger + hub link.

## 6) cron.checkins
DM at 03:30 prompt /checkin.

## 7) cron.leaderboard
Compute tiers → publish JSON.

## 8) listener.safety_escalation
Keyword → mod ping + voucher path.
