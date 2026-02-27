/*
  # Change pack_format to support decimal values

  1. Changes
    - Change `pack_format` column from integer to numeric/decimal type in both projects and templates tables
    - This allows pack format versions like 88.0 and 94.1 for Minecraft Java Edition

  2. Notes
    - Minecraft Java Edition uses pack formats with decimal points (e.g., 88.0, 94.1)
    - Using numeric type to preserve exact decimal values
*/

-- Update projects table
ALTER TABLE projects 
ALTER COLUMN pack_format TYPE numeric USING pack_format::numeric;

-- Update templates table
ALTER TABLE templates 
ALTER COLUMN pack_format TYPE numeric USING pack_format::numeric;