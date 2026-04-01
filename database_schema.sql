-- 1. Create a public 'profiles' table to store user roles and data
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'instructor', 'student')),
  email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy allowing users to view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- 2. Trigger function to automatically create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    -- Extract the role from user metadata we pass during signup (Defaults to student)
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. The Trigger connecting Supabase Auth to the Public Profiles table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- /// PHASE 2 TABLES (Basic Structure Setup) /// --

-- Classes Table (Who teaches what and when)
CREATE TABLE public.classes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  instructor_id uuid REFERENCES public.profiles(id),
  title text NOT NULL,
  level text NOT NULL,
  schedule_time text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enrollments/Attendance Table (Which student belongs to which class)
CREATE TABLE public.enrollments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'active'
);

-- Skills Table (A table to track each skill passed by a student)
CREATE TABLE public.skills_passed (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id),
  skill_name text NOT NULL,
  passed_on timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
