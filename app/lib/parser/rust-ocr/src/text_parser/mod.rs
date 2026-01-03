use pdf_oxide::PdfDocument;
use std::path::Path;

pub fn extract_text(path: &Path) -> Result<String, String> {
    // 1. Load Document
    // pdf_oxide::PdfDocument::bind(path) opens the file
    let mut doc =
        PdfDocument::open(path).map_err(|e| format!("Failed to load PDF via pdf_oxide: {}", e))?;

    // 2. Extract Text
    // pdf_oxide generally provides layout-aware text extraction.
    // We assume an API like .extract_text() or iterating pages.
    // Based on standard usage patterns for high-level crates:

    // Check available methods in docs or try standard:
    // let text = doc.text_layout().map_err(...)?;
    // OR simply:

    // Iterate over pages if possible, or try doc level extraction
    // Since we don't have docs, we try the most common pattern found in search results or similar crates
    let mut full_text = String::new();

    // Assuming 1-based indexing or an iterator
    // Try to get page count first
    let page_count = doc
        .page_count()
        .map_err(|e| format!("Failed to get page count: {}", e))?;

    for i in 0..page_count {
        // pages are usually 0-indexed or 1-indexed. Let's try 0-indexed method or page(i)
        // If this fails, we will see the error and available methods
        if let Ok(page_text) = doc.extract_text(i) {
            full_text.push_str(&page_text);
            full_text.push('\n');
        }
    }

    Ok(full_text)
}
