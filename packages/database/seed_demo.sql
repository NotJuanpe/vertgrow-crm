-- VertGrow CRM — Demo seed data
-- Paste this entire file into the Supabase SQL Editor and click Run.
-- Safe to re-run: deletes existing rows first (cascade handles child tables).

-- ── Wipe existing demo data ───────────────────────────────────────────────────

DELETE FROM project_phases;
DELETE FROM project_plants;
DELETE FROM project_photos;
DELETE FROM reminders;
DELETE FROM appointments;
DELETE FROM projects;
DELETE FROM clients;

-- ── Clients ───────────────────────────────────────────────────────────────────

INSERT INTO clients (id, name, email, phone, address, status, notes, created_at, updated_at) VALUES

  ('c1000000-0000-0000-0000-000000000001',
   'María González', 'maria.gonzalez@gmail.com', '+54 11 4523-8891',
   'Av. Santa Fe 2341, Palermo, CABA',
   'active',
   'Large south-facing terrace (~32 m²). Loves tropical plants and edibles. Budget is flexible. Prefers WhatsApp communication.',
   '2026-01-20 09:00:00+00', '2026-01-20 09:00:00+00'),

  ('c2000000-0000-0000-0000-000000000002',
   'Carlos Mendoza', 'c.mendoza@mendozagroup.com.ar', '+54 11 5784-2200',
   'Av. Córdoba 1580, piso 6, Retiro, CABA',
   'active',
   'Wants a living green wall for the office reception. Corporate client — decisions go through his assistant Luciana. Install must happen on a weekend.',
   '2026-02-03 14:30:00+00', '2026-02-03 14:30:00+00'),

  ('c3000000-0000-0000-0000-000000000003',
   'Laura Fernández', 'lau.fernandez@outlook.com', '+54 11 3341-9072',
   'Juramento 875, Belgrano, CABA',
   'lead',
   'Interested in a balcony vertical garden. Small space (~6 m²). First visit scheduled — send quote after. She follows us on Instagram.',
   '2026-04-28 11:00:00+00', '2026-04-28 11:00:00+00'),

  ('c4000000-0000-0000-0000-000000000004',
   'Ricardo Soto', 'rsoto@hotmail.com', '+54 11 4901-3356',
   'Riobamba 220, Once, CABA',
   'inactive',
   'Had a small indoor installation in 2025. Did not renew maintenance contract. Worth a seasonal re-engagement call.',
   '2025-08-10 10:00:00+00', '2025-08-10 10:00:00+00'),

  ('c5000000-0000-0000-0000-000000000005',
   'Valentina Cruz', 'vcruz@valentinacruz.ar', '+54 11 6672-4481',
   'Thames 1102, Villa Crespo, CABA',
   'active',
   'Monthly maintenance client. Very low maintenance preference. Has two panels installed (north wall, kitchen). Always punctual with payments.',
   '2026-01-05 08:00:00+00', '2026-01-05 08:00:00+00'),

  ('c6000000-0000-0000-0000-000000000006',
   'Diego Ramírez', 'diego.ramirez.ar@gmail.com', '+54 11 2234-6610',
   'Av. Rivadavia 4490, Caballito, CABA',
   'lead',
   'Quote requested via website contact form. Wants outdoor wall, approx 4 × 2.5 m. Has not confirmed availability for site visit yet.',
   '2026-05-01 16:00:00+00', '2026-05-01 16:00:00+00'),

  ('c7000000-0000-0000-0000-000000000007',
   'Ana Herrera', 'ana@herrerainteriors.com', '+54 11 4812-7730',
   'Libertad 540, Recoleta, CABA',
   'active',
   'Interior design studio. Commissioned a statement indoor green wall for their lobby. Project completed Feb 2026. Good referral potential.',
   '2025-12-01 10:00:00+00', '2025-12-01 10:00:00+00');

-- ── Projects ──────────────────────────────────────────────────────────────────

INSERT INTO projects (id, client_id, title, status, dimensions_h, dimensions_w, notes, created_at) VALUES

  ('b1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'Terraza Jardín Vertical – González',
   'in_progress', 2.4, 8.0,
   'Three-panel modular system along the north perimeter wall. Mix of tropical foliage and culinary herbs. Drip irrigation included.',
   '2026-02-10 10:00:00+00'),

  ('b2000000-0000-0000-0000-000000000002',
   'c2000000-0000-0000-0000-000000000002',
   'Mural Verde – Mendoza Office',
   'planning', 3.0, 5.0,
   'Reception area feature wall. All low-maintenance species. Client wants a "wow factor" for visiting clients. Weekend installation required.',
   '2026-03-15 09:00:00+00'),

  ('b3000000-0000-0000-0000-000000000003',
   'c7000000-0000-0000-0000-000000000007',
   'Interior Verde – Herrera Lobby',
   'completed', 2.8, 4.0,
   'Floor-to-ceiling panel behind reception desk. Indirect lighting rig installed. Completed on schedule. Client very satisfied.',
   '2025-12-10 10:00:00+00');

-- ── Project phases ────────────────────────────────────────────────────────────

-- p1: Terraza González (in_progress)
INSERT INTO project_phases (project_id, name, start_date, end_date, status, notes) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Design & Planning',  '2026-02-10', '2026-02-28', 'done',        'Species selection finalised, irrigation layout approved by client.'),
  ('b1000000-0000-0000-0000-000000000001', 'Procurement',        '2026-03-01', '2026-03-20', 'done',        'All plants sourced from Vivero del Sur. Modular frames ordered from supplier.'),
  ('b1000000-0000-0000-0000-000000000001', 'Installation',       '2026-03-22', '2026-05-30', 'in_progress', 'Frame mounting done. Plant panels being staged and positioned.'),
  ('b1000000-0000-0000-0000-000000000001', 'Finishing & Handover','2026-06-01', '2026-06-14', 'pending',     'Irrigation testing, touch-ups, client walkthrough and care guide handover.');

-- p2: Mural Mendoza (planning)
INSERT INTO project_phases (project_id, name, start_date, end_date, status, notes) VALUES
  ('b2000000-0000-0000-0000-000000000002', 'Design & Moodboard', '2026-05-12', '2026-06-06', 'in_progress', 'Waiting on client sign-off for species selection. Second review meeting booked.'),
  ('b2000000-0000-0000-0000-000000000002', 'Procurement',        '2026-06-09', '2026-06-27', 'pending',     NULL),
  ('b2000000-0000-0000-0000-000000000002', 'Installation',       '2026-07-05', '2026-07-06', 'pending',     'Must be Saturday–Sunday. Coordinate with building admin for lift access.');

-- ── Project plants ────────────────────────────────────────────────────────────

-- p1: Terraza González
INSERT INTO project_plants (project_id, common_name, scientific_name, why_it_fits, care_difficulty, pairing_note, approved) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Golden Pothos',     'Epipremnum aureum',
   'Thrives in partial sun, fast coverage, tolerates the afternoon shade from the pergola.',
   'easy', 'Pairs well with the Bird of Paradise as a ground-level contrast.', true),

  ('b1000000-0000-0000-0000-000000000001', 'Bird of Paradise',  'Strelitzia reginae',
   'Architectural statement plant; the terrace gets enough direct sun for healthy blooming.',
   'moderate', 'Use as a focal anchor at the centre panel.', true),

  ('b1000000-0000-0000-0000-000000000001', 'Basil',             'Ocimum basilicum',
   'Client requested edibles; basil loves the southern exposure and is easy to replace seasonally.',
   'easy', 'Group with cherry tomatoes and parsley in the kitchen-facing panel.', true),

  ('b1000000-0000-0000-0000-000000000001', 'Cherry Tomato',     'Solanum lycopersicum var. cerasiforme',
   'Compact variety suits the modular pockets; high sun availability on this terrace.',
   'moderate', NULL, true),

  ('b1000000-0000-0000-0000-000000000001', 'Spanish Lavender',  'Lavandula stoechas',
   'Drought-tolerant, aromatic, and deters pests from the edible panel nearby.',
   'easy', 'Use as a border plant along the lower rail.', false),

  ('b1000000-0000-0000-0000-000000000001', 'Monstera',          'Monstera deliciosa',
   'Bold foliage adds tropical feel; will need trimming every 6 weeks at this size.',
   'moderate', NULL, false);

-- p3: Interior Herrera (completed)
INSERT INTO project_plants (project_id, common_name, scientific_name, why_it_fits, care_difficulty, pairing_note, approved) VALUES
  ('b3000000-0000-0000-0000-000000000003', 'Peace Lily',        'Spathiphyllum wallisii',
   'Tolerates low indoor light, air-purifying, and stays lush with minimal care.',
   'easy', 'Anchors the lower third of the panel with its broad leaves.', true),

  ('b3000000-0000-0000-0000-000000000003', 'ZZ Plant',          'Zamioculcas zamiifolia',
   'Nearly indestructible indoors; perfect for a lobby that may go unattended over weekends.',
   'easy', 'Mid-panel filler with upright form contrasting the Peace Lily.', true),

  ('b3000000-0000-0000-0000-000000000003', 'Heartleaf Philodendron', 'Philodendron hederaceum',
   'Trailing habit creates cascading effect from the upper pockets.',
   'easy', 'Pair with Pothos for texture variation — both trail at different rates.', true),

  ('b3000000-0000-0000-0000-000000000003', 'Golden Pothos',     'Epipremnum aureum',
   'Variegated leaves add visual contrast; highly adaptable to the lobby light levels.',
   'easy', NULL, true);

-- ── Appointments ──────────────────────────────────────────────────────────────

INSERT INTO appointments (id, client_id, project_id, date, duration_min, type, status, notes, created_at) VALUES

  -- Ana Herrera (c7) — completed project history
  ('a1000000-0000-0000-0000-000000000001',
   'c7000000-0000-0000-0000-000000000007', 'b3000000-0000-0000-0000-000000000003',
   '2025-12-05 10:00:00+00', 90, 'quote', 'completed',
   'Initial site visit. Measured lobby wall, discussed species and lighting rig. Client approved moodboard on the spot.',
   '2025-12-01 10:00:00+00'),

  ('a2000000-0000-0000-0000-000000000002',
   'c7000000-0000-0000-0000-000000000007', 'b3000000-0000-0000-0000-000000000003',
   '2026-01-20 08:00:00+00', 480, 'installation', 'completed',
   'Full-day installation. Frames mounted, irrigation hooked to building water supply, all plants positioned. Handover done.',
   '2026-01-10 09:00:00+00'),

  ('a3000000-0000-0000-0000-000000000003',
   'c7000000-0000-0000-0000-000000000007', 'b3000000-0000-0000-0000-000000000003',
   '2026-03-18 10:00:00+00', 60, 'maintenance', 'completed',
   'First maintenance visit post-install. Trimmed Pothos, replaced one Peace Lily that had root rot. Everything else healthy.',
   '2026-03-15 09:00:00+00'),

  -- María González (c1) — in_progress project
  ('a4000000-0000-0000-0000-000000000004',
   'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   '2026-02-07 11:00:00+00', 90, 'quote', 'completed',
   'Site visit. Measured terrace, took sun-path photos. Client confirmed edible panel. Sent quote same evening.',
   '2026-02-03 10:00:00+00'),

  ('a5000000-0000-0000-0000-000000000005',
   'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   '2026-03-22 08:00:00+00', 300, 'installation', 'completed',
   'Frame installation day 1. All 3 panel frames mounted, irrigation lines run. Plants staged in order.',
   '2026-03-18 09:00:00+00'),

  ('a6000000-0000-0000-0000-000000000006',
   'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   '2026-05-20 10:00:00+00', 60, 'maintenance', 'scheduled',
   'Mid-install check-in. Verify irrigation drip rates, assess plant health, fill any sparse pockets.',
   '2026-05-10 09:00:00+00'),

  -- Valentina Cruz (c5) — recurring maintenance
  ('a7000000-0000-0000-0000-000000000007',
   'c5000000-0000-0000-0000-000000000005', NULL,
   '2026-02-14 09:00:00+00', 60, 'maintenance', 'completed',
   'Monthly visit. Trimmed north wall panel, replaced two Pothos cuttings. Kitchen panel healthy.',
   '2026-02-10 09:00:00+00'),

  ('a8000000-0000-0000-0000-000000000008',
   'c5000000-0000-0000-0000-000000000005', NULL,
   '2026-03-14 09:00:00+00', 60, 'maintenance', 'completed',
   'Routine maintenance. Added slow-release fertiliser. Client mentioned she wants to expand to bathroom wall.',
   '2026-03-10 09:00:00+00'),

  ('a9000000-0000-0000-0000-000000000009',
   'c5000000-0000-0000-0000-000000000005', NULL,
   '2026-04-11 09:00:00+00', 60, 'maintenance', 'completed',
   'Monthly maintenance. All panels healthy. Left care instructions for upcoming 2-week holiday.',
   '2026-04-08 09:00:00+00'),

  ('aa000000-0000-0000-0000-000000000010',
   'c5000000-0000-0000-0000-000000000005', NULL,
   '2026-05-22 09:00:00+00', 60, 'maintenance', 'scheduled',
   'Monthly maintenance visit.',
   '2026-05-10 09:00:00+00'),

  -- Carlos Mendoza (c2) — planning project
  ('ab000000-0000-0000-0000-000000000011',
   'c2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   '2026-03-10 15:00:00+00', 60, 'quote', 'completed',
   'First meeting at office. Took wall measurements and photos. Client wants all low-maintenance species, no edibles.',
   '2026-03-05 09:00:00+00'),

  ('ac000000-0000-0000-0000-000000000012',
   'c2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002',
   '2026-05-08 16:00:00+00', 45, 'follow-up', 'completed',
   'Second design review via video call with Luciana. Two species swapped per client request. Moodboard v2 approved.',
   '2026-05-05 09:00:00+00'),

  -- Laura Fernández (c3) — incoming lead
  ('ad000000-0000-0000-0000-000000000013',
   'c3000000-0000-0000-0000-000000000003', NULL,
   '2026-05-19 11:00:00+00', 60, 'quote', 'scheduled',
   'First visit. Balcony faces east, ~6 m². Bring sample panels and catalogue. She mentioned a tight budget.',
   '2026-05-02 10:00:00+00'),

  -- Diego Ramírez (c6) — lead, quote pending
  ('ae000000-0000-0000-0000-000000000014',
   'c6000000-0000-0000-0000-000000000006', NULL,
   '2026-05-28 10:00:00+00', 75, 'quote', 'scheduled',
   'Outdoor wall 4 × 2.5 m. South-facing. Bring weatherproof species options and outdoor irrigation brochure.',
   '2026-05-05 09:00:00+00'),

  -- Ricardo Soto (c4) — cancelled old appointment
  ('af000000-0000-0000-0000-000000000015',
   'c4000000-0000-0000-0000-000000000004', NULL,
   '2025-10-15 10:00:00+00', 60, 'maintenance', 'cancelled',
   'Client cancelled day before. Did not reschedule. Follow up in spring.',
   '2025-10-01 09:00:00+00');

-- ── Reminders ─────────────────────────────────────────────────────────────────

INSERT INTO reminders (client_id, appointment_id, due_date, type, note, done) VALUES

  -- Follow up with Laura after her quote visit
  ('c3000000-0000-0000-0000-000000000003',
   'ad000000-0000-0000-0000-000000000013',
   '2026-05-21 09:00:00+00',
   'follow-up-call',
   'Call Laura 2 days after quote visit. She seemed uncertain about budget — offer the starter pack option.',
   false),

  -- Diego quote expires in 30 days
  ('c6000000-0000-0000-0000-000000000006',
   'ae000000-0000-0000-0000-000000000014',
   '2026-06-10 09:00:00+00',
   'quote-expiry',
   'Quote for outdoor wall is valid 30 days from site visit. Chase if no response by June 5.',
   false),

  -- Valentina seasonal check
  ('c5000000-0000-0000-0000-000000000005', NULL,
   '2026-06-20 09:00:00+00',
   'seasonal-maintenance',
   'Winter prep: swap summer-sensitive species in kitchen panel, check irrigation timer settings.',
   false),

  -- Re-engage Ricardo
  ('c4000000-0000-0000-0000-000000000004', NULL,
   '2026-05-25 09:00:00+00',
   'follow-up-call',
   'It has been 6 months. Give Ricardo a quick call — spring is a good time to restart maintenance.',
   false),

  -- Herrera quarterly maintenance reminder
  ('c7000000-0000-0000-0000-000000000007', NULL,
   '2026-06-18 09:00:00+00',
   'seasonal-maintenance',
   'Schedule Q2 maintenance visit for Herrera lobby. Check drip lines and fertilise.',
   false),

  -- Already-done reminder (shows history)
  ('c1000000-0000-0000-0000-000000000001',
   'a4000000-0000-0000-0000-000000000004',
   '2026-02-08 09:00:00+00',
   'follow-up-call',
   'Confirm María received the quote email and answer any questions.',
   true);
