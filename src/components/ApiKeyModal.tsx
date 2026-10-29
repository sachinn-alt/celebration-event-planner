import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Eye, EyeOff, ShieldCheck, Check, AlertCircle, ExternalLink, X } from 'lucide-react';
import { StorageService } from '../services/storage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

const ApiKeyModalDialog: React.FC<{ onClose: () => void; onKeySaved: () => void }> = ({
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState(() => StorageService.getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSave = () => {
    StorageService.setApiKey(apiKey);
    onKeySaved();
    onClose();
  };

  const handleClear = () => {
    StorageService.setApiKey('');
    setApiKey('');
    setStatus('idle');
    setStatusMsg('API Key removed. Switched to Offline Heuristic Mode.');
    onKeySaved();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setStatusMsg('Please enter an API key first.');
      return;
    }
    setStatus('testing');
    setStatusMsg('Testing connection to Google Gemini 1.5 Flash...');

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping test. Reply with word OK.' }] }],
        }),
      });

      if (res.ok) {
        setStatus('success');
        setStatusMsg('Connection successful! Google Gemini is authenticated and ready.');
      } else {
        const errData = await res.json().catch(() => ({}));
        setStatus('error');
        setStatusMsg(`Authentication failed: ${errData.error?.message || res.statusText}`);
      }
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(`Network error: ${err instanceof Error ? err.message : 'Failed to reach Google Gemini API'}`);
    }
  };

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
    >
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="var(--color-carbon)" />
            <h2 id="api-modal-title" className="modal-title">Google Gemini Key Vault</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <p style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--type-body-sm)' }}>
          Connect your Google Gemini API key to activate live reasoning with <strong>Gemini 1.5 Flash</strong>. 
          If no key is provided, EventiQ runs autonomously using the built-in <strong>Offline Heuristic Engine</strong> with zero network dependencies.
        </p>

        <div className="form-group">
          <label className="form-label" htmlFor="gemini-key-input">
            <span>Gemini API Key</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-voltage-violet)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: 'var(--type-caption-xs)' }}
            >
              Get Free Gemini Key <ExternalLink size={12} />
            </a>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="gemini-key-input"
              type={showKey ? 'text' : 'password'}
              className="form-input"
              style={{ paddingRight: '44px' }}
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
            <button
              type="button"
              className="btn btn-ghost"
              style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '6px' }}
              onClick={() => setShowKey(!showKey)}
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {status !== 'idle' && (
          <div
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: 'var(--type-body-sm)',
              background:
                status === 'success'
                  ? 'var(--status-success-bg)'
                  : status === 'error'
                  ? 'var(--color-ember)'
                  : 'var(--color-soft-mist)',
              color:
                status === 'success'
                  ? '#057a44'
                  : status === 'error'
                  ? '#ffffff'
                  : 'var(--color-carbon)',
              fontWeight: 600,
            }}
          >
            {status === 'success' && <Check size={16} />}
            {status === 'error' && <AlertCircle size={16} />}
            {status === 'testing' && <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>}
            <span>{statusMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: 'var(--space-3)', background: 'var(--color-sky-wash)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)', border: '1px solid var(--color-carbon)' }}>
          <ShieldCheck size={18} color="var(--color-carbon)" />
          <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--color-carbon)', fontWeight: 600 }}>
            Client-Side Vault: Your API key is stored strictly in your browser session. It is never logged or sent to any third-party server.
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn-danger btn-sm" onClick={handleClear} disabled={!apiKey}>
            Clear Key
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleTestKey} disabled={!apiKey.trim() || status === 'testing'}>
              {status === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>
              Save & Apply
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  return (
    <AnimatePresence>
      {isOpen && <ApiKeyModalDialog onClose={onClose} onKeySaved={onKeySaved} />}
    </AnimatePresence>
  );
};
