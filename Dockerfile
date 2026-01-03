# Use Node.js 20 as the base image
FROM node:20-bookworm-slim

# 1. Install System Dependencies
# - tesseract-ocr: For OCR
# - poppler-utils: For pdftoppm (PDF -> Image)
# - curl, build-essential: For installing Rust
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Rust
# We use rustup to get the latest stable version
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
# Add cargo to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# 3. Set up Application
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# 4. Build
# This runs "npm run build", which we will configure to compile Rust first
RUN npm run build

# 5. Start
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
