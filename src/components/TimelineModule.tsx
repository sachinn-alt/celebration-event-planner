import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Search,
  UserCheck,
  Sparkles,
  X,
} from 'lucide-react';
import type { EventPlan, TimelineMilestone, TimelinePhase } from '../types/event';
import { AiService } from '../services/aiService';

interface TimelineModuleProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const TimelineModule: React.FC<TimelineModuleProps> = ({ event, onUpdateEvent }) => {
  const [activeHorizon, setActiveHorizon] = useState<'macro' | 'day_of'>('macro');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<TimelineMilestone | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestonePhase, setMilestonePhase] = useState<TimelinePhase>('macro_months');
  const [milestoneTimeframe, setMilestoneTimeframe] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestonePriority, setMilestonePriority] = useState<'critical' | 'normal' | 'optional'>('normal');
  const [milestoneAssignedTo, setMilestoneAssignedTo] = useState('');

  // Conflict Detection for Day-of Run-of-Show
  const conflicts = AiService.detectTimelineConflicts(event.timeline);

  const triggerConfettiReward = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#F59E0B', '#FDE68A', '#10B981', '#FFFFFF'],
      });
    } catch {
      // Ignore if canvas-confetti fails or is disabled
    }
  };

  const toggleMilestoneComplete = (milestoneId: string) => {
    let wasCompleted = false;
    const updatedTimeline = event.timeline.map((m) => {
      if (m.id === milestoneId) {
        wasCompleted = !m.completed;
        return {
          ...m,
          completed: !m.completed,
          completedAt: !m.completed ? new Date().toISOString() : undefined,
        };
      }
      return m;
    });

    if (wasCompleted) {
      triggerConfettiReward();
    }

    onUpdateEvent({
      ...event,
      timeline: updatedTimeline,
    });
  };

  const openAddModal = (defaultPhase: TimelinePhase) => {
    setEditingMilestone(null);
    setMilestoneTitle('');
    setMilestonePhase(defaultPhase);
    setMilestoneTimeframe(defaultPhase === 'day_of' ? '14:00 - 15:00' : '3 Months Out');
    setMilestoneDescription('');
    setMilestonePriority('normal');
    setMilestoneAssignedTo('');
    setIsModalOpen(true);
  };

  const openEditModal = (milestone: TimelineMilestone) => {
    setEditingMilestone(milestone);
    setMilestoneTitle(milestone.title);
    setMilestonePhase(milestone.phase);
    setMilestoneTimeframe(milestone.timeframe);
    setMilestoneDescription(milestone.description);
    setMilestonePriority(milestone.priority);
    setMilestoneAssignedTo(milestone.assignedTo || '');
    setIsModalOpen(true);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    let updatedTimeline: TimelineMilestone[];

    if (editingMilestone) {
      updatedTimeline = event.timeline.map((m) =>
        m.id === editingMilestone.id
          ? {
              ...m,
              title: milestoneTitle.trim(),
              phase: milestonePhase,
              timeframe: milestoneTimeframe.trim(),
              description: milestoneDescription.trim(),
              priority: milestonePriority,
              assignedTo: milestoneAssignedTo.trim() || undefined,
            }
          : m
      );
    } else {
      const newMilestone: TimelineMilestone = {
        id: `milestone-${Date.now()}`,
        title: milestoneTitle.trim(),
        phase: milestonePhase,
        timeframe: milestoneTimeframe.trim() || 'Flexible',
        description: milestoneDescription.trim(),
        category: 'general',
        completed: false,
        priority: milestonePriority,
        assignedTo: milestoneAssignedTo.trim() || undefined,
      };
      updatedTimeline = [...event.timeline, newMilestone];
    }

    onUpdateEvent({
      ...event,
      timeline: updatedTimeline,
    });
    setIsModalOpen(false);
  };

  const handleDeleteMilestone = (id: string) => {
    if (window.confirm('Delete this milestone from timeline?')) {
      onUpdateEvent({
        ...event,
        timeline: event.timeline.filter((m) => m.id !== id),
      });
    }
  };

  // Filter items based on active horizon & filters
  const visibleItems = event.timeline.filter((m) => {
    if (activeHorizon === 'day_of') {
      if (m.phase !== 'day_of') return false;
    } else {
      if (m.phase === 'day_of') return false;
      if (selectedPhaseFilter !== 'all' && m.phase !== selectedPhaseFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.assignedTo && m.assignedTo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const completedCount = visibleItems.filter((m) => m.completed).length;
  const totalCount = visibleItems.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Module Header & Horizon Switcher */}
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
            Dual-Horizon Timeline & Day-Of Run-of-Show
          </h2>
          <p style={{ fontSize: 'var(--type-body-sm)' }}>
            Seamlessly switch between Macro Countdown Preparation and Micro Day-of Minute-by-Minute Sequencing.
          </p>
        </div>

        {/* Horizon Toggle */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(14, 19, 31, 0.8)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-full)',
              padding: '3px',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${activeHorizon === 'macro' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
              onClick={() => setActiveHorizon('macro')}
            >
              <Calendar size={14} />
              <span>Macro Countdown</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeHorizon === 'day_of' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
              onClick={() => setActiveHorizon('day_of')}
            >
              <Clock size={14} />
              <span>Day-Of Run-of-Show</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => openAddModal(activeHorizon === 'day_of' ? 'day_of' : 'macro_months')}
          >
            <Plus size={16} />
            <span>Add {activeHorizon === 'day_of' ? 'Cue' : 'Milestone'}</span>
          </button>
        </div>
      </div>

      {/* Collision Alert Banner (If in Day-of mode and conflicts exist) */}
      {activeHorizon === 'day_of' && conflicts.length > 0 && (
        <div
          className="glass-card"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.4)',
            background: 'rgba(220, 38, 38, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <AlertTriangle size={22} color="var(--status-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: 'var(--type-heading-md)', color: '#fca5a5', marginBottom: '4px' }}>
                {conflicts.length} Schedule Friction Points Detected
              </h3>
              {conflicts.map((c, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)' }}>
                    • {c.message}
                  </p>
                  <p style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--gold-400)', marginLeft: '12px' }}>
                    💡 Suggested Fix: {c.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress & Quick Filters Bar */}
      <div
        className="glass-card"
        style={{
          padding: 'var(--space-3) var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Sparkles size={16} color="var(--gold-400)" />
            <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600 }}>
              {completedCount} of {totalCount} completed ({totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%)
            </span>
          </div>

          <div style={{ position: 'relative', width: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '30px', paddingBlock: '4px', fontSize: 'var(--type-caption-xs)' }}
              placeholder="Search timeline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {activeHorizon === 'macro' && (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['all', 'macro_months', 'macro_weeks', 'countdown_days'].map((p) => {
              const label =
                p === 'all'
                  ? 'All Phases'
                  : p === 'macro_months'
                  ? '6–12 Months'
                  : p === 'macro_weeks'
                  ? '2–8 Weeks'
                  : '1–7 Days';
              return (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm ${selectedPhaseFilter === p ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 'var(--type-caption-xs)' }}
                  onClick={() => setSelectedPhaseFilter(p)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Milestone / Cue Items Timeline Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {visibleItems.length === 0 ? (
          <div className="glass-card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            No milestones found for this selection.
          </div>
        ) : (
          visibleItems.map((milestone) => (
            <div
              key={milestone.id}
              className="glass-card glass-card-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                gap: 'var(--space-3)',
                opacity: milestone.completed ? 0.65 : 1,
                borderColor: milestone.priority === 'critical' ? 'rgba(239, 68, 68, 0.4)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', flex: 1 }}>
                {/* Completion Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleMilestoneComplete(milestone.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  aria-label={milestone.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {milestone.completed ? (
                    <CheckCircle2 size={22} color="var(--status-success)" />
                  ) : (
                    <Circle size={22} color="var(--text-muted)" />
                  )}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontSize: 'var(--type-body-base)',
                        textDecoration: milestone.completed ? 'line-through' : 'none',
                      }}
                    >
                      {milestone.title}
                    </span>
                    <span className="badge badge-gold">
                      {milestone.timeframe}
                    </span>
                    {milestone.priority === 'critical' && (
                      <span className="badge badge-danger">
                        Critical
                      </span>
                    )}
                    {milestone.assignedTo && (
                      <span className="badge badge-muted">
                        <UserCheck size={12} /> {milestone.assignedTo}
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: 'var(--type-body-sm)',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                    }}
                  >
                    {milestone.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '6px' }}
                  onClick={() => openEditModal(milestone)}
                  aria-label="Edit milestone"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '6px', color: '#f87171' }}
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  aria-label="Delete milestone"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Milestone Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingMilestone ? 'Edit Timeline Item' : 'Add New Timeline Item'}
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone}>
              <div className="form-group">
                <label className="form-label" htmlFor="milestone-title-input">Milestone Title</label>
                <input
                  id="milestone-title-input"
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Sommelier Wine Tasting or Ceremony Processional"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="milestone-phase-select">Horizon Phase</label>
                  <select
                    id="milestone-phase-select"
                    className="form-select"
                    value={milestonePhase}
                    onChange={(e) => setMilestonePhase(e.target.value as TimelinePhase)}
                  >
                    <option value="macro_months">Macro: 6–12 Months Out</option>
                    <option value="macro_weeks">Intermediate: 2–8 Weeks Out</option>
                    <option value="countdown_days">Micro: 1–7 Days Out</option>
                    <option value="day_of">Day-Of: Minute-by-Minute Run of Show</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="milestone-timeframe-input">Timeframe / Window</label>
                  <input
                    id="milestone-timeframe-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 14:00 - 15:00 or 4 Months Out"
                    value={milestoneTimeframe}
                    onChange={(e) => setMilestoneTimeframe(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="milestone-priority-select">Priority Level</label>
                  <select
                    id="milestone-priority-select"
                    className="form-select"
                    value={milestonePriority}
                    onChange={(e) => setMilestonePriority(e.target.value as 'critical' | 'normal' | 'optional')}
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="critical">Critical Path (P0)</option>
                    <option value="optional">Optional / Nice to Have</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="milestone-assigned-input">Assigned Lead / Role</label>
                  <input
                    id="milestone-assigned-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maid of Honor, Stage Manager"
                    value={milestoneAssignedTo}
                    onChange={(e) => setMilestoneAssignedTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="milestone-description-input">Instructions & Context</label>
                <textarea
                  id="milestone-description-input"
                  className="form-textarea"
                  placeholder="Key steps, deliverables, location specifics..."
                  value={milestoneDescription}
                  onChange={(e) => setMilestoneDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingMilestone ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
