/*
  # Create Resource Pack Templates Schema

  1. New Tables
    - `templates`
      - `id` (uuid, primary key)
      - `name` (text) - Template display name
      - `description` (text) - Template description
      - `file_url` (text) - URL to ZIP file in Supabase Storage
      - `preview_image_url` (text) - URL to preview image
      - `pack_format` (integer) - Target Minecraft version
      - `created_at` (timestamptz)
      - `is_active` (boolean) - Whether template is available

  2. Security
    - Enable RLS
    - Public read access
    - Admin-only write access (for demonstration, allowing public insert)

  3. Notes
    - Templates are pre-made resource packs users can start from
    - Files are stored in Supabase Storage bucket
*/

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  file_url text NOT NULL,
  preview_image_url text,
  pack_format integer DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to templates"
  ON templates FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow public insert to templates"
  ON templates FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active) WHERE is_active = true;
