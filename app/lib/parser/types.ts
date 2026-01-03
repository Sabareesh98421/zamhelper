
export interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: string; // 'A', 'B', 'C', 'D' or index
}

export interface ParseResult {
    valid: boolean;
    questions: Question[];
    error?: string;
}
