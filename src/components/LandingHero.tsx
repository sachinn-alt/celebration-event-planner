import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { IconlyAnimation, type IconlyAnimationName } from './IconlyAnimation';
import type { EventPlan, EventType } from '../types/event';

interface LandingHeroProps {
  onEnterApp: () => void;
  onSelectArchetype: (type: EventType) => void;
  allEvents: EventPlan[];
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

interface CelebrationQuote {
  quote: string;
  author: string;
}

const CELEBRATION_QUOTES: CelebrationQuote[] = [
  { quote: 'The best thing to hold onto in life is each other.', author: 'Audrey Hepburn' },
  { quote: 'We do not remember days, we remember moments.', author: 'Cesare Pavese' },
  { quote: 'The more you praise and celebrate your life, the more there is in life to celebrate.', author: 'Oprah Winfrey' },
  { quote: 'To love and be loved is to feel the sun from both sides.', author: 'David Viscott' },
  { quote: 'Celebrate what you want to see more of.', author: 'Tom Peters' },
  { quote: 'When you celebrate with a pure heart, the whole universe dances with you.', author: 'Rumi' },
  { quote: 'Sometimes you will never know the value of a moment until it becomes a memory.', author: 'Dr. Seuss' },
  { quote: 'Count your age by friends, not years. Count your life by smiles, not tears.', author: 'John Lennon' },
  { quote: 'Joy is the simplest form of gratitude.', author: 'Karl Barth' },
  { quote: 'Let us celebrate the occasion with wine and sweet words.', author: 'Plautus' },
  { quote: 'May your days be filled with magic, dreams, and joyful memories.', author: 'Neil Gaiman' },
  { quote: 'Gatherings are the thread that stitches communities into a living tapestry.', author: 'Maya Angelou' },
  { quote: 'Life is what we make it — celebrate every chapter.', author: 'Grandma Moses' },
  { quote: 'Every celebration is a renewed promise that love and fellowship endure.', author: 'Ralph Waldo Emerson' },
  { quote: 'Where there is love, there is life and endless cause to celebrate.', author: 'Mahatma Gandhi' },
  { quote: 'There are shortcuts to happiness, and celebration is one of the sweetest.', author: 'Vicki Baum' },
];

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const FLOATING_STICKERS: FloatingSticker[] = [
  { name: 'party', label: 'Celebration', bg: 'var(--color-sunburst)', rotation: -10, top: '12%', left: '3%', delay: 0 },
  { name: 'dollar-up', label: 'Budget Shield', bg: 'var(--color-sky-wash)', rotation: 12, top: '11%', right: '4%', delay: 0.1 },
  { name: 'users-ai', label: 'AI Director', bg: 'var(--color-lavender)', rotation: -8, bottom: '26%', left: '2%', delay: 0.2 },
  { name: 'heart', label: 'Vows & Love', bg: 'var(--color-lavender)', rotation: 14, bottom: '22%', right: '3%', delay: 0.3 },
  { name: 'star-medal', label: 'Milestones', bg: 'var(--color-mint-pop)', rotation: -12, top: '48%', right: '2%', delay: 0.15 },
  { name: 'clap', label: 'Success', bg: 'var(--color-sunburst)', rotation: 8, top: '50%', left: '2%', delay: 0.25 },
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onEnterApp,
  onSelectArchetype,
  allEvents,
}) => {
  const weddingEvent = allEvents.find((e) => e.type === 'wedding');
  const birthdayEvent = allEvents.find((e) => e.type === 'birthday');
  const communityEvent = allEvents.find((e) => e.type === 'community');

  // Random quote chosen on every initial page open / reload
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * CELEBRATION_QUOTES.length)
  );

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % CELEBRATION_QUOTES.length);
  };

  const currentQuote = CELEBRATION_QUOTES[quoteIndex];

  return (
    <div className="landing-hero-container">
      {/* Dynamic Island Floating Pill Navbar (Supaste Reference) */}
      <nav className="supaste-island-navbar" aria-label="Landing Navigation">
        {/* Brand Identity */}
        <div
          className="island-brand"
          onClick={onEnterApp}
          title="Enter EventiQ Studio Atelier"
          style={{ cursor: 'pointer' }}
        >
          <div className="island-logo-box">
            <IconlyAnimation name="party" size={18} alt="EventiQ" />
          </div>
          <span className="island-brand-name">EventiQ</span>
        </div>

        {/* Center Navigation Links */}
        <div className="island-nav-links">
          <button
            type="button"
            className="island-nav-link"
            onClick={() => onSelectArchetype('wedding')}
          >
            Weddings
          </button>
          <button
            type="button"
            className="island-nav-link"
            onClick={() => onSelectArchetype('birthday')}
          >
            Milestones
          </button>
          <button
            type="button"
            className="island-nav-link"
            onClick={() => onSelectArchetype('community')}
          >
            Galas
          </button>
          <button
            type="button"
            className="island-nav-link"
            onClick={onEnterApp}
          >
            Studio
          </button>
        </div>

        {/* Right Action Cluster: GitHub & Star Repo Button */}
        <div className="island-actions">
          <a
            href="https://github.com/sachinn-alt/celebration-event-planner"
            target="_blank"
            rel="noopener noreferrer"
            className="island-github-link"
            title="View sachinn-alt on GitHub"
          >
            <GithubIcon size={16} />
            <span className="hide-on-mobile">GitHub</span>
          </a>

          <a
            href="https://github.com/sachinn-alt/celebration-event-planner"
            target="_blank"
            rel="noopener noreferrer"
            className="island-star-btn"
            title="Star celebration-event-planner on GitHub"
          >
            <Star size={13} fill="#ffd731" color="#000000" />
            <span>Star Repo</span>
          </a>
        </div>
      </nav>

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

      {/* Inspiring Dynamic Celebration Quote Strip in Cursive Typography */}
      <motion.div
        className="landing-quote-strip"
        onClick={handleNextQuote}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        title="Click to discover another celebration quote ✨"
        aria-label="Inspiring Celebration Quote"
      >
        <Sparkles size={16} color="var(--color-sunburst)" style={{ flexShrink: 0 }} />
        <span className="landing-quote-text">
          “{currentQuote.quote}”
        </span>
        <span className="landing-quote-divider">★</span>
        <span className="landing-quote-author">
          {currentQuote.author}
        </span>
      </motion.div>
    </div>
  );
};

export default LandingHero;
