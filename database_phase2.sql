-- /// 1. PHASE 2: SECURITY PATCH (AI Security Audit Fixes) /// --

-- Enable Row Level Security on all Phase 2 Tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_passed ENABLE ROW LEVEL SECURITY;

-- Classes: Anyone can read, only Admins can create/delete
CREATE POLICY "Anyone can view classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Admins can manage classes" ON public.classes 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Enrollments: Instructors can view all, Students can view their own
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT 
  USING (auth.uid() = student_id OR
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')));

-- Skills: Instructors can manage skills, Students can only view their own
CREATE POLICY "Users can view own skills" ON public.skills_passed FOR SELECT 
  USING (auth.uid() = student_id OR
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')));
CREATE POLICY "Instructors can insert skills" ON public.skills_passed FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')));


-- /// 2. MOCK DATA /// --
-- Make sure to REPLACE the 'uuid_generate_v4()' logic if you want to hardcode specific instructor IDs, 
-- but this sets up universal blank classes that the instructor can "claim" visually for the UI.

INSERT INTO public.classes (title, level, schedule_time) VALUES 
('Tot Playtime', 'Level 1', 'Saturday 9:00 AM'),
('Forward Crossovers', 'Level 3', 'Saturday 10:00 AM'),
('Adult Beginner', 'Level 2', 'Sunday 5:00 PM'),
('Freestyle Spin Form', 'Advanced', 'Tuesday 6:30 PM');
