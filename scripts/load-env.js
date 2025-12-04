#!/usr/bin/env node

/**
 * Simple .env file loader without external dependencies
 * Loads environment variables from .env file and runs the command
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Path to .env file
const envPath = path.join(__dirname, "..", ".env");

// Load .env file if it exists
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");

  // Parse .env file
  envContent.split("\n").forEach((line) => {
    line = line.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith("#")) {
      return;
    }

    // Parse KEY=VALUE
    const separatorIndex = line.indexOf("=");
    if (separatorIndex !== -1) {
      const key = line.substring(0, separatorIndex).trim();
      const value = line.substring(separatorIndex + 1).trim();

      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, "");

      // Set environment variable
      process.env[key] = cleanValue;
    }
  });

  console.log("✅ Environment variables loaded from .env file");
} else {
  console.warn("⚠️  Warning: .env file not found");
}

// Get command and arguments from CLI
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("❌ Error: No command specified");
  process.exit(1);
}

// Run the command with loaded environment variables
const [command, ...commandArgs] = args;
const child = spawn(command, commandArgs, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
