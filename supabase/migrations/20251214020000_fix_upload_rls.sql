-- Enable RLS
ALTER TABLE public.pdf_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

-- 1. Policies for pdf_uploads
-- Allow users to insert their own rows
CREATE POLICY "Users can upload their own files" 
ON public.pdf_uploads FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

-- Allow users to view their own rows
CREATE POLICY "Users can view their own uploads" 
ON public.pdf_uploads FOR SELECT 
USING (auth.uid() = uploaded_by);

-- 2. Policies for questions
-- Allow users to insert questions if they own the parent PDF
CREATE POLICY "Users can insert questions for their own uploads"
ON public.questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pdf_uploads 
    WHERE id = source_pdf_id 
    AND uploaded_by = auth.uid()
  )
);

-- Allow users to view questions if they own the parent PDF
CREATE POLICY "Users can view questions for their own uploads"
ON public.questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pdf_uploads 
    WHERE id = source_pdf_id 
    AND uploaded_by = auth.uid()
  )
);

-- 3. Policies for question_options
-- Allow users to insert options if they own the parent question (via PDF)
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

-- Allow users to view options if they own the parent question (via PDF)
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
