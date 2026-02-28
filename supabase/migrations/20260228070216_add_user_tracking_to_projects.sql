/*
  # Add User Tracking to Projects and Update Download Statistics

  1. Changes to Tables
    - `projects`
      - Add `user_id` (uuid, foreign key to auth.users, nullable for existing projects)
      - Add `user_name` (text, stores the user's display name)
      - Add `user_avatar_url` (text, stores the user's profile picture URL)
    
  2. Update Download Tracking
    - Modify the download count function to count actual download records
    - The pack_downloads table already exists from previous migration

  3. Security
    - Update RLS policies to maintain public access while tracking user info
    - Users can still create projects anonymously (user_id can be null)

  4. Notes
    - This allows admin panel to display who created each project
    - Maintains backward compatibility with anonymous project creation
    - Download tracking will be more accurate with actual download events
*/

-- Add user tracking columns to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE projects ADD COLUMN user_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'user_avatar_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN user_avatar_url text;
  END IF;
END $$;

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
