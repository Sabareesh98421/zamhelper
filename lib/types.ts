export type UserRole = 'admin' | 'student';

export interface Profile {
  id: string; // UUID
  email: string;
  role: UserRole;
  created_at: string; // ISO 8601
}

export type ParsingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PdfUpload {
  id: number;
  file_name: string;
  storage_path: string;
  status: ParsingStatus;
  uploaded_by: string; // UUID
  uploaded_at: string; // ISO 8601
}

export interface Question {
  id: number;
  source_pdf_id: number;
  question_text: string;
  explanation: string | null;
  created_at: string; // ISO 8601
  options: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
}

export interface Exam {
  id: number;
  title: string;
  created_by?: string; // UUID
  created_at: string; // ISO 8601
  questions?: ExamQuestion[];
}

export interface ExamQuestion {
  id: number;
  exam_id: number;
  question_id: number;
  display_order: number;
}

export interface Attempt {
  id: number;
  exam_id: number;
  student_id: string; // UUID
  start_time: string; // ISO 8601
  end_time: string | null; // ISO 8601
  score: number | null;
  is_submitted: boolean;
}

export interface AttemptAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  selected_option_id: number | null;
  is_correct: boolean | null;
  saved_at: string; // ISO 8601
}

export interface ParsingFault {
  id: number;
  pdf_upload_id: number;
  description: string;
  raw_text: string | null;
  suggested_fix: string | null;
  is_resolved: boolean;
  reported_at: string; // ISO 8601
}
