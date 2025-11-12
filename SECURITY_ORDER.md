# Security Order Quick Reference

1. Raw HMAC verify (telegram/bot) before JSON parsing.
2. Signed link time window (120s default).
3. Activation / QR signature verify → TTL → cooldown → cap → award.
4. Rate limit apply at request head (avoid resource waste).
5. RLS defaults; escalate only via SECURITY DEFINER RPC.
6. Structured logs redact secrets; use request_id for correlation.
