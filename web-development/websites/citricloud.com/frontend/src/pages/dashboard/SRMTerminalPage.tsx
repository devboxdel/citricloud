import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiTerminal, FiSend, FiCopy, FiTrash2 } from 'react-icons/fi';

export default function SRMTerminalPage() {
  const [command, setCommand] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const allowedCommands = ['ls', 'pwd', 'whoami', 'uptime', 'df', 'ps', 'top', 'free', 'lsof', 'netstat', 'systemctl', 'journalctl'];

  const executeCommand = async () => {
    if (!command.trim()) return;

    const cmdName = command.split(' ')[0] || '';
    if (!allowedCommands.includes(cmdName)) {
      setError(`Command "${cmdName}" is not allowed. Allowed commands: ${allowedCommands.join(', ')}`);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await srmAPI.executeCommand(command);
      setHistory([
        ...history,
        {
          command,
          timestamp: new Date(),
          stdout: response.data.stdout,
          stderr: response.data.stderr,
          returncode: response.data.returncode,
        },
      ]);
      setCommand('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to execute command');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <DashboardLayout
      title="Server Resources - Terminal"
      breadcrumb={<div className="text-xs text-gray-500">Execute system commands</div>}
    >
      {/* Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
      >
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>⚠️ Security Notice:</strong> Only a limited set of read-only commands are allowed for security reasons.
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
          Allowed commands: {allowedCommands.join(', ')}
        </p>
      </motion.div>

      {/* Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl bg-gray-900 border border-gray-800 shadow-sm overflow-hidden"
      >
        {/* Terminal Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-gray-400">terminal</span>
          <button
            onClick={clearHistory}
            className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center gap-1 transition-colors"
          >
            <FiTrash2 className="w-3 h-3" />
            Clear
          </button>
        </div>

        {/* Terminal Content */}
        <div className="p-6 font-mono text-sm text-gray-300 bg-gray-900 min-h-96 max-h-96 overflow-y-auto space-y-4">
          {history.length === 0 && (
            <div className="text-gray-600 text-xs">
              <p>$ Welcome to CITRICLOUD Terminal</p>
              <p>$ Limited commands available for security</p>
              <p>$ Type a command and press Enter</p>
            </div>
          )}

          {history.map((entry, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-green-400">$</span>
                <span className="flex-1 ml-2 text-gray-100">{entry.command}</span>
                <button
                  onClick={() => copyToClipboard(entry.command)}
                  className="ml-2 text-gray-500 hover:text-gray-300 transition-colors"
                  title="Copy command"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </div>

              {entry.stderr && (
                <div className="ml-4 text-red-400 text-xs whitespace-pre-wrap break-words">{entry.stderr}</div>
              )}

              {entry.stdout && (
                <div className="ml-4 text-gray-300 text-xs whitespace-pre-wrap break-words">{entry.stdout}</div>
              )}

              {!entry.stdout && !entry.stderr && entry.returncode === 0 && (
                <div className="ml-4 text-gray-500 text-xs">&lt;no output&gt;</div>
              )}

              <div className="text-gray-600 text-xs">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {/* Terminal Input */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
          {error && (
            <div className="mb-3 text-red-400 text-sm">
              ✗ {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-green-400">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 focus:outline-none border-0"
              autoFocus
            />
            <button
              onClick={executeCommand}
              disabled={isLoading || !command.trim()}
              className="text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Execute command (Ctrl+Enter)"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Command Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Command Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">System Information</p>
            <code className="text-xs text-gray-700 dark:text-gray-300">uptime, whoami, ps, top, free</code>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">File System</p>
            <code className="text-xs text-gray-700 dark:text-gray-300">ls, pwd, df</code>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Network</p>
            <code className="text-xs text-gray-700 dark:text-gray-300">netstat, lsof</code>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">System Management</p>
            <code className="text-xs text-gray-700 dark:text-gray-300">systemctl, journalctl</code>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
