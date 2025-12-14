-- Enable RLS (Safe to re-run)
ALTER TABLE public.pdf_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

-- 1. Policies for pdf_uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pdf_uploads' AND policyname = 'Users can upload their own files'
  ) THEN
    CREATE POLICY "Users can upload their own files" 
    ON public.pdf_uploads FOR INSERT 
    WITH CHECK (auth.uid() = uploaded_by);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pdf_uploads' AND policyname = 'Users can view their own uploads'
  ) THEN
    CREATE POLICY "Users can view their own uploads" 
    ON public.pdf_uploads FOR SELECT 
    USING (auth.uid() = uploaded_by);
  END IF;
END
$$;

-- 2. Policies for questions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Users can insert questions for their own uploads'
  ) THEN
    CREATE POLICY "Users can insert questions for their own uploads"
    ON public.questions FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.pdf_uploads 
        WHERE id = source_pdf_id 
        AND uploaded_by = auth.uid()
      )
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Users can view questions for their own uploads'
  ) THEN
    CREATE POLICY "Users can view questions for their own uploads"
    ON public.questions FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.pdf_uploads 
        WHERE id = source_pdf_id 
        AND uploaded_by = auth.uid()
      )
    );
  END IF;
END
$$;

-- 3. Policies for question_options
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'question_options' AND policyname = 'Users can insert options for their own questions'
  ) THEN
    CREATE POLICY "Users can insert options for their own questions"
    ON public.question_options FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.questions q
        JOIN public.pdf_uploads p ON q.source_pdf_id = p.id
        WHERE q.id = question_id
        AND p.uploaded_by = auth.uid()
      )
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'question_options' AND policyname = 'Users can view options for their own questions'
  ) THEN
    CREATE POLICY "Users can view options for their own questions"
    ON public.question_options FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.questions q
        JOIN public.pdf_uploads p ON q.source_pdf_id = p.id
        WHERE q.id = question_id
        AND p.uploaded_by = auth.uid()
      )
    );
  END IF;
END
$$;

-- 4. FIX MISSING PROFILES (CRITICAL)
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
