import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Heart, ShieldCheck, CheckCircle2, Key } from 'lucide-react';
import { IconlyAnimation, type IconlyAnimationName } from './IconlyAnimation';
import type { EventPlan, EventType } from '../types/event';

interface LandingHeroProps {
  onEnterApp: () => void;
  onSelectArchetype: (type: EventType) => void;
  allEvents: EventPlan[];
  onOpenApiKeyModal?: () => void;
  hasApiKey?: boolean;
  onToggleFx?: () => void;
  isFxEnabled?: boolean;
}

interface FloatingSticker {
  name: IconlyAnimationName;
  label: string;
  bg: string;
  rotation: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  delay: number;
}

const FLOATING_STICKERS: FloatingSticker[] = [
  { name: 'party', label: 'Celebration', bg: 'var(--color-sunburst)', rotation: -10, top: '10%', left: '3%', delay: 0 },
  { name: 'dollar-up', label: 'Budget Shield', bg: 'var(--color-sky-wash)', rotation: 12, top: '9%', right: '4%', delay: 0.1 },
  { name: 'users-ai', label: 'AI Director', bg: 'var(--color-lavender)', rotation: -8, bottom: '26%', left: '2%', delay: 0.2 },
  { name: 'heart', label: 'Vows & Love', bg: 'var(--color-lavender)', rotation: 14, bottom: '22%', right: '3%', delay: 0.3 },
  { name: 'star-medal', label: 'Milestones', bg: 'var(--color-mint-pop)', rotation: -12, top: '48%', right: '2%', delay: 0.15 },
  { name: 'clap', label: 'Success', bg: 'var(--color-sunburst)', rotation: 8, top: '50%', left: '2%', delay: 0.25 },
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onEnterApp,
  onSelectArchetype,
  allEvents,
  onOpenApiKeyModal,
  hasApiKey = false,
  onToggleFx,
  isFxEnabled = true,
}) => {
  const weddingEvent = allEvents.find((e) => e.type === 'wedding');
  const birthdayEvent = allEvents.find((e) => e.type === 'birthday');
  const communityEvent = allEvents.find((e) => e.type === 'community');

  return (
    <div className="landing-hero-container">
      {/* Landing Navigation Top Deck */}
      <header className="landing-top-deck">
        <div className="landing-deck-brand">
          <div className="landing-deck-logo">
            <IconlyAnimation name="party" size={26} alt="EventiQ" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="landing-deck-title">EventiQ</span>
              <span className="badge badge-gold">Haute Atelier</span>
            </div>
            <p className="landing-deck-subtitle">Intelligent Celebration Architecture</p>
          </div>
        </div>

        <div className="landing-deck-actions">
          {onToggleFx && (
            <button
              type="button"
              className="btn btn-secondary landing-deck-key-btn"
              onClick={onToggleFx}
              title={isFxEnabled ? 'Switch to Eco Mode (Disables background shader for maximum battery & speed)' : 'Enable Ambient Flux FX'}
            >
              <span>{isFxEnabled ? '⚡ FX: ON' : '🌱 ECO'}</span>
            </button>
          )}

          {onOpenApiKeyModal && (
            <button
              type="button"
              className="btn btn-secondary landing-deck-key-btn"
              onClick={onOpenApiKeyModal}
              title={hasApiKey ? 'Google Gemini API Active' : 'Configure Gemini API Key'}
            >
              <Key size={14} />
              <span>{hasApiKey ? 'Gemini AI Active' : 'API Key Vault'}</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary landing-deck-cta-btn"
            onClick={onEnterApp}
          >
            <span>Enter Studio</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Floating Interactive Animated Sticker Field (Draggable & Responsive) */}
      <div className="landing-sticker-field">
        {FLOATING_STICKERS.map((sticker, idx) => (
          <motion.div
            key={idx}
            className="landing-sticker-pill"
            style={{
              position: 'absolute',
              top: sticker.top,
              bottom: sticker.bottom,
              left: sticker.left,
              right: sticker.right,
              backgroundColor: sticker.bg,
              rotate: sticker.rotation,
              cursor: 'grab',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 260, delay: sticker.delay }}
            drag
            dragConstraints={{ left: -50, right: 50, top: -40, bottom: 40 }}
            dragElastic={0.25}
            whileHover={{
              scale: 1.25,
              rotate: 0,
              zIndex: 35,
              transition: { type: 'spring', stiffness: 400, damping: 15 },
            }}
            whileDrag={{ scale: 1.15, cursor: 'grabbing', zIndex: 40 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconlyAnimation name={sticker.name} size={28} />
            <span className="landing-sticker-text">{sticker.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Hero Badge Row */}
      <div className="landing-top-badge-row">
        <div className="badge badge-gold" style={{ gap: '6px', padding: '6px 14px' }}>
          <Sparkles size={14} color="var(--color-carbon)" />
          <span>MATHEMATICALLY LOCKED EVENT ARCHITECTURE</span>
        </div>
      </div>

      {/* Sculptural Giant Display Headlines */}
      <div className="landing-headline-wrap">
        <motion.div
          className="landing-sculptural-title"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          CELEBRATE
        </motion.div>

        <motion.div
          className="landing-sculptural-sub"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          WITHOUT BUDGET DRIFT
        </motion.div>
      </div>

      {/* Editorial Subtitle */}
      <motion.p
        className="landing-hero-description"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
      >
        The high-precision planning atelier for Weddings, Milestone Jubilees, and Community Galas. 
        Zero-leak budget solvency, dual-horizon run-of-show sequencing, and automated vendor vetting.
      </motion.p>

      {/* Primary Action Buttons */}
      <motion.div
        className="landing-cta-cluster"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.3 }}
      >
        <button
          type="button"
          className="btn btn-primary landing-main-cta"
          onClick={onEnterApp}
        >
          <span>Enter Atelier Studio</span>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          className="btn btn-secondary landing-secondary-cta"
          onClick={() => onSelectArchetype('wedding')}
        >
          <span>Explore Wedding Demo</span>
        </button>
      </motion.div>

      {/* Quick Launch Archetype Ribbon Cards */}
      <motion.div
        className="landing-archetypes-deck"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.35 }}
      >
        {/* Card 1: Weddings */}
        <motion.div
          className="landing-archetype-card"
          style={{ backgroundColor: 'var(--color-sky-wash)' }}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={() => onSelectArchetype('wedding')}
        >
          <div className="landing-card-header">
            <div className="landing-card-icon-pill" style={{ backgroundColor: 'var(--color-lavender)' }}>
              <IconlyAnimation name="heart" size={26} />
            </div>
            <span className="badge badge-gold">WEDDING</span>
          </div>
          <h3 className="landing-card-title">Weddings & Receptions</h3>
          <p className="landing-card-desc">
            Vow sequencing, champagne catering ratios, estate venue curfews, and golden hour portrait timelines.
          </p>
          <div className="landing-card-footer">
            <span className="landing-card-stat">
              Benchmark: ${(weddingEvent?.budget.totalBudget || 38000).toLocaleString()} · {weddingEvent?.guestCount || 125} Guests
            </span>
            <div className="landing-card-action">
              <span>Launch</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Birthdays */}
        <motion.div
          className="landing-archetype-card"
          style={{ backgroundColor: 'var(--color-sunburst)' }}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={() => onSelectArchetype('birthday')}
        >
          <div className="landing-card-header">
            <div className="landing-card-icon-pill" style={{ backgroundColor: 'var(--color-paper-white)' }}>
              <IconlyAnimation name="party" size={26} />
            </div>
            <span className="badge badge-info">MILESTONE</span>
          </div>
          <h3 className="landing-card-title">Golden Jubilees & Soirées</h3>
          <p className="landing-card-desc">
            Speakeasy jazz lounges, bespoke toast ghostwriting, surprise roast schedules, and craft cocktail menus.
          </p>
          <div className="landing-card-footer">
            <span className="landing-card-stat">
              Benchmark: ${(birthdayEvent?.budget.totalBudget || 12000).toLocaleString()} · {birthdayEvent?.guestCount || 60} Guests
            </span>
            <div className="landing-card-action">
              <span>Launch</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Galas */}
        <motion.div
          className="landing-archetype-card"
          style={{ backgroundColor: 'var(--color-mint-pop)' }}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={() => onSelectArchetype('community')}
        >
          <div className="landing-card-header">
            <div className="landing-card-icon-pill" style={{ backgroundColor: 'var(--color-lavender)' }}>
              <IconlyAnimation name="star-medal" size={26} />
            </div>
            <span className="badge badge-gold">CHARITY</span>
          </div>
          <h3 className="landing-card-title">Community & Cultural Galas</h3>
          <p className="landing-card-desc">
            Silent auction run-of-show, black-tie banquet allocations, keynote awards, and corporate sponsorship tiers.
          </p>
          <div className="landing-card-footer">
            <span className="landing-card-stat">
              Benchmark: ${(communityEvent?.budget.totalBudget || 65000).toLocaleString()} · {communityEvent?.guestCount || 280} Guests
            </span>
            <div className="landing-card-action">
              <span>Launch</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Feature Highlights Ticker */}
      <div className="landing-feature-strip">
        <div className="landing-feature-item">
          <ShieldCheck size={18} color="var(--color-carbon)" />
          <span>Contingency Buffer Math Locked</span>
        </div>
        <div className="landing-feature-divider">★</div>
        <div className="landing-feature-item">
          <CheckCircle2 size={18} color="var(--color-carbon)" />
          <span>Zero Schedule Collisions</span>
        </div>
        <div className="landing-feature-divider">★</div>
        <div className="landing-feature-item">
          <Sparkles size={18} color="var(--color-carbon)" />
          <span>Gemini 1.5 Flash Director</span>
        </div>
        <div className="landing-feature-divider">★</div>
        <div className="landing-feature-item">
          <Heart size={18} color="var(--color-carbon)" />
          <span>100% Client-Side Privacy</span>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
