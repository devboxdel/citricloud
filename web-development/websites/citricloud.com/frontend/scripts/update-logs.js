#!/usr/bin/env node

/**
 * Auto-update Logs page with build information
 * Runs after each production build to add deployment entries
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, '../src/pages/Log.tsx');

function getCurrentTimestamp() {
  const now = new Date();
  // Use local timezone instead of UTC
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  const date = `${year}-${month}-${day}`; // YYYY-MM-DD in local time
  const time = `${hours}:${minutes}`; // HH:MM in local time
  return { date, time };
}

function getRecentGitCommits(count = 5) {
  try {
    const commits = execSync(`git log -${count} --pretty=format:"%s|||%ad" --date=format:"%Y-%m-%d %H:%M"`, {
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..')
    }).split('\n').filter(Boolean);
    
    return commits.map(commit => {
      const [message, datetime] = commit.split('|||');
      const [date, time] = datetime.split(' ');
      return { message, date, time };
    });
  } catch (error) {
    console.warn('Could not fetch git commits:', error.message);
    return [];
  }
}

function detectChangeType(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('fix') || lowerMessage.includes('bug')) return 'fix';
  if (lowerMessage.includes('feat') || lowerMessage.includes('add')) return 'feature';
  if (lowerMessage.includes('improve') || lowerMessage.includes('enhance')) return 'improvement';
  if (lowerMessage.includes('update') || lowerMessage.includes('upgrade')) return 'update';
  if (lowerMessage.includes('change') || lowerMessage.includes('modify')) return 'change';
  if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) return 'deleted';
  if (lowerMessage.includes('optimi') || lowerMessage.includes('perf')) return 'optimized';
  
  return 'update';
}

function getChangedFiles() {
  try {
    const status = execSync('git status --porcelain', {
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..')
    }).trim();
    
    if (!status) return [];
    
    return status.split('\n').map(line => {
      const file = line.substring(3);
      return file;
    }).filter(f => f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js'));
  } catch (error) {
    return [];
  }
}

function createBuildLogEntry() {
  const { date, time } = getCurrentTimestamp();
  const changedFiles = getChangedFiles();
  const recentCommits = getRecentGitCommits(1);
  
  let title = 'Production Build Deployed';
  let description = 'New production build successfully compiled and deployed';
  const details = [
    'Frontend assets compiled and optimized',
    'All components bundled with latest changes'
  ];
  
  // Add info about recent commit if available
  if (recentCommits.length > 0) {
    const latestCommit = recentCommits[0];
    title = latestCommit.message;
    description = `Production build with: ${latestCommit.message}`;
    details.unshift(`Latest commit: ${latestCommit.message}`);
  }
  
  // Add info about changed files
  if (changedFiles.length > 0) {
    details.push(`Modified files: ${changedFiles.slice(0, 3).join(', ')}${changedFiles.length > 3 ? '...' : ''}`);
  }
  
  details.push('Build artifacts deployed to production server');
  details.push('Nginx reloaded to serve updated files');
  
  return {
    date,
    time,
    type: detectChangeType(title),
    title,
    description,
    details
  };
}

function createLogEntriesFromCommits() {
  const commits = getRecentGitCommits(3);
  
  return commits.map(commit => {
    const type = detectChangeType(commit.message);
    return {
      date: commit.date,
      time: commit.time,
      type,
      title: commit.message,
      description: `Committed changes: ${commit.message}`,
      details: []
    };
  }).filter(entry => {
    // Filter out generic commit messages
    const genericMessages = ['update', 'commit', 'merge', 'wip'];
    return !genericMessages.some(msg => entry.title.toLowerCase() === msg);
  });
}

function formatLogEntry(entry) {
  const details = entry.details && entry.details.length > 0
    ? `,
      details: [
${entry.details.map(d => `        '${d}'`).join(',\n')}
      ]`
    : '';
  
  return `    {
      date: '${entry.date}',
      time: '${entry.time}',
      type: '${entry.type}',
      title: '${entry.title}',
      description: '${entry.description}'${details}
    }`;
}

function checkForDuplicates(content, newEntry) {
  // Check if an entry with same title and date already exists
  const titleRegex = new RegExp(`title: '${newEntry.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g');
  const dateRegex = new RegExp(`date: '${newEntry.date}'`, 'g');
  
  const titleMatches = (content.match(titleRegex) || []).length;
  const dateMatches = (content.match(dateRegex) || []).length;
  
  // If there are multiple entries with same title today, it's likely a duplicate from testing
  if (titleMatches > 0 && dateMatches > 3) {
    return true;
  }
  
  return false;
}

function updateLogFile() {
  try {
    let content = fs.readFileSync(LOG_FILE, 'utf-8');
    
    // Create new log entry for this build
    const buildEntry = createBuildLogEntry();
    
    // Check for recent duplicates
    if (checkForDuplicates(content, buildEntry)) {
      console.log('⏭️  Skipping duplicate log entry (same build detected)');
      console.log(`   Title: ${buildEntry.title}`);
      console.log(`   Date: ${buildEntry.date}`);
      return true;
    }
    
    const newEntryText = formatLogEntry(buildEntry);
    
    // Find the logEntries array start
    const arrayStartRegex = /const logEntries: LogEntry\[\] = remoteLogs \?\? \[\s*\{/;
    const match = content.match(arrayStartRegex);
    
    if (!match) {
      // Log not found but don't fail the build
      console.warn('⚠️  Could not find logEntries array in Log.tsx - skipping log update');
      return true;
    }
    
    // Insert new entry at the beginning of the array
    const insertPoint = match.index + match[0].length;
    const beforeInsert = content.substring(0, match.index);
    const afterArrayStart = content.substring(insertPoint);
    
    // Remove the opening brace from the match since we'll add it with the new entry
    const arrayDeclaration = match[0].replace(/\{$/, '');
    
    content = beforeInsert + arrayDeclaration + '\n' + newEntryText + ',\n    {' + afterArrayStart;
    
    fs.writeFileSync(LOG_FILE, content, 'utf-8');
    
    console.log('✅ Log entry added successfully!');
    console.log(`   Date: ${buildEntry.date} at ${buildEntry.time}`);
    console.log(`   Type: ${buildEntry.type}`);
    console.log(`   Title: ${buildEntry.title}`);
    
    return true;
  } catch (error) {
    console.error('Error updating log file:', error.message);
    return false;
  }
}

// Check if we should skip (avoid infinite loop during build)
if (process.env.SKIP_LOG_UPDATE === 'true') {
  console.log('⏭️  Skipping log update (SKIP_LOG_UPDATE=true)');
  process.exit(0);
}

// Run the update
const success = updateLogFile();
process.exit(success ? 0 : 1);
