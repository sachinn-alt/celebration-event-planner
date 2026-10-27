import { useState, useEffect } from 'react';
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
import './App.css';

type ActiveTab = 'budget' | 'timeline' | 'vendors' | 'creative';

export function App() {
  const [events, setEvents] = useState<EventPlan[]>(() => StorageService.getEvents());
  const [activeEventId, setActiveEventId] = useState<string>(() => StorageService.getActiveEventId());
  const [activeTab, setActiveTab] = useState<ActiveTab>('budget');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
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
    <div className="app-container">
      {/* Executive Header & HUD Deck */}
      <Header
        activeEvent={activeEvent}
        allEvents={events}
        onSelectEvent={handleSelectEvent}
        onResetPresets={handleResetPresets}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={hasApiKey}
        onImportEvent={handleImportEvent}
      />

      {/* Module Navigation Tabs */}
      <nav className="nav-tabs-wrapper no-print" aria-label="Main Navigation">
        <div className="nav-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
            <DollarSign size={16} />
            <span>Budget & Contingency</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <Clock size={16} />
            <span>Timeline & Run-of-Show</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
          >
            <Users size={16} />
            <span>Vendor Pipeline CRM</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'creative' ? 'active' : ''}`}
            onClick={() => setActiveTab('creative')}
          >
            <Sparkles size={16} />
            <span>Creative Atelier</span>
          </button>
        </div>
      </nav>

      {/* Active Module View */}
      <main style={{ minHeight: '500px' }}>
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
