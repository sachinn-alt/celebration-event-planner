import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Download,
  Upload,
  Printer,
  RotateCcw,
  Key,
  ShieldCheck,
  Clock,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import type { EventPlan, EventType } from '../types/event';
import { StorageService } from '../services/storage';

interface HeaderProps {
  activeEvent: EventPlan;
  allEvents: EventPlan[];
  onSelectEvent: (id: string) => void;
  onResetPresets: () => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  onImportEvent: (imported: EventPlan) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeEvent,
  allEvents,
  onSelectEvent,
  onResetPresets,
  onOpenApiKeyModal,
  hasApiKey,
  onImportEvent,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analytics = StorageService.calculateBudgetAnalytics(activeEvent);
  const timelineAnalytics = StorageService.calculateTimelineAnalytics(activeEvent);

  const [now] = useState(() => Date.now());

  // Calculate days remaining
  const daysRemaining = React.useMemo(() => {
    const eventDate = new Date(activeEvent.date);
    const timeDiff = eventDate.getTime() - now;
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  }, [activeEvent.date, now]);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeEvent, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `eventiq-${activeEvent.type}-${activeEvent.date}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.id && parsed.title && parsed.budget && parsed.timeline) {
          onImportEvent(parsed);
          alert(`Successfully imported "${parsed.title}"!`);
        } else {
          alert('Invalid EventiQ JSON schema. Missing required event properties.');
        }
      } catch {
        alert('Failed to parse uploaded JSON file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getArchetypeBadgeClass = (type: EventType) => {
    switch (type) {
      case 'wedding':
        return 'badge-gold';
      case 'birthday':
        return 'badge-info';
      case 'community':
        return 'badge-success';
    }
  };

  return (
    <header style={{ marginBottom: 'var(--space-6)', paddingTop: 'var(--space-4)' }}>
      {/* Top Bar: Brand, Switcher, and Global Utilities */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gold-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Sparkles size={20} color="var(--text-inverse)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                EventiQ
              </span>
              <span className="badge badge-gold">Studio</span>
            </div>
            <p style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
              Celebration & Event Production Atelier
            </p>
          </div>
        </div>

        {/* Archetype Quick Switcher */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(15, 20, 34, 0.9)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-full)',
            padding: '3px',
            gap: '2px',
          }}
        >
          {allEvents.map((evt) => {
            const isActive = evt.id === activeEvent.id;
            return (
              <button
                key={evt.id}
                type="button"
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: 'var(--type-caption-xs)',
                  fontWeight: 600,
                }}
                onClick={() => onSelectEvent(evt.id)}
              >
                {evt.type === 'wedding' && 'Wedding'}
                {evt.type === 'birthday' && 'Milestone Birthday'}
                {evt.type === 'community' && 'Community Gala'}
              </button>
            );
          })}
        </div>

        {/* Global Toolbar: Key Vault, Import, Export, Print, Reset */}
        <div className="action-buttons no-print" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className={`btn btn-sm ${hasApiKey ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              borderColor: hasApiKey ? 'rgba(16, 185, 129, 0.4)' : undefined,
              fontSize: 'var(--type-caption-xs)',
            }}
            onClick={onOpenApiKeyModal}
            title={hasApiKey ? 'Google Gemini 1.5 Flash Connected' : 'Running Offline Heuristic Engine'}
          >
            <Key size={14} color={hasApiKey ? 'var(--status-success)' : 'var(--gold-400)'} />
            <span>{hasApiKey ? 'Gemini 1.5 Active' : 'Offline Engine'}</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleExportJson}
            title="Download JSON backup"
          >
            <Download size={14} />
            <span className="hide-on-mobile">Backup</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".json,application/json"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON backup"
          >
            <Upload size={14} />
            <span className="hide-on-mobile">Restore</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => window.print()}
            title="Print Ink-Friendly Itinerary"
          >
            <Printer size={14} />
            <span className="hide-on-mobile">Print</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (window.confirm('Reset all events to pristine factory presets? Custom changes will be cleared.')) {
                onResetPresets();
              }
            }}
            title="Reset to Factory Presets"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Event Hero Title & Logistics Metadata Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className={`badge ${getArchetypeBadgeClass(activeEvent.type)}`}>
              {activeEvent.type}
            </span>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
              • {activeEvent.vibe}
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--type-display-xl)', color: 'var(--text-primary)' }}>
            {activeEvent.title}
          </h1>
        </div>

        {/* Event Coordinates Pill Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--type-body-sm)' }}>
            <Calendar size={16} color="var(--gold-400)" />
            <span>{activeEvent.date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--type-body-sm)' }}>
            <MapPin size={16} color="var(--gold-400)" />
            <span>{activeEvent.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--type-body-sm)' }}>
            <Users size={16} color="var(--gold-400)" />
            <span>{activeEvent.guestCount} Guests</span>
          </div>
        </div>
      </div>

      {/* Executive Financial & Horizon HUD Deck */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {/* Metric 1: Total Budget */}
        <div className="glass-card glass-card-sm" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Budget
            </span>
            <DollarSign size={16} color="var(--gold-400)" />
          </div>
          <div style={{ fontSize: 'var(--type-metric-val)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {activeEvent.budget.currency}
            {analytics.totalBudget.toLocaleString()}
          </div>
          <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-secondary)' }}>
            Per guest: {activeEvent.budget.currency}
            {analytics.perGuestSpend.toLocaleString()}
          </span>
        </div>

        {/* Metric 2: Allocated Spend */}
        <div className="glass-card glass-card-sm" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Allocated Spend
            </span>
            <TrendingUp size={16} color="var(--cat-catering)" />
          </div>
          <div style={{ fontSize: 'var(--type-metric-val)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {activeEvent.budget.currency}
            {analytics.actualSpent.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, analytics.percentSpent)}%`,
                  height: '100%',
                  background:
                    analytics.percentSpent > 100
                      ? 'var(--status-danger)'
                      : analytics.percentSpent > 90
                      ? 'var(--status-warning)'
                      : 'var(--gold-400)',
                }}
              />
            </div>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
              {analytics.percentSpent}%
            </span>
          </div>
        </div>

        {/* Metric 3: Solvency Remaining */}
        <div className="glass-card glass-card-sm" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Available Buffer
            </span>
            <span className={`badge ${analytics.remaining >= 0 ? 'badge-success' : 'badge-danger'}`}>
              {analytics.remaining >= 0 ? 'Solvent' : 'Deficit'}
            </span>
          </div>
          <div
            style={{
              fontSize: 'var(--type-metric-val)',
              fontWeight: 700,
              color: analytics.remaining >= 0 ? 'var(--status-success)' : 'var(--status-danger)',
            }}
          >
            {activeEvent.budget.currency}
            {Math.abs(analytics.remaining).toLocaleString()}
          </div>
          <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
            {analytics.remaining >= 0 ? 'Unallocated capacity' : 'Requires line item reduction'}
          </span>
        </div>

        {/* Metric 4: Contingency Shield */}
        <div className="glass-card glass-card-sm" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contingency Shield
            </span>
            <ShieldCheck size={16} color="var(--cat-contingency)" />
          </div>
          <div style={{ fontSize: 'var(--type-metric-val)', fontWeight: 700, color: 'var(--cat-contingency)' }}>
            {activeEvent.budget.currency}
            {analytics.contingencyReserved.toLocaleString()}
          </div>
          <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
            {activeEvent.budget.contingencyPercent}% locked emergency pool
          </span>
        </div>

        {/* Metric 5: Countdown & Milestone Horizon */}
        <div className="glass-card glass-card-sm" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Countdown
            </span>
            <Clock size={16} color="var(--gold-400)" />
          </div>
          <div style={{ fontSize: 'var(--type-metric-val)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {daysRemaining} Days
          </div>
          <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-secondary)' }}>
            {timelineAnalytics.completed} of {timelineAnalytics.total} milestones ({timelineAnalytics.percent}%)
          </span>
        </div>
      </div>
    </header>
  );
};
