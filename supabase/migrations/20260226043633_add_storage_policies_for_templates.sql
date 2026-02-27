/*
  # Add Storage Policies for Templates Bucket
  
  1. Changes
    - Add INSERT policy for templates storage bucket to allow uploads
    - Add SELECT policy for templates storage bucket to allow downloads
    - Add UPDATE policy for templates storage bucket to allow overwrites
    - Add DELETE policy for templates storage bucket to allow deletions
  
  2. Security
    - Policies allow public access for demonstration purposes
    - In production, INSERT/UPDATE/DELETE would be restricted to authenticated admin users only
    - SELECT (download) would remain public for users to access templates
*/

-- Allow anyone to upload files to templates bucket
CREATE POLICY "Allow public upload to templates bucket"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'templates');

-- Allow anyone to download files from templates bucket
CREATE POLICY "Allow public download from templates bucket"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'templates');

-- Allow anyone to update files in templates bucket
CREATE POLICY "Allow public update in templates bucket"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'templates')
  WITH CHECK (bucket_id = 'templates');

-- Allow anyone to delete files from templates bucket
CREATE POLICY "Allow public delete from templates bucket"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'templates');
