-- 05_audit_log.sql
-- Append-only audit trail. No updates, no deletes — ever. Populated by
-- triggers on every other table (see 20_audit_triggers.sql).

create table public.audit_log (
  id              bigserial primary key,
  organisation_id uuid,
  actor_id        uuid,
  action          text not null,
  target_table    text not null,
  target_id       uuid,
  before          jsonb,
  after           jsonb,
  metadata        jsonb not null default '{}'::jsonb,
  "timestamp"     timestamptz not null default now()
);

create index audit_log_organisation_id_idx on public.audit_log(organisation_id, "timestamp" desc);
create index audit_log_target_idx on public.audit_log(target_table, target_id);

alter table public.audit_log enable row level security;
