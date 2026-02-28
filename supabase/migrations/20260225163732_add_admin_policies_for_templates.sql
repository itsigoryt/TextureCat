/*
  # Add Admin Policies for Template Management

  1. Changes
    - Add UPDATE policy for templates table to allow admin updates
    - Add DELETE policy for templates table to allow admin deletions
    - Add SELECT policy to allow admin to view all templates (including inactive)

  2. Security
    - Policies allow public access for demonstration purposes
    - In production, these would be restricted to authenticated admin users
*/

DROP POLICY IF EXISTS "Allow public read access to templates" ON templates;

CREATE POLICY "Allow admin read all templates"
  ON templates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public update to templates"
  ON templates FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from templates"
  ON templates FOR DELETE
  TO public
  USING (true);
