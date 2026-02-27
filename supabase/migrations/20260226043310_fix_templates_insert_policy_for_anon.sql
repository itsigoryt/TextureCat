/*
  # Fix Templates Insert Policy for Anonymous Users
  
  1. Changes
    - Drop existing INSERT policy
    - Create new INSERT policy that explicitly allows anon role
  
  2. Security
    - Policy allows anonymous access for demonstration purposes
    - In production, this would be restricted to authenticated admin users only
*/

DROP POLICY IF EXISTS "Allow public insert to templates" ON templates;

CREATE POLICY "Allow anon insert to templates"
  ON templates FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
