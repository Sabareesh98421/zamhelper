use regex::Regex;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Question {
    pub id: u32,
    pub text: String,
    pub options: Vec<String>,
    pub correct_answer: String,
}

#[derive(Debug, Serialize)]
pub struct ParseResult {
    pub valid: bool,
    pub questions: Vec<Question>,
    pub error: Option<String>,
}

struct ParsedQuestion {
    id: u32,
    text: String,
    options: Vec<String>,
    correct_answer: String,
}

struct Strategy {
    q_regex: Regex,
    o_regex: Regex,
    a_regex: Regex,
}

impl Strategy {
    fn new(q: &str, o: &str, a: &str) -> Self {
        Strategy {
            q_regex: Regex::new(q).unwrap(),
            o_regex: Regex::new(o).unwrap(),
            a_regex: Regex::new(a).unwrap(),
        }
    }
}

pub fn parse_questions_from_text(text: &str) -> ParseResult {
    let lines: Vec<&str> = text.lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty())
        .collect();

    // Ported Strategies from JS:
    // 1. Standard Dot: 1. Question ... A. Option ... Answer: A
    // 2. Parenthesis: 1) Question ... a) Option ... Answer: A
    // 3. Header Based: Q1: Question ... (1) Option ... Answer: A
    
    let strategies = vec![
        Strategy::new(
            r"^\s*(\d+)\.\s+(.+)", 
            r"^\s*([A-D]|[a-d])\.\s+(.+)", 
            r"(?i)(?:Answer|Ans|Correct)\s*:\s*([A-D]|[a-d])"
        ),
        Strategy::new(
            r"^\s*(\d+)[\).]\s+(.+)", 
            r"^\s*([A-D]|[a-d])[\).]\s+(.+)", 
            r"(?i)(?:Answer|Ans|Correct)\s*:\s*([A-D]|[a-d])"
        ),
        Strategy::new(
            r"^\s*(?:Q|Question)\s*(\d+)[:.]\s+(.+)", 
            r"^\s*\(?([1-4]|[A-D]|[a-d])\)?\s+(.+)", 
            r"(?i)(?:Answer|Ans|Correct)\s*:\s*([A-D]|[a-d]|[1-4])"
        )
    ];

    let mut best_result: Vec<ParsedQuestion> = Vec::new();
    let mut max_score = 0;

    for strategy in strategies {
        let mut current_questions: Vec<ParsedQuestion> = Vec::new();
        let mut current_q: Option<ParsedQuestion> = None;

        for line in &lines {
            // 1. Check for Question Start
            if let Some(caps) = strategy.q_regex.captures(line) {
                // Save previous
                if let Some(q) = current_q.take() {
                    if q.options.len() >= 2 {
                        current_questions.push(q);
                    }
                }

                current_q = Some(ParsedQuestion {
                    id: caps[1].parse().unwrap_or(0),
                    text: caps[2].to_string(),
                    options: Vec::new(),
                    correct_answer: String::new(),
                });
                continue;
            }

            // 2. Check for Option and Answer
            if let Some(ref mut q) = current_q {
                if let Some(caps) = strategy.o_regex.captures(line) {
                    q.options.push(format!("{}. {}", &caps[1], &caps[2]));
                    continue;
                }

                if let Some(caps) = strategy.a_regex.captures(line) {
                    q.correct_answer = caps[1].to_string().to_uppercase();
                    continue;
                }

                // Append multi-line text to question if no options yet
                if q.options.is_empty() && q.correct_answer.is_empty() {
                    q.text.push_str(" ");
                    q.text.push_str(line);
                }
            }
        }

        // Push last question
        if let Some(q) = current_q {
            if q.options.len() >= 2 {
                current_questions.push(q);
            }
        }

        // Score
        let complete_count = current_questions.iter().filter(|q| !q.correct_answer.is_empty()).count();
        let score = current_questions.len() + (complete_count * 2);

        if score > max_score {
            max_score = score;
            best_result = current_questions;
        }
    }

    if max_score == 0 || best_result.is_empty() {
        return ParseResult {
            valid: false,
            questions: vec![],
            error: Some("Could not detect a valid exam format.".to_string()),
        };
    }

    // Map internal struct to public struct
    let final_questions = best_result.into_iter().map(|q| Question {
        id: q.id,
        text: q.text,
        options: q.options,
        correct_answer: q.correct_answer,
    }).collect();

    ParseResult {
        valid: true,
        questions: final_questions,
        error: None,
    }
}
