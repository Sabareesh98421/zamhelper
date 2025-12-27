

export interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: string; // 'A', 'B', 'C', 'D' or index
}

interface ParseResult {
    valid: boolean;
    questions: Question[];
    error?: string;
}

// THE ALGORITHM:
// 1. Defines multiple "Strategies" (Regex patterns) for different exam formats.
// 2. Runs ALL strategies against the text.
// 3. Scores each strategy based on how many "Complete Questions" it found (Question + 2+ Options + Answer).
// 4. Returns the best match. If no strategy finds enough questions, it returns valid: false.

const STRATEGIES = [
    {
        name: 'Standard Dot (1. Question ... A. Option)',
        qRegex: /^\s*(\d+)\.\s+(.+)/,
        oRegex: /^\s*([A-D]|[a-d])\.\s+(.+)/,
        aRegex: /(?:Answer|Ans|Correct)\s*:\s*([A-D]|[a-d])/i,
    },
    {
        name: 'Parenthesis (1) Question ... a) Option)',
        qRegex: /^\s*(\d+)[\).]\s+(.+)/, // Matches 1. or 1)
        oRegex: /^\s*([A-D]|[a-d])[\).]\s+(.+)/, // Matches A. or A) or a)
        aRegex: /(?:Answer|Ans|Correct)\s*:\s*([A-D]|[a-d])/i,
    },
    {
        name: 'Header Based (Q1: Question ... (1) Option)',
        qRegex: /^\s*(?:Q|Question)\s*(\d+)[:.]\s+(.+)/i,
        oRegex: /^\s*\(?([1-4]|[A-D]|[a-d])\)?\s+(.+)/,
        aRegex: /(?:Answer|Ans|Correct)\s*:\s*([A-D]|[a-d]|[1-4])/i,
    }
];

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        // Use dynamic import to prevent build-time evaluation issues with DOMMatrix
        const pdfModule = await import('pdf-parse');
        // @ts-ignore
        const pdf = pdfModule.default || pdfModule;
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("PDF Parse Error:", error);
        throw new Error("Failed to extract text from PDF.");
    }
}

export function parseQuestionsFromText(text: string): ParseResult {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    let bestResult: Question[] = [];
    let maxScore = 0;

    for (const strategy of STRATEGIES) {
        const currentQuestions: Question[] = [];
        let currentQ: Partial<Question> | null = null;

        for (const line of lines) {
            // 1. Check for Question Start
            const qMatch = line.match(strategy.qRegex);
            if (qMatch) {
                // Save previous question if it has options
                if (currentQ && currentQ.options && currentQ.options.length >= 2) {
                    currentQuestions.push(currentQ as Question);
                }

                currentQ = {
                    id: parseInt(qMatch[1]),
                    text: qMatch[2],
                    options: [],
                    correctAnswer: ''
                };
                continue;
            }

            // 2. Check for Option
            if (currentQ) {
                const oMatch = line.match(strategy.oRegex);
                if (oMatch) {
                    // Store option as "A. Option Text"
                    currentQ.options!.push(`${oMatch[1]}. ${oMatch[2]}`);
                    continue;
                }

                // 3. Check for Answer
                const aMatch = line.match(strategy.aRegex);
                if (aMatch) {
                    currentQ.correctAnswer = aMatch[1].toUpperCase();
                    continue;
                }

                // Append multi-line text to question if no other match (heuristic)
                // Only if we haven't started options yet
                if (currentQ.options!.length === 0 && !currentQ.correctAnswer) {
                    currentQ.text += " " + line;
                }
            }
        }

        // Push last question
        if (currentQ && currentQ.options && currentQ.options.length >= 2) {
            currentQuestions.push(currentQ as Question);
        }

        // SCORING ALGORITHM
        // We value questions that have a defined Answer Key highly.
        const completeQuestions = currentQuestions.filter(q => q.correctAnswer).length;
        const totalQuestions = currentQuestions.length;

        // Score = Total parsed + Bonus for having answers
        const score = totalQuestions + (completeQuestions * 2);

        if (score > maxScore) {
            maxScore = score;
            bestResult = currentQuestions;
        }
    }

    // VALIDATION THRESHOLD
    // If we found fewer than 1 question, or if we found questions but ZERO answers (might be a risk, but maybe user wants to take exam without auto-grading?), 
    // let's require at least 1 valid question.
    if (maxScore === 0 || bestResult.length === 0) {
        return {
            valid: false,
            questions: [],
            error: "Could not detect a valid exam format. Ensure questions start with numbers (1.) and options with letters (A.)."
        };
    }

    return { valid: true, questions: bestResult };
}
