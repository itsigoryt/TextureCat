/*
  # Statistics and Authentication Setup

  1. New Tables
    - `pack_downloads`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `user_id` (uuid, foreign key to auth.users, nullable for anonymous downloads)
      - `downloaded_at` (timestamptz)
    
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `last_active` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to track downloads
    - Add policies for public read access to statistics

  3. Functions
    - Create function to get total unique users count
    - Create function to get total downloads count
*/

-- Create pack_downloads table
CREATE TABLE IF NOT EXISTS pack_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at timestamptz DEFAULT now()
);

ALTER TABLE pack_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert download records"
  ON pack_downloads
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view download statistics"
  ON pack_downloads
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  last_active timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own session"
  ON user_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view session count"
  ON user_sessions
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Function to get unique users count
CREATE OR REPLACE FUNCTION get_unique_users_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE last_active > NOW() - INTERVAL '30 days';
$$;

-- Function to get total downloads count
CREATE OR REPLACE FUNCTION get_total_downloads_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) FROM pack_downloads;
$$;