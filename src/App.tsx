import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Clock, Users, Sparkles, Heart } from 'lucide-react';
import type { EventPlan } from './types/event';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { BudgetModule } from './components/BudgetModule';
import { TimelineModule } from './components/TimelineModule';
import { VendorModule } from './components/VendorModule';
import { CreativeStudio } from './components/CreativeStudio';
import { AiCopilot } from './components/AiCopilot';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CreateEventModal } from './components/CreateEventModal';
import './App.css';

type ActiveTab = 'budget' | 'timeline' | 'vendors' | 'creative';

const NAV_TABS = [
  { key: 'budget' as ActiveTab, label: 'Budget & Contingency', icon: DollarSign },
  { key: 'timeline' as ActiveTab, label: 'Timeline & Run-of-Show', icon: Clock },
  { key: 'vendors' as ActiveTab, label: 'Vendor Pipeline CRM', icon: Users },
  { key: 'creative' as ActiveTab, label: 'Creative Atelier', icon: Sparkles },
];

export function App() {
  const [events, setEvents] = useState<EventPlan[]>(() => StorageService.getEvents());
  const [activeEventId, setActiveEventId] = useState<string>(() => StorageService.getActiveEventId());
  const [activeTab, setActiveTab] = useState<ActiveTab>('budget');
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
    <div className="app-container bg-ambient-grid">
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
      />

      {/* Module Navigation Tabs with Aceternity Sliding Pill */}
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
                  <Icon size={16} color={isActive ? 'var(--gold-400)' : 'var(--text-secondary)'} />
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

      {/* Footer */}
      <footer className="app-footer">
        <div>
          <strong>EventiQ Haute Atelier</strong> — Production-grade celebration planning for Weddings, Milestone Birthdays, and Community Galas.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Crafted with mathematical precision & aesthetic care</span>
          <Heart size={13} color="var(--gold-400)" fill="var(--gold-400)" />
        </div>
      </footer>
    </div>
  );
}

export default App;
