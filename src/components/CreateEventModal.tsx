import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Users, DollarSign, X, Check, Heart, Cake, Trophy, ArrowRight } from 'lucide-react';
import type { EventType, EventPlan } from '../types/event';
import { createCustomEventPlan } from '../data/presets';
import { IconlyAnimation, type IconlyAnimationName } from './IconlyAnimation';
import confetti from 'canvas-confetti';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: EventPlan) => void;
}

const ARCHETYPES: Array<{
  type: EventType;
  title: string;
  tagline: string;
  icon: typeof Heart;
  animation: IconlyAnimationName;
  color: string;
  accent: string;
}> = [
  {
    type: 'wedding',
    title: 'Wedding & Reception',
    tagline: 'Ceremonies, vows, dinner & grand party',
    icon: Heart,
    animation: 'heart',
    color: '#F59E0B',
    accent: 'rgba(245, 158, 11, 0.15)',
  },
  {
    type: 'birthday',
    title: 'Milestone Birthday',
    tagline: 'Anniversaries, jubilations & soirées',
    icon: Cake,
    animation: 'party',
    color: '#38BDF8',
    accent: 'rgba(56, 189, 248, 0.15)',
  },
  {
    type: 'community',
    title: 'Community Gala',
    tagline: 'Charity galas, awards & cultural festivals',
    icon: Trophy,
    animation: 'star-medal',
    color: '#34D399',
    accent: 'rgba(52, 211, 153, 0.15)',
  },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [selectedType, setSelectedType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [totalBudget, setTotalBudget] = useState<number>(30000);
  const [currency, setCurrency] = useState('$');
  const [contingencyPercent, setContingencyPercent] = useState<number>(12);
  const [vibe, setVibe] = useState('Rustic Elegance & Ambient Candlelight');

  const handleArchetypeSelect = (type: EventType) => {
    setSelectedType(type);
    if (!title || title.includes('Celebration') || title.includes('Wedding') || title.includes('Gala') || title.includes('Birthday')) {
      if (type === 'wedding') {
        setTitle("Maya & Ethan's Coastal Wedding");
        setVibe('Oceanfront romance, acoustic strings, fine estate dining');
        setTotalBudget(38000);
        setGuestCount(120);
      } else if (type === 'birthday') {
        setTitle("David's 50th Golden Jubilee");
        setVibe('Velvet jazz lounge, craft speakeasy cocktails, surprise roasts');
        setTotalBudget(12000);
        setGuestCount(60);
      } else {
        setTitle('Aurora Cultural & Arts Gala');
        setVibe('Black-tie opulence, live symphony, silent auction & keynote awards');
        setTotalBudget(65000);
        setGuestCount(280);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    const newEvent = createCustomEventPlan({
      title: title.trim().slice(0, 100),
      type: selectedType,
      date,
      location: location.trim().slice(0, 100),
      guestCount: Math.max(1, guestCount),
      totalBudget: Math.max(500, totalBudget),
      currency,
      contingencyPercent,
      vibe: vibe.trim().slice(0, 200),
    });

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FCD34D', '#10B981', '#38BDF8', '#FFFFFF'],
      });
    } catch {
      // Confetti fallback
    }

    onEventCreated(newEvent);
    onClose();
  };

  // Preview benchmarks
  const previewBenchmarks = {
    venue: Math.round(totalBudget * (selectedType === 'wedding' ? 0.35 : selectedType === 'birthday' ? 0.28 : 0.32)),
    catering: Math.round(totalBudget * (selectedType === 'wedding' ? 0.28 : selectedType === 'birthday' ? 0.30 : 0.25)),
    photo: Math.round(totalBudget * (selectedType === 'wedding' ? 0.11 : selectedType === 'birthday' ? 0.10 : 0.08)),
    music: Math.round(totalBudget * (selectedType === 'wedding' ? 0.08 : selectedType === 'birthday' ? 0.14 : 0.15)),
    contingency: Math.round((totalBudget * contingencyPercent) / 100),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="modal-content"
            style={{ maxWidth: '680px', maxHeight: '92vh' }}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-sunburst)',
                    border: '1px solid var(--color-carbon)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <IconlyAnimation name="party" size={24} alt="Create Atelier" />
                </div>
                <div>
                  <h2 className="modal-title">Create Celebration Atelier</h2>
                  <p style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
                    Auto-seeds benchmark budgets, run-of-show cues, and curated creative assets
                  </p>
                </div>
              </div>
              <motion.button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Archetype Selector Cards */}
              <div>
                <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>
                  Celebration Archetype
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-2)' }}>
                  {ARCHETYPES.map((arch) => {
                    const isSelected = selectedType === arch.type;
                    return (
                      <motion.div
                        key={arch.type}
                        onClick={() => handleArchetypeSelect(arch.type)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-lg)',
                          background: isSelected ? arch.accent : 'var(--color-paper-white)',
                          border: isSelected ? '2px solid var(--color-carbon)' : '1px solid var(--color-carbon)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <IconlyAnimation name={arch.animation} size={22} alt={arch.title} />
                          {isSelected && <Check size={14} color={arch.color} />}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)' }}>
                          {arch.title}
                        </div>
                        <div style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
                          {arch.tagline}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Title & Vibe */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-event-title">Event Title</label>
                  <input
                    id="new-event-title"
                    type="text"
                    required
                    maxLength={100}
                    className="form-input"
                    placeholder="e.g. Maya & Ethan's Coastal Wedding"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-event-vibe">Atmosphere & Vibe</label>
                  <input
                    id="new-event-vibe"
                    type="text"
                    maxLength={200}
                    className="form-input"
                    placeholder="e.g. Velvet Noir, Sunset Strings"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                  />
                </div>
              </div>

              {/* Date & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 'var(--space-3)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-event-date">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="var(--color-carbon)" /> Event Date
                    </span>
                  </label>
                  <input
                    id="new-event-date"
                    type="date"
                    required
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-event-location">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--color-carbon)" /> Venue / City
                    </span>
                  </label>
                  <input
                    id="new-event-location"
                    type="text"
                    required
                    maxLength={100}
                    className="form-input"
                    placeholder="e.g. Carmel Valley Estate, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Budget, Currency, Guests & Contingency */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1.2fr 1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-event-currency">Cur</label>
                  <select
                    id="new-event-currency"
                    className="form-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="₹">₹ (INR)</option>
                    <option value="¥">¥ (JPY)</option>
                    <option value="C$">C$ (CAD)</option>
                    <option value="A$">A$ (AUD)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-event-budget">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={13} color="var(--color-carbon)" /> Total Budget
                    </span>
                  </label>
                  <input
                    id="new-event-budget"
                    type="number"
                    min="500"
                    step="500"
                    className="form-input"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Math.max(500, parseInt(e.target.value, 10) || 500))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-event-guests">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={13} color="var(--color-carbon)" /> Guests
                    </span>
                  </label>
                  <input
                    id="new-event-guests"
                    type="number"
                    min="1"
                    className="form-input"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-event-contingency">Shield (%)</label>
                  <select
                    id="new-event-contingency"
                    className="form-select"
                    value={contingencyPercent}
                    onChange={(e) => setContingencyPercent(parseInt(e.target.value, 10))}
                  >
                    <option value={8}>8% Buffer</option>
                    <option value={10}>10% Standard</option>
                    <option value={12}>12% Recommended</option>
                    <option value={15}>15% Resilient</option>
                  </select>
                </div>
              </div>

              {/* Real-time Benchmark Breakdown HUD Preview */}
              <div
                style={{
                  background: 'var(--color-sky-wash)',
                  border: '1px solid var(--color-carbon)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3)',
                  marginTop: 'var(--space-2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--color-carbon)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Auto-Calculated Allocation Plan
                  </span>
                  <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--color-carbon)', fontWeight: 700 }}>
                    ~{currency}{Math.round(totalBudget / Math.max(1, guestCount))} per guest
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--space-2)', fontSize: 'var(--type-caption-xs)' }}>
                  <div>
                    <span style={{ color: '#333333', fontWeight: 600 }}>Venue:</span>{' '}
                    <strong style={{ color: 'var(--color-carbon)' }}>{currency}{previewBenchmarks.venue.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#333333', fontWeight: 600 }}>Catering:</span>{' '}
                    <strong style={{ color: 'var(--color-carbon)' }}>{currency}{previewBenchmarks.catering.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#333333', fontWeight: 600 }}>Photo/AV:</span>{' '}
                    <strong style={{ color: 'var(--color-carbon)' }}>{currency}{(previewBenchmarks.photo + previewBenchmarks.music).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#057a44', fontWeight: 700 }}>Shield:</span>{' '}
                    <strong style={{ color: '#057a44', fontWeight: 800 }}>{currency}{previewBenchmarks.contingency.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>Build Atelier Workspace</span>
                  <ArrowRight size={15} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

