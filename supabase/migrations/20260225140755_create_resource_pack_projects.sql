/*
  # Create Resource Pack Projects Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text) - Project name
      - `description` (text) - Project description  
      - `pack_format` (integer) - Minecraft pack format version
      - `metadata` (jsonb) - Full pack.mcmeta content
      - `file_tree` (jsonb) - File structure tree
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `project_files`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `file_path` (text) - Full path to file in pack
      - `content` (text) - File content for text files
      - `content_binary` (bytea) - Binary content for images/audio
      - `file_type` (text) - File extension/type
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public read access for demonstration purposes
    - Public write access for demonstration purposes
    
  3. Notes
    - This is a demonstration app without authentication
    - In production, you would restrict access to authenticated users
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  pack_format integer DEFAULT 15,
  metadata jsonb DEFAULT '{"pack": {"pack_format": 15, "description": "My Resource Pack"}}'::jsonb,
  file_tree jsonb DEFAULT '{"name": "root", "type": "folder", "children": []}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  content text,
  content_binary bytea,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, file_path)
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to projects"
  ON projects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to projects"
  ON projects FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to projects"
  ON projects FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from projects"
  ON projects FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to project_files"
  ON project_files FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to project_files"
  ON project_files FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to project_files"
  ON project_files FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from project_files"
  ON project_files FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
