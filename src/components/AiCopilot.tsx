import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  X,
  Send,
  CheckCircle,
  Copy,
  Check,
  ChevronRight,
  Key,
} from 'lucide-react';
import type { EventPlan } from '../types/event';
import { AiService, type AiResponse } from '../services/aiService';

interface AiCopilotProps {
  event: EventPlan;
  activeTab: string;
  isOpen: boolean;
  onToggle: () => void;
  onOpenKeyVault: () => void;
  hasApiKey: boolean;
}

export const AiCopilot: React.FC<AiCopilotProps> = ({
  event,
  activeTab,
  isOpen,
  onToggle,
  onOpenKeyVault,
  hasApiKey,
}) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestResponse, setLatestResponse] = useState<AiResponse | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Proactive Background Audit
  const auditInsights = AiService.runHeuristicAudit(event);
  const criticalCount = auditInsights.filter((i) => i.severity === 'critical' || i.severity === 'warning').length;

  // Contextual prompt chips based on active tab
  const getPromptChips = () => {
    switch (activeTab) {
      case 'budget':
        return [
          'How can I shave $2,000 off without compromising guest experience?',
          'What unexpected vendor gratuities should I budget for?',
          'Audit my category allocations against industry benchmarks',
        ];
      case 'timeline':
        return [
          'Audit my Day-of Run of Show for schedule collisions',
          'Where should I insert safety buffers between moments?',
          'What critical tasks are typically forgotten 2 weeks out?',
        ];
      case 'vendors':
        return [
          'What questions should I ask my photographer before signing?',
          'How do I negotiate a corkage fee discount with the venue?',
          'What crew meal requirements should be written into contracts?',
        ];
      case 'creative':
        return [
          'Ghostwrite a 3-minute humorous Maid of Honor toast',
          'Suggest two complementary signature cocktails',
          'Draft an elegant black-tie invitation announcement',
        ];
      default:
        return [
          'Give me an executive readiness audit of this event',
          'What are my top 3 biggest financial and logistical risks?',
          'Suggest a high-impact cost optimization plan',
        ];
    }
  };

  const handleAskDirector = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    setIsLoading(true);
    setUserInput('');

    try {
      const response = await AiService.consultDirector(event, promptText, activeTab);
      setLatestResponse(response);
    } catch (err) {
      console.error('Error consulting director:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <>
      {/* Floating Action Button (FAB) in bottom right */}
      {!isOpen && (
        <button
          type="button"
          className="btn btn-primary ai-fab"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            borderRadius: 'var(--radius-full)',
            padding: '10px 18px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onClick={onToggle}
          aria-label="Open Planning Director Advisor"
        >
          <Sparkles size={16} />
          <span style={{ fontWeight: 600 }}>Director</span>
          {criticalCount > 0 && (
            <span
              style={{
                background: '#dc2626',
                color: '#fff',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--type-caption-xs)',
                fontWeight: 700,
                marginLeft: '4px',
              }}
            >
              {criticalCount}
            </span>
          )}
        </button>
      )}

      {/* Slide-in Obsidian Glass Drawer */}
      {isOpen && (
        <aside className="drawer-panel" aria-label="AI Event Director Assistant">
          {/* Drawer Header */}
          <div
            style={{
              padding: 'var(--space-4)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(14, 19, 31, 0.95)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} color="var(--text-inverse)" />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--type-heading-md)', color: 'var(--text-primary)' }}>
                  EventiQ Director
                </h3>
                <button
                  type="button"
                  onClick={onOpenKeyVault}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: 'var(--type-caption-xs)',
                    color: hasApiKey ? 'var(--status-success)' : 'var(--gold-400)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Configure Gemini API Key"
                >
                  <span>{hasApiKey ? '⚡ Gemini 1.5 Flash' : '🧠 Offline Heuristic Mode'}</span>
                  <Key size={10} />
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={onToggle}
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body Scrollable Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            {/* Proactive Risk & Anomaly Alerts Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--type-caption-xs)',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Active Health Diagnostics
                </span>
                <span className={`badge ${criticalCount === 0 ? 'badge-success' : 'badge-danger'}`}>
                  {criticalCount === 0 ? 'All Clear' : `${criticalCount} Issues Flagged`}
                </span>
              </div>

              {auditInsights.length === 0 ? (
                <div
                  style={{
                    padding: 'var(--space-3)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    fontSize: 'var(--type-body-sm)',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle size={16} />
                  <span>Budget, timeline buffers, and vendor pipelines are healthy!</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {auditInsights.map((insight) => (
                    <div
                      key={insight.id}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        background:
                          insight.severity === 'critical'
                            ? 'rgba(239, 68, 68, 0.12)'
                            : insight.severity === 'warning'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(6, 182, 212, 0.1)',
                        border: `1px solid ${
                          insight.severity === 'critical'
                            ? 'rgba(239, 68, 68, 0.35)'
                            : insight.severity === 'warning'
                            ? 'rgba(245, 158, 11, 0.35)'
                            : 'rgba(6, 182, 212, 0.35)'
                        }`,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 'var(--type-body-sm)',
                          color: 'var(--text-primary)',
                          marginBottom: '2px',
                        }}
                      >
                        {insight.title}
                      </div>
                      <p style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-secondary)' }}>
                        {insight.description}
                      </p>
                      {insight.suggestedAction && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '0.688rem',
                            color: 'var(--gold-300)',
                            fontWeight: 600,
                          }}
                        >
                          👉 {insight.suggestedAction}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contextual Action Prompt Chips */}
            <div>
              <span
                style={{
                  fontSize: 'var(--type-caption-xs)',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Recommended Actions for {activeTab.toUpperCase()}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {getPromptChips().map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      whiteSpace: 'normal',
                      padding: '8px 12px',
                      fontSize: 'var(--type-caption-xs)',
                      lineHeight: '1.4',
                    }}
                    onClick={() => handleAskDirector(chip)}
                    disabled={isLoading}
                  >
                    <ChevronRight size={14} color="var(--gold-400)" style={{ flexShrink: 0 }} />
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Advisor Response Display */}
            {latestResponse && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--gold-400)" />
                  <span style={{ fontWeight: 700, fontSize: 'var(--type-body-sm)', color: 'var(--gold-400)' }}>
                    Director Recommendation
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 'var(--type-body-sm)',
                    lineHeight: '1.6',
                    color: 'var(--text-primary)',
                  }}
                >
                  {latestResponse.strategicAdvice}
                </p>

                {/* Draft Content (e.g. Speech or Invitation) with Copy button */}
                {latestResponse.draftContent && (
                  <div
                    style={{
                      background: 'rgba(14, 19, 31, 0.85)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--gold-400)', fontWeight: 600 }}>
                        Synthesized Content Draft
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 6px', fontSize: 'var(--type-caption-xs)' }}
                        onClick={() => handleCopyDraft(latestResponse.draftContent || '')}
                      >
                        {copiedDraft ? <Check size={12} color="var(--status-success)" /> : <Copy size={12} />}
                        <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p
                      style={{
                        fontSize: 'var(--type-caption-xs)',
                        whiteSpace: 'pre-line',
                        lineHeight: '1.6',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {latestResponse.draftContent}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prompt Input Form at Bottom of Drawer */}
          <div
            style={{
              padding: 'var(--space-3)',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(14, 19, 31, 0.95)',
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskDirector(userInput);
              }}
              style={{ display: 'flex', gap: 'var(--space-2)' }}
            >
              <input
                type="text"
                className="form-input"
                style={{ padding: '8px 12px', fontSize: 'var(--type-body-sm)' }}
                placeholder="Ask EventiQ Director..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 14px' }}
                disabled={isLoading || !userInput.trim()}
              >
                {isLoading ? '...' : <Send size={15} />}
              </button>
            </form>
          </div>
        </aside>
      )}
    </>
  );
};
