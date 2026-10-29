import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  MapPin,
  Download,
  Upload,
  Printer,
  RotateCcw,
  Key,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import type { EventPlan, EventType } from '../types/event';
import { StorageService } from '../services/storage';
import { IconlyAnimation } from './IconlyAnimation';

interface HeaderProps {
  activeEvent: EventPlan;
  allEvents: EventPlan[];
  onSelectEvent: (id: string) => void;
  onResetPresets: () => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  onImportEvent: (imported: EventPlan) => void;
  onOpenCreateModal: () => void;
  onDeleteEvent?: (id: string) => void;
  onGoToLanding?: () => void;
  isFxEnabled?: boolean;
  onToggleFx?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeEvent,
  allEvents,
  onSelectEvent,
  onResetPresets,
  onOpenApiKeyModal,
  hasApiKey,
  onImportEvent,
  onOpenCreateModal,
  onDeleteEvent,
  onGoToLanding,
  isFxEnabled = true,
  onToggleFx,
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
        {/* Brand Logo & Landing Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            onClick={onGoToLanding}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-sunburst)',
              border: '1px solid var(--color-carbon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: onGoToLanding ? 'pointer' : 'default',
            }}
            title={onGoToLanding ? 'Return to Landing Page' : undefined}
          >
            <IconlyAnimation name="party" size={26} alt="EventiQ Haute Atelier Celebration" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                onClick={onGoToLanding}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  color: 'var(--color-carbon)',
                  cursor: onGoToLanding ? 'pointer' : 'default',
                }}
                title={onGoToLanding ? 'Return to Landing Page' : undefined}
              >
                EventiQ
              </span>
              <span className="badge badge-gold">Studio</span>
              {onGoToLanding && (
                <button
                  type="button"
                  className="btn btn-secondary no-print"
                  onClick={onGoToLanding}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    border: '1px solid var(--color-carbon)',
                    background: 'var(--color-paper-white)',
                    cursor: 'pointer',
                  }}
                  title="Return to Landing Page"
                >
                  <span>← Landing</span>
                </button>
              )}
            </div>
            <p style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
              Celebration & Event Production Atelier
            </p>
          </div>
        </div>

        {/* Archetype Quick Switcher & New Event Trigger */}
        <div
          className="no-print archetype-switcher"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--color-paper-white)',
            border: '1px solid var(--color-carbon)',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
            gap: '4px',
          }}
        >
          {allEvents.map((evt) => {
            const isActive = evt.id === activeEvent.id;
            const isCustom = !['preset-wedding-autumn', 'preset-birthday-40th', 'preset-community-gala'].includes(evt.id);
            const label = isCustom
              ? evt.title.length > 16
                ? `${evt.title.slice(0, 14)}…`
                : evt.title
              : evt.type === 'wedding'
              ? 'Wedding'
              : evt.type === 'birthday'
              ? 'Milestone Birthday'
              : 'Community Gala';

            return (
              <div key={evt.id} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                <motion.button
                  type="button"
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: isCustom ? '6px 24px 6px 12px' : '6px 14px',
                    fontSize: 'var(--type-caption-xs)',
                    fontWeight: 600,
                  }}
                  onClick={() => onSelectEvent(evt.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {label}
                </motion.button>
                {isCustom && onDeleteEvent && allEvents.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete custom event "${evt.title}"?`)) {
                        onDeleteEvent(evt.id);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      right: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--text-inverse)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Delete custom celebration"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            );
          })}

          <motion.button
            type="button"
            className="btn btn-sm shimmer-btn"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '6px 13px',
              fontSize: 'var(--type-caption-xs)',
              gap: '4px',
            }}
            onClick={onOpenCreateModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Create Custom Celebration Atelier"
          >
            <Plus size={13} />
            <span>New</span>
          </motion.button>
        </div>

        {/* Global Toolbar: Key Vault, Import, Export, Print, Reset, Eco Mode */}
        <div className="action-buttons no-print" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {onToggleFx && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onToggleFx}
              style={{ fontSize: 'var(--type-caption-xs)', fontWeight: 700 }}
              title={isFxEnabled ? 'Switch to Eco Mode (Disables WebGL background to maximize speed & battery)' : 'Enable Ambient Flux FX'}
            >
              <span>{isFxEnabled ? '⚡ FX: ON' : '🌱 ECO'}</span>
            </button>
          )}

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
            <Key size={14} color="var(--color-carbon)" />
            <span style={{ color: 'var(--color-carbon)', fontWeight: 700 }}>{hasApiKey ? 'Gemini 1.5 Active' : 'Offline Engine'}</span>
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
            background: 'var(--color-paper-white)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-carbon)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--type-body-sm)', fontWeight: 600 }}>
            <Calendar size={16} color="var(--color-carbon)" />
            <span>{activeEvent.date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--type-body-sm)', fontWeight: 600 }}>
            <MapPin size={16} color="var(--color-carbon)" />
            <span>{activeEvent.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--type-body-sm)', fontWeight: 600 }}>
            <IconlyAnimation name="users-ai" size={16} alt="Guests" />
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
        <motion.div
          className="glass-card glass-card-sm spotlight-card"
          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Budget
            </span>
            <IconlyAnimation name="dollar-up" size={20} />
          </div>
          <div style={{ fontSize: 'var(--type-metric-val)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {activeEvent.budget.currency}
            {analytics.totalBudget.toLocaleString()}
          </div>
          <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-secondary)' }}>
            Per guest: {activeEvent.budget.currency}
            {analytics.perGuestSpend.toLocaleString()}
          </span>
        </motion.div>

        {/* Metric 2: Allocated Spend */}
        <motion.div
          className="glass-card glass-card-sm spotlight-card"
          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Allocated Spend
            </span>
            <IconlyAnimation name="receipt-check" size={20} />
          </div>
          <div style={{ fontSize: 'var(--type-metric-val)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {activeEvent.budget.currency}
            {analytics.actualSpent.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                height: '8px',
                background: 'var(--color-soft-mist)',
                border: '1px solid var(--color-carbon)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, analytics.percentSpent)}%`,
                  height: '100%',
                  background:
                    analytics.percentSpent > 100
                      ? 'var(--color-ember)'
                      : analytics.percentSpent > 90
                      ? 'var(--color-sunburst)'
                      : 'var(--color-mint-pop)',
                }}
              />
            </div>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--color-carbon)', fontWeight: 700 }}>
              {analytics.percentSpent}%
            </span>
          </div>
        </motion.div>

        {/* Metric 3: Solvency Remaining */}
        <motion.div
          className="glass-card glass-card-sm spotlight-card"
          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
        >
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
        </motion.div>

        {/* Metric 4: Contingency Shield */}
        <motion.div
          className="glass-card glass-card-sm spotlight-card"
          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
        >
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
        </motion.div>

        {/* Metric 5: Countdown & Milestone Horizon */}
        <motion.div
          className="glass-card glass-card-sm spotlight-card"
          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Countdown
            </span>
            <IconlyAnimation name="star-medal" size={20} />
          </div>
          <div style={{ fontSize: 'var(--type-metric-val)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {daysRemaining} Days
          </div>
          <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-secondary)' }}>
            {timelineAnalytics.completed} of {timelineAnalytics.total} milestones ({timelineAnalytics.percent}%)
          </span>
        </motion.div>
      </div>
    </header>
  );
};
