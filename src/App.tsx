import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Clock, Users, Sparkles } from 'lucide-react';
import type { EventPlan, EventType } from './types/event';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { BudgetModule } from './components/BudgetModule';
import { TimelineModule } from './components/TimelineModule';
import { VendorModule } from './components/VendorModule';
import { CreativeStudio } from './components/CreativeStudio';
import { AiCopilot } from './components/AiCopilot';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CreateEventModal } from './components/CreateEventModal';
import { IconlyAnimation } from './components/IconlyAnimation';
import { LandingHero } from './components/LandingHero';
import { Footer } from './components/Footer';
import FluxLines from './components/FluxLines';
import './App.css';

type ActiveTab = 'budget' | 'timeline' | 'vendors' | 'creative';

const NAV_TABS = [
  { key: 'budget' as ActiveTab, label: 'Budget & Contingency', icon: DollarSign, animation: 'dollar-up' as const },
  { key: 'timeline' as ActiveTab, label: 'Timeline & Run-of-Show', icon: Clock, animation: 'repeat' as const },
  { key: 'vendors' as ActiveTab, label: 'Vendor Pipeline CRM', icon: Users, animation: 'users-ai' as const },
  { key: 'creative' as ActiveTab, label: 'Creative Atelier', icon: Sparkles, animation: 'party' as const },
];

export function App() {
  const [events, setEvents] = useState<EventPlan[]>(() => StorageService.getEvents());
  const [activeEventId, setActiveEventId] = useState<string>(() => StorageService.getActiveEventId());
  const [activeTab, setActiveTab] = useState<ActiveTab>('budget');
  const [viewMode, setViewMode] = useState<'landing' | 'studio'>('landing');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => Boolean(StorageService.getApiKey()));

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  useEffect(() => {
    StorageService.setActiveEventId(activeEventId);
  }, [activeEventId]);

  const handleSelectEvent = (id: string) => {
    setActiveEventId(id);
  };

  const handleSelectArchetype = (type: EventType) => {
    const match = events.find((e) => e.type === type);
    if (match) {
      setActiveEventId(match.id);
    }
    setViewMode('studio');
  };

  const handleUpdateEvent = (updated: EventPlan) => {
    const updatedEvents = StorageService.updateEvent(updated);
    setEvents([...updatedEvents]);
  };

  const handleEventCreated = (newEvent: EventPlan) => {
    const updatedEvents = StorageService.updateEvent(newEvent);
    setEvents([...updatedEvents]);
    setActiveEventId(newEvent.id);
  };

  const handleDeleteEvent = (id: string) => {
    const remainingEvents = StorageService.deleteEvent(id);
    setEvents([...remainingEvents]);
    setActiveEventId(StorageService.getActiveEventId());
  };

  const handleResetPresets = () => {
    const resetEvents = StorageService.resetToPresets();
    setEvents([...resetEvents]);
    setActiveEventId(resetEvents[0].id);
  };

  const handleImportEvent = (imported: EventPlan) => {
    const updatedEvents = StorageService.updateEvent(imported);
    setEvents([...updatedEvents]);
    setActiveEventId(imported.id);
  };

  const checkApiKey = () => {
    setHasApiKey(Boolean(StorageService.getApiKey()));
  };

  return (
    <>
      {/* React Bits: Animated Magnetic FluxLines Background */}
      <div
        className="flux-lines-background no-print"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <FluxLines
          colors={['#4da2ff', '#55db9c', '#ffd731', '#e9ccff', '#fb4903']}
          lightMode={true}
          transparent={true}
          opacity={0.45}
          speed={0.35}
          scale={1.3}
          lineWidth={1.2}
          mouseInteraction={true}
          mouseStrength={1.2}
          mouseRadius={0.35}
          clickSwirl={true}
        />
      </div>

      {/* Slush Marquee Scrolling Announcement Strip */}
      <div className="slush-marquee no-print" aria-hidden="true" style={{ position: 'relative', zIndex: 10 }}>
        <div className="slush-marquee-track">
          <span>EVENTIQ CELEBRATION ATELIER ★ WEDDINGS ★ MILESTONE BIRTHDAYS ★ COMMUNITY GALAS ★ MATHEMATICAL PRECISION ★ REAL-TIME SOLVENCY ★ ZERO BUDGET DRIFT ★</span>
          <span>EVENTIQ CELEBRATION ATELIER ★ WEDDINGS ★ MILESTONE BIRTHDAYS ★ COMMUNITY GALAS ★ MATHEMATICAL PRECISION ★ REAL-TIME SOLVENCY ★ ZERO BUDGET DRIFT ★</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'landing' ? (
          <motion.div
            key="landing-page-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <LandingHero
              onEnterApp={() => setViewMode('studio')}
              onSelectArchetype={handleSelectArchetype}
              allEvents={events}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              hasApiKey={hasApiKey}
            />
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
              <Footer
                onSelectArchetype={handleSelectArchetype}
                onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="studio-workspace-view"
            className="app-container"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {/* Executive Header & HUD Deck */}
            <Header
              activeEvent={activeEvent}
              allEvents={events}
              onSelectEvent={handleSelectEvent}
              onResetPresets={handleResetPresets}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              hasApiKey={hasApiKey}
              onImportEvent={handleImportEvent}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onDeleteEvent={handleDeleteEvent}
              onGoToLanding={() => setViewMode('landing')}
            />

            {/* Module Navigation Tabs with Slush Pill Design */}
            <nav className="nav-tabs-wrapper no-print" aria-label="Main Navigation">
              <div className="nav-tabs">
                {NAV_TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="nav-tab-active-pill"
                          transition={{ type: 'spring', damping: 26, stiffness: 380 }}
                        />
                      )}
                      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {isActive ? (
                          <IconlyAnimation name={tab.animation} size={18} />
                        ) : (
                          <Icon size={16} color="var(--color-carbon)" />
                        )}
                        <span>{tab.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Active Module View with Framer Motion Page Transition */}
            <main style={{ minHeight: '520px', position: 'relative' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeEvent.id}-${activeTab}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {activeTab === 'budget' && (
                    <BudgetModule event={activeEvent} onUpdateEvent={handleUpdateEvent} />
                  )}
                  {activeTab === 'timeline' && (
                    <TimelineModule event={activeEvent} onUpdateEvent={handleUpdateEvent} />
                  )}
                  {activeTab === 'vendors' && (
                    <VendorModule event={activeEvent} onUpdateEvent={handleUpdateEvent} />
                  )}
                  {activeTab === 'creative' && (
                    <CreativeStudio event={activeEvent} onUpdateEvent={handleUpdateEvent} />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Persistent AI Event Director Drawer & Copilot */}
            <AiCopilot
              event={activeEvent}
              activeTab={activeTab}
              isOpen={isCopilotOpen}
              onToggle={() => setIsCopilotOpen(!isCopilotOpen)}
              onOpenKeyVault={() => setIsApiKeyModalOpen(true)}
              hasApiKey={hasApiKey}
            />

            {/* Neo-Brutalist Statement Footer */}
            <Footer
              onSelectArchetype={handleSelectArchetype}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Event Atelier Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Google Gemini Key Vault Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={checkApiKey}
      />
    </>
  );
}

export default App;
