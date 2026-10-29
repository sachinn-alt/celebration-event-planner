import React from 'react';
import confetti from 'canvas-confetti';
import type { EventType } from '../types/event';

interface FooterProps {
  onSelectArchetype?: (type: EventType) => void;
  onOpenApiKeyModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectArchetype,
  onOpenApiKeyModal: _onOpenApiKeyModal,
}) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.85 },
        colors: ['#ffd731', '#55db9c', '#e9ccff', '#4da2ff', '#fb4903'],
      });
    } catch {
      // Fallback if canvas-confetti is not supported
    }
  };

  return (
    <footer className="brutalist-footer-wrapper" aria-label="EventiQ Atelier Footer">
      <div className="brutalist-footer-card">
        {/* Giant Monolithic Display Headline */}
        <div
          className="brutalist-footer-title"
          onClick={triggerCelebration}
          title="Click for celebration confetti!"
        >
          EVENTIQ.EXE
        </div>

        {/* Lower Row: Navigation Links & Action Deck */}
        <div className="brutalist-footer-content">
          {/* Left Column: Uppercase Atelier & Community Links */}
          <nav className="brutalist-footer-nav" aria-label="Footer Quick Navigation">
            {onSelectArchetype ? (
              <>
                <button
                  type="button"
                  className="brutalist-footer-link"
                  onClick={() => onSelectArchetype('wedding')}
                >
                  WEDDINGS & RECEPTIONS
                </button>
                <button
                  type="button"
                  className="brutalist-footer-link"
                  onClick={() => onSelectArchetype('birthday')}
                >
                  MILESTONE BIRTHDAYS
                </button>
                <button
                  type="button"
                  className="brutalist-footer-link"
                  onClick={() => onSelectArchetype('community')}
                >
                  COMMUNITY GALAS
                </button>
              </>
            ) : (
              <>
                <span className="brutalist-footer-link static">WEDDINGS & RECEPTIONS</span>
                <span className="brutalist-footer-link static">MILESTONE BIRTHDAYS</span>
                <span className="brutalist-footer-link static">COMMUNITY GALAS</span>
              </>
            )}

            <a
              href="https://github.com/sachinn-alt/celebration-event-planner"
              target="_blank"
              rel="noopener noreferrer"
              className="brutalist-footer-link"
            >
              GITHUB REPOSITORY
            </a>
          </nav>

          {/* Right Column: Scroll to Top Button & Neo-Brutalist Colophon */}
          <div className="brutalist-footer-meta">
            <button
              type="button"
              className="brutalist-scroll-top-btn"
              onClick={handleScrollToTop}
              title="Scroll back to top of the page"
            >
              SCROLL TO TOP
            </button>

            <div className="brutalist-colophon">
              <div className="brutalist-colophon-line">
                ©2026 EVENTIQ HAUTE ATELIER /
              </div>
              <div className="brutalist-colophon-line">
                ZERO BUDGET DRIFT GUARANTEED
              </div>
              <div
                className="brutalist-colophon-signature"
                onClick={triggerCelebration}
                style={{ cursor: 'pointer' }}
                title="Celebration Atelier"
              >
                BUILT WITH LOVE &amp; PRECISION FOR MEMORABLE MOMENTS 💖
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

