import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Palette,
  FileText,
  MessageSquare,
  Wine,
  Sparkles,
  Copy,
  Check,
  Clock,
  Zap,
} from 'lucide-react';
import type { EventPlan, InvitationDraft, SpeechDraft } from '../types/event';
import { AiService } from '../services/aiService';

interface CreativeStudioProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ event, onUpdateEvent }) => {
  const [activeTab, setActiveTab] = useState<'palette' | 'invitations' | 'speeches' | 'activities'>('palette');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [copiedSpeechId, setCopiedSpeechId] = useState<string | null>(null);

  // Speech Generator Form State
  const [speechRole, setSpeechRole] = useState(
    event.type === 'wedding'
      ? 'Maid of Honor'
      : event.type === 'birthday'
      ? 'Host / Best Friend'
      : 'Committee Chair'
  );
  const [speechTone, setSpeechTone] = useState<'humorous' | 'emotional' | 'inspiring' | 'welcoming'>('emotional');
  const [speechDuration, setSpeechDuration] = useState<number>(3);
  const [speechAnecdote, setSpeechAnecdote] = useState('');
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCopyInvite = (draft: InvitationDraft) => {
    const text = `${draft.headline}\n\n${draft.body}\n\nRSVP: ${draft.rsvpNote}`;
    navigator.clipboard.writeText(text);
    setCopiedInviteId(draft.id);
    setTimeout(() => setCopiedInviteId(null), 2000);
  };

  const handleCopySpeech = (draft: SpeechDraft) => {
    navigator.clipboard.writeText(`${draft.title}\n\n${draft.content}`);
    setCopiedSpeechId(draft.id);
    setTimeout(() => setCopiedSpeechId(null), 2000);
  };

  const handleGenerateSpeech = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingSpeech(true);

    setTimeout(() => {
      const generated = AiService.generateDeterministicSpeech(event, {
        role: speechRole,
        tone: speechTone,
        durationMinutes: speechDuration,
        anecdotes: speechAnecdote.trim().slice(0, 500) || undefined,
      });

      const newDraft: SpeechDraft = {
        id: `speech-${Date.now()}`,
        role: speechRole,
        title: generated.title,
        tone: speechTone,
        content: generated.content,
        speakingTimeMin: speechDuration,
        deliveryTips: generated.deliveryTips,
      };

      const updated = {
        ...event,
        creative: {
          ...event.creative,
          speechDrafts: [newDraft, ...event.creative.speechDrafts],
        },
      };

      onUpdateEvent(updated);
      setIsGeneratingSpeech(false);
      setSpeechAnecdote('');
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Studio Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h2 style={{ fontSize: 'var(--type-heading-lg)', marginBottom: 'var(--space-1)' }}>
            Sensory Creative Studio & Speechwriter
          </h2>
          <p style={{ fontSize: 'var(--type-body-sm)' }}>
            Curate your aesthetic palette, generate invitations across 4 tones, and ghostwrite memorable toasts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(14, 19, 31, 0.8)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-full)',
            padding: '3px',
            gap: '2px',
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'palette' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => setActiveTab('palette')}
          >
            <Palette size={14} />
            <span>Palette & Theme</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'invitations' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => setActiveTab('invitations')}
          >
            <FileText size={14} />
            <span>Invitations</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'speeches' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => setActiveTab('speeches')}
          >
            <MessageSquare size={14} />
            <span>Speechwriter</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'activities' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => setActiveTab('activities')}
          >
            <Wine size={14} />
            <span>Bar & Activities</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PALETTE & THEME */}
      {activeTab === 'palette' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Theme Banner Card */}
          <div
            className="glass-card"
            style={{
              background: 'rgba(20, 27, 44, 0.78)',
            }}
          >
            <span className="badge badge-gold" style={{ marginBottom: '8px' }}>
              Curated Theme
            </span>
            <h3 style={{ fontSize: 'var(--type-heading-lg)', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {event.creative.themeName}
            </h3>
            <p style={{ fontStyle: 'italic', color: 'var(--gold-300)', marginBottom: '8px' }}>
              "{event.creative.tagline}"
            </p>
            <p style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
              {event.creative.moodDescription}
            </p>
          </div>

          {/* Color Swatches Grid */}
          <div>
            <h4 style={{ fontSize: 'var(--type-heading-md)', marginBottom: 'var(--space-3)' }}>
              Hex Color Swatches (Click to copy code)
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 'var(--space-3)',
              }}
            >
              {event.creative.palette.map((swatch, idx) => (
                <motion.div
                  key={idx}
                  className="glass-card glass-card-interactive spotlight-card"
                  style={{
                    padding: 'var(--space-3)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                  onClick={() => handleCopyHex(swatch.hex)}
                  title="Click to copy HEX code"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div
                    style={{
                      height: '80px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: swatch.hex,
                      boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                      padding: '8px',
                    }}
                  >
                    {copiedHex === swatch.hex && (
                      <span className="badge badge-success" style={{ background: '#000', color: '#10B981' }}>
                        <Check size={10} /> Copied!
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)' }}>
                        {swatch.name}
                      </div>
                      <div style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {swatch.role}
                      </div>
                    </div>
                    <code style={{ fontSize: '0.75rem', color: 'var(--gold-400)' }}>{swatch.hex}</code>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INVITATIONS */}
      {activeTab === 'invitations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--type-body-sm)' }}>
            Four ready-to-dispatch invitation drafts synthesized across luxury editorial tones:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {event.creative.invitationDrafts.map((draft) => (
              <div
                key={draft.id}
                className="glass-card glass-card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 'var(--space-3)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>
                      {draft.style.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleCopyInvite(draft)}
                      title="Copy invitation text"
                    >
                      {copiedInviteId === draft.id ? (
                        <span style={{ color: 'var(--status-success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Copied
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Copy size={14} /> Copy
                        </span>
                      )}
                    </button>
                  </div>

                  <h4 style={{ fontSize: 'var(--type-heading-md)', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {draft.headline}
                  </h4>

                  <p
                    style={{
                      fontSize: 'var(--type-body-sm)',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.6',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    {draft.body}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px',
                    fontSize: 'var(--type-caption-xs)',
                    color: 'var(--gold-400)',
                  }}
                >
                  <strong>RSVP Note:</strong> {draft.rsvpNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: SPEECHWRITER */}
      {activeTab === 'speeches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Interactive Generator Box */}
          <div className="glass-card" style={{ border: '1px solid var(--gold-glow)' }}>
            <h3 style={{ fontSize: 'var(--type-heading-md)', marginBottom: 'var(--space-3)', color: 'var(--gold-400)' }}>
              Ghostwrite a Bespoke Speech or Toast
            </h3>
            <form onSubmit={handleGenerateSpeech}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="speech-speaker-role">Speaker Role</label>
                  <select
                    id="speech-speaker-role"
                    className="form-select"
                    value={speechRole}
                    onChange={(e) => setSpeechRole(e.target.value)}
                  >
                    <option value="Maid of Honor">Maid of Honor</option>
                    <option value="Best Man">Best Man</option>
                    <option value="Host / Best Friend">Host / Best Friend</option>
                    <option value="Parent of Honoree">Parent of Honoree</option>
                    <option value="Committee Chair">Committee Chair / Organizer</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="speech-desired-tone">Desired Tone</label>
                  <select
                    id="speech-desired-tone"
                    className="form-select"
                    value={speechTone}
                    onChange={(e) => setSpeechTone(e.target.value as 'humorous' | 'emotional' | 'inspiring' | 'welcoming')}
                  >
                    <option value="emotional">Emotional & Heartfelt</option>
                    <option value="humorous">Humorous & Playful</option>
                    <option value="inspiring">Inspiring & Uplifting</option>
                    <option value="welcoming">Warm & Welcoming</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="speech-target-duration">Target Duration</label>
                  <select
                    id="speech-target-duration"
                    className="form-select"
                    value={speechDuration}
                    onChange={(e) => setSpeechDuration(parseInt(e.target.value, 10))}
                  >
                    <option value={1}>1 Minute (Concise Toast)</option>
                    <option value={3}>3 Minutes (Sweet Spot)</option>
                    <option value={5}>5 Minutes (Full Keynote)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="speech-anecdote-input">Personal Anecdote or Memory Prompt</label>
                <input
                  id="speech-anecdote-input"
                  type="text"
                  className="form-input"
                  maxLength={500}
                  placeholder="e.g. The crazy road trip to Big Sur, or how they stayed late to help launch our initiative..."
                  value={speechAnecdote}
                  onChange={(e) => setSpeechAnecdote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isGeneratingSpeech}
                >
                  <Sparkles size={16} />
                  <span>{isGeneratingSpeech ? 'Composing...' : 'Generate Toast Framework'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Rendered Speech Drafts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {event.creative.speechDrafts.map((draft) => (
              <div key={draft.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-gold">{draft.role}</span>
                    <span className="badge badge-info">{draft.tone}</span>
                    <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
                      • ~{draft.speakingTimeMin} mins speaking time
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopySpeech(draft)}
                  >
                    {copiedSpeechId === draft.id ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                    <span>{copiedSpeechId === draft.id ? 'Copied' : 'Copy Full Speech'}</span>
                  </button>
                </div>

                <h4 style={{ fontSize: 'var(--type-heading-md)', color: 'var(--text-primary)' }}>
                  {draft.title}
                </h4>

                <div
                  style={{
                    background: 'rgba(14, 19, 31, 0.7)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    whiteSpace: 'pre-line',
                    fontSize: 'var(--type-body-sm)',
                    lineHeight: '1.7',
                    color: 'var(--text-primary)',
                  }}
                >
                  {draft.content}
                </div>

                {/* Delivery Tips */}
                {draft.deliveryTips && draft.deliveryTips.length > 0 && (
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.05)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                    }}
                  >
                    <span style={{ fontSize: 'var(--type-caption-xs)', fontWeight: 700, color: 'var(--gold-400)' }}>
                      PRO DELIVERY CUES:
                    </span>
                    <ul style={{ paddingLeft: '18px', marginTop: '4px', fontSize: 'var(--type-caption-xs)', color: 'var(--text-secondary)' }}>
                      {draft.deliveryTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: BAR & ACTIVITIES */}
      {activeTab === 'activities' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
          {/* Signature Drinks */}
          <div>
            <h3 style={{ fontSize: 'var(--type-heading-md)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wine size={18} color="var(--gold-400)" />
              <span>Signature Themed Cocktails & Mocktails</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {event.creative.signatureDrinks.map((drink, idx) => (
                <div key={idx} className="glass-card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--type-body-base)', color: 'var(--text-primary)' }}>
                      {drink.name}
                    </span>
                    <span className={`badge ${drink.type === 'cocktail' ? 'badge-gold' : 'badge-info'}`}>
                      {drink.type}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {drink.description}
                  </p>
                  <div style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
                    <strong>Ingredients: </strong>
                    {drink.ingredients.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crowd Engaging Activities */}
          <div>
            <h3 style={{ fontSize: 'var(--type-heading-md)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--cat-music)" />
              <span>Crowd-Engaging Moments & Games</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {event.creative.activities.map((act) => (
                <div key={act.id} className="glass-card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--type-body-base)', color: 'var(--text-primary)' }}>
                      {act.title}
                    </span>
                    <span className="badge badge-muted">
                      <Clock size={10} /> {act.durationMin} mins
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {act.description}
                  </p>
                  {act.suppliesNeeded && act.suppliesNeeded.length > 0 && (
                    <div style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
                      <strong>Supplies Needed: </strong>
                      {act.suppliesNeeded.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
