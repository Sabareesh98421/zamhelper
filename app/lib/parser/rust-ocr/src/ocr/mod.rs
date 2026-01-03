use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use tempfile;

fn run_tesseract(image: &Path) -> Result<String, String> {
    let output = Command::new("tesseract")
        .arg(image)
        .arg("stdout")
        .output()
        .map_err(|e| format!("Failed to run tesseract: {e}"))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn extract_text(path: &Path) -> Result<String, String> {
    let temp_dir = tempfile::tempdir()
        .map_err(|e| format!("Temp dir error: {e}"))?;

    let prefix = temp_dir.path().join("page");

    // Convert PDF → images
    let status = Command::new("pdftoppm")
        .arg(path)
        .arg(&prefix)
        .arg("-png")
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .status()
        .map_err(|e| format!("pdftoppm failed: {e}"))?;

    if !status.success() {
        return Err("pdftoppm conversion failed".into());
    }

    // OCR each generated image
    let mut result = String::new();
    let mut images: Vec<PathBuf> = fs::read_dir(temp_dir.path())
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter(|p| p.extension().map(|e| e == "png").unwrap_or(false))
        .collect();

    images.sort(); // page order matters

    for img in images {
        let text = run_tesseract(&img).unwrap_or_default();
        result.push_str(&text);
        result.push('\n');
    }

    Ok(result)
}
