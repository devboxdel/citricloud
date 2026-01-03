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

function getRecentGitCommits(count = 20) {
  try {
    // Get commits from the last 7 days to avoid duplicates from older history
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sinceDate = sevenDaysAgo.toISOString().split('T')[0];
    
    const commits = execSync(
      `git log --since="${sinceDate}" --pretty=format:"%H|||%s|||%ad" --date=format:"%Y-%m-%d %H:%M"`, 
      {
        encoding: 'utf-8',
        cwd: path.join(__dirname, '..')
      }
    ).split('\n').filter(Boolean);
    
    return commits.map(commit => {
      const [hash, message, datetime] = commit.split('|||');
      const [date, time] = datetime.split(' ');
      return { hash, message, date, time };
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
  const commits = getRecentGitCommits(20);
  
  return commits.map(commit => {
    const type = detectChangeType(commit.message);
    
    // Extract more detailed description from commit message
    let description = commit.message;
    let details = [];
    
    // If commit message has multiple lines or detailed info
    if (commit.message.includes('\n')) {
      const lines = commit.message.split('\n').filter(Boolean);
      description = lines[0];
      details = lines.slice(1).map(line => line.trim()).filter(Boolean);
    }
    
    return {
      hash: commit.hash,
      date: commit.date,
      time: commit.time,
      type,
      title: description,
      description: `Git commit: ${description}`,
      details
    };
  }).filter(entry => {
    // Filter out generic commit messages
    const genericMessages = ['wip', 'temp', 'test'];
    return !genericMessages.some(msg => entry.title.toLowerCase().includes(msg));
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
  // Extract commit hash if present for more accurate duplicate detection
  if (newEntry.hash) {
    const hashPattern = `hash-${newEntry.hash.substring(0, 8)}`;
    if (content.includes(hashPattern)) {
      return true;
    }
  }
  
  // Check if an entry with same title and date/time already exists
  const titleEscaped = newEntry.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const titleRegex = new RegExp(`title: '${titleEscaped}'`, 'g');
  const dateTimePattern = `date: '${newEntry.date}',\\s*time: '${newEntry.time}'`;
  const dateTimeRegex = new RegExp(dateTimePattern);
  
  // If exact same title and timestamp exists, it's a duplicate
  if (titleRegex.test(content) && dateTimeRegex.test(content)) {
    return true;
  }
  
  return false;
}

function updateLogFile() {
  try {
    let content = fs.readFileSync(LOG_FILE, 'utf-8');
    
    // Get all recent commits to add as log entries
    const commitEntries = createLogEntriesFromCommits();
    
    if (commitEntries.length === 0) {
      console.log('ℹ️  No new commits to add to logs');
      return true;
    }
    
    // Filter out duplicates
    const newEntries = commitEntries.filter(entry => !checkForDuplicates(content, entry));
    
    if (newEntries.length === 0) {
      console.log('⏭️  All commits already logged (no new entries)');
      return true;
    }
    
    // Sort by date/time (newest first)
    newEntries.sort((a, b) => {
      const dateTimeA = `${a.date} ${a.time}`;
      const dateTimeB = `${b.date} ${b.time}`;
      return dateTimeB.localeCompare(dateTimeA);
    });
    
    // Format all new entries
    const formattedEntries = newEntries.map(formatLogEntry).join(',\n');
    
    // Find the logEntries array start
    const arrayStartRegex = /const logEntries: LogEntry\[\] = remoteLogs \?\? \[\s*\{/;
    const match = content.match(arrayStartRegex);
    
    if (!match) {
      console.warn('⚠️  Could not find logEntries array in Log.tsx - skipping log update');
      return true;
    }
    
    // Insert new entries at the beginning of the array
    const insertPoint = match.index + match[0].length;
    const beforeInsert = content.substring(0, match.index);
    const afterArrayStart = content.substring(insertPoint);
    
    // Remove the opening brace from the match since we'll add it with the new entries
    const arrayDeclaration = match[0].replace(/\{$/, '');
    
    content = beforeInsert + arrayDeclaration + '\n' + formattedEntries + ',\n    {' + afterArrayStart;
    
    fs.writeFileSync(LOG_FILE, content, 'utf-8');
    
    console.log(`✅ ${newEntries.length} log ${newEntries.length === 1 ? 'entry' : 'entries'} added successfully!`);
    newEntries.forEach(entry => {
      console.log(`   • ${entry.date} ${entry.time} - ${entry.title}`);
    });
    
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
