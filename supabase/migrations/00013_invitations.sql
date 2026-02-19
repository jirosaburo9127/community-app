-- Invitation system: closed community with invitation codes
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Admin: SELECT
CREATE POLICY "admin_select" ON invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Admin: INSERT
CREATE POLICY "admin_insert" ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Admin: UPDATE
CREATE POLICY "admin_update" ON invitations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Admin: DELETE
CREATE POLICY "admin_delete" ON invitations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Unauthenticated users: can verify unused codes
CREATE POLICY "anon_verify_code" ON invitations
  FOR SELECT
  TO anon
  USING (used_by IS NULL);

-- Authenticated users: can claim an unused invitation (set used_by to themselves)
CREATE POLICY "authenticated_claim_invitation" ON invitations
  FOR UPDATE
  TO authenticated
  USING (used_by IS NULL)
  WITH CHECK (used_by = auth.uid());
