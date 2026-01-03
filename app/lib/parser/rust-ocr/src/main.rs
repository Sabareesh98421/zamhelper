use std::env;
use std::path::Path;

pub mod ocr;
pub mod parsing;
pub mod text_parser;

use parsing::ParseResult;

fn main() {
    env_logger::init();
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <pdf_path>", args[0]);
        std::process::exit(1);
    }

    let input = Path::new(&args[1]);
    if !input.exists() {
        eprintln!("File not found: {}", input.display());
        std::process::exit(1);
    }

    // 1. Extraction Strategy
    // Try Native Text Extraction first.
    let mut text = match text_parser::extract_text(input) {
        Ok(t) => t,
        Err(e) => {
            eprintln!("Native extraction warning: {}", e);
            String::new() // Treat error as empty text to trigger fallback
        }
    };

    // Fallback: If text is empty or very short ("unsure"), invoke OCR module
    if text.trim().len() < 50 {
        eprintln!("Extracted text too short or failed, falling back to OCR...");
        match ocr::extract_text(input) {
            Ok(t) => text = t,
            Err(e) => {
                let err_res = ParseResult {
                    valid: false,
                    questions: vec![],
                    error: Some(format!("OCR failed after native fallback: {}", e)),
                };
                println!("{}", serde_json::to_string(&err_res).unwrap());
                return;
            }
        }
    }

    // 2. Parse Questions
    let result = parsing::parse_questions_from_text(&text);

    // 3. Output JSON
    match serde_json::to_string(&result) {
        Ok(json) => println!("{}", json),
        Err(e) => eprintln!("JSON serialization error: {}", e),
    }
}
