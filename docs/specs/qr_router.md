# HOTMESS ADD - /go Router Spec

- Purpose: Track outbound marketplace clicks and redirect.
- Params: partner, offer, ts (unix seconds), sig (hex of HMAC(secret, `${partner}.${offer}.${ts}`)), to (target URL).
- Window: 120 seconds skew allowed.
- Behavior:
  1) Verify sig+ts; log click with hmac_valid flag.
  2) Append UTM (utm_source=hotmess, utm_medium=marketplace, utm_campaign="{partner},{offer}") to target.
  3) 302 redirect.
- Errors: Unified JSON { success:false, error:{ message, code } } for invalid/missing params.
