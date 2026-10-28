import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Star,
  HelpCircle,
  ArrowRight,
  Copy,
  Check,
  X,
} from 'lucide-react';
import type { EventPlan, Vendor, VendorPipelineStatus, BudgetCategoryKey } from '../types/event';
import { BUDGET_CATEGORIES } from '../data/presets';

interface VendorModuleProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

const PIPELINE_STAGES: Array<{ key: VendorPipelineStatus; label: string; color: string }> = [
  { key: 'wishlist', label: '1. Wishlist / Prospect', color: '#9CA3AF' },
  { key: 'contacted', label: '2. Initial Outreach', color: '#06B6D4' },
  { key: 'quote_received', label: '3. Quote Received', color: '#F59E0B' },
  { key: 'deposit_paid', label: '4. Deposit Paid', color: '#8B5CF6' },
  { key: 'confirmed', label: '5. Confirmed & Locked', color: '#10B981' },
];

export const VendorModule: React.FC<VendorModuleProps> = ({ event, onUpdateEvent }) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activeInterviewGuide, setActiveInterviewGuide] = useState<Vendor | null>(null);
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState<BudgetCategoryKey>('catering');
  const [vendorContactPerson, setVendorContactPerson] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorStatus, setVendorStatus] = useState<VendorPipelineStatus>('wishlist');
  const [vendorQuotedAmount, setVendorQuotedAmount] = useState('');
  const [vendorDepositPaid, setVendorDepositPaid] = useState('');
  const [vendorRating, setVendorRating] = useState('5');
  const [vendorNotes, setVendorNotes] = useState('');

  const openAddModal = () => {
    setEditingVendor(null);
    setVendorName('');
    setVendorCategory('catering');
    setVendorContactPerson('');
    setVendorEmail('');
    setVendorPhone('');
    setVendorStatus('wishlist');
    setVendorQuotedAmount('');
    setVendorDepositPaid('');
    setVendorRating('5');
    setVendorNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVendorName(vendor.name);
    setVendorCategory(vendor.category);
    setVendorContactPerson(vendor.contactPerson || '');
    setVendorEmail(vendor.email || '');
    setVendorPhone(vendor.phone || '');
    setVendorStatus(vendor.status);
    setVendorQuotedAmount(vendor.quotedAmount ? vendor.quotedAmount.toString() : '');
    setVendorDepositPaid(vendor.depositPaid ? vendor.depositPaid.toString() : '');
    setVendorRating(vendor.rating ? vendor.rating.toString() : '5');
    setVendorNotes(vendor.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    const quoted = Math.max(0, parseFloat(vendorQuotedAmount) || 0);
    const deposit = Math.max(0, parseFloat(vendorDepositPaid) || 0);
    const rating = Math.max(1, Math.min(5, parseInt(vendorRating, 10) || 5));

    // Category default questions generator
    const defaultQuestions: Record<BudgetCategoryKey, string[]> = {
      venue: [
        'What is your rain/weather contingency backup plan and notice period?',
        'Are outside catering and alcohol vendors permitted with standard corkage fees?',
        'What are the exact load-in and cleanup curfew hours for vendors?',
      ],
      catering: [
        'How do you manage severe allergies and dietary requirements on event day?',
        'What is your staff-to-guest ratio for plated dinner service?',
        'Do you provide vendor meals for photographers and musicians?',
      ],
      photo_video: [
        'What is your turnaround time for preview teasers and the full curated gallery?',
        'Do you bring backup camera bodies, lenses, and dual-slot memory cards?',
        'How do you handle golden hour coordination with the master schedule?',
      ],
      music_entertainment: [
        'Do you provide wireless lapel microphones for speeches and vows?',
        'What is your protocol if an acoustic performer or DJ falls ill on the event date?',
        'Can we provide a custom "do-not-play" list for the reception?',
      ],
      decor_florals: [
        'Can ceremony arbor flowers and aisle arrangements be repurposed to dining tables?',
        'What happens to rented vases, candleholders, and pedestals post-event?',
        'Are flame candles permitted by venue insurance or are LED pillars required?',
      ],
      attire_beauty: [
        'How many weeks prior should final dress/suit fittings occur?',
        'Do you provide on-site day-of steaming and emergency wardrobe kits?',
        'What is your trial session policy before the main celebration?',
      ],
      favors_invites: [
        'What is the print turnaround time including foil embossing and envelope addressing?',
        'Can we receive a physical sample proof before the full production run?',
        'Are custom postage weights factored into invitation sizing?',
      ],
      contingency: [
        'What is the cancellation and refund schedule if plans change?',
        'Are force majeure clauses explicitly detailed in the agreement?',
        'What are the overtime rates per hour if the celebration extends past curfew?',
      ],
    };

    let updatedVendors: Vendor[];

    if (editingVendor) {
      updatedVendors = event.vendors.map((v) =>
        v.id === editingVendor.id
          ? {
              ...v,
              name: vendorName.trim().slice(0, 100),
              category: vendorCategory,
              contactPerson: vendorContactPerson.trim().slice(0, 100) || undefined,
              email: vendorEmail.trim().slice(0, 100) || undefined,
              phone: vendorPhone.trim().slice(0, 30) || undefined,
              status: vendorStatus,
              quotedAmount: quoted,
              depositPaid: deposit,
              rating,
              notes: vendorNotes.trim().slice(0, 500) || undefined,
            }
          : v
      );
    } else {
      const newVendor: Vendor = {
        id: `vendor-${Date.now()}`,
        name: vendorName.trim().slice(0, 100),
        category: vendorCategory,
        contactPerson: vendorContactPerson.trim().slice(0, 100) || undefined,
        email: vendorEmail.trim().slice(0, 100) || undefined,
        phone: vendorPhone.trim().slice(0, 30) || undefined,
        status: vendorStatus,
        quotedAmount: quoted,
        depositPaid: deposit,
        rating,
        notes: vendorNotes.trim().slice(0, 500) || undefined,
        aiSuggestedQuestions: defaultQuestions[vendorCategory] || [
          'What is your overtime policy and hourly surcharge?',
          'What backup equipment or staff do you bring on-site?',
        ],
      };
      updatedVendors = [...event.vendors, newVendor];
    }

    onUpdateEvent({
      ...event,
      vendors: updatedVendors,
    });
    setIsModalOpen(false);
  };

  const advanceStage = (vendor: Vendor) => {
    const stageFlow: Record<VendorPipelineStatus, VendorPipelineStatus> = {
      wishlist: 'contacted',
      contacted: 'quote_received',
      quote_received: 'deposit_paid',
      deposit_paid: 'confirmed',
      confirmed: 'confirmed',
    };

    const next = stageFlow[vendor.status];
    if (next === vendor.status) return;

    const updated = event.vendors.map((v) =>
      v.id === vendor.id ? { ...v, status: next } : v
    );
    onUpdateEvent({ ...event, vendors: updated });
  };

  const handleDeleteVendor = (id: string) => {
    if (window.confirm('Remove this vendor from your pipeline?')) {
      onUpdateEvent({
        ...event,
        vendors: event.vendors.filter((v) => v.id !== id),
      });
    }
  };

  const copyQuestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  const filteredVendors = event.vendors.filter((v) =>
    selectedCategoryFilter === 'all' ? true : v.category === selectedCategoryFilter
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Module Header */}
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
            Vendor Pipeline Matrix & Vetting CRM
          </h2>
          <p style={{ fontSize: 'var(--type-body-sm)' }}>
            Stage-gate contract pipeline with cost tracking and category-specific AI negotiation questions.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Filter by Category */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn btn-sm ${selectedCategoryFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: 'var(--type-caption-xs)' }}
          onClick={() => setSelectedCategoryFilter('all')}
        >
          All Categories ({event.vendors.length})
        </button>
        {BUDGET_CATEGORIES.map((cat) => {
          const count = event.vendors.filter((v) => v.category === cat.key).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.key}
              type="button"
              className={`btn btn-sm ${selectedCategoryFilter === cat.key ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 'var(--type-caption-xs)' }}
              onClick={() => setSelectedCategoryFilter(cat.key)}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Pipeline Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
          alignItems: 'flex-start',
        }}
      >
        {PIPELINE_STAGES.map((stage) => {
          const stageVendors = filteredVendors.filter((v) => v.status === stage.key);
          return (
            <div
              key={stage.key}
              style={{
                background: 'rgba(14, 19, 31, 0.65)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                minHeight: '380px',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 'var(--space-2)',
                  borderBottom: `2px solid ${stage.color}`,
                }}
              >
                <span style={{ fontSize: 'var(--type-caption-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stage.label}
                </span>
                <span className="badge badge-muted">{stageVendors.length}</span>
              </div>

              {/* Vendor Cards in Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {stageVendors.length === 0 ? (
                  <div
                    style={{
                      padding: 'var(--space-6) var(--space-2)',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: 'var(--type-caption-xs)',
                    }}
                  >
                    No vendors in this stage
                  </div>
                ) : (
                  stageVendors.map((vendor) => {
                    const cat = BUDGET_CATEGORIES.find((c) => c.key === vendor.category);
                    return (
                      <div
                        key={vendor.id}
                        className="glass-card glass-card-interactive"
                        style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '8px' }}
                      >
                        {/* Top: Category & Rating */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              color: cat?.color || 'var(--gold-400)',
                            }}
                          >
                            {cat?.label || vendor.category}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Star size={12} fill="#F59E0B" color="#F59E0B" />
                            <span style={{ fontSize: 'var(--type-caption-xs)', fontWeight: 600 }}>
                              {vendor.rating || 5}
                            </span>
                          </div>
                        </div>

                        {/* Vendor Name */}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--type-body-sm)' }}>
                            {vendor.name}
                          </div>
                          {vendor.contactPerson && (
                            <div style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-secondary)' }}>
                              Contact: {vendor.contactPerson}
                            </div>
                          )}
                        </div>

                        {/* Financial Snapshot */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--type-caption-xs)',
                          }}
                        >
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Quoted: </span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {event.budget.currency}
                              {vendor.quotedAmount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Deposit: </span>
                            <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>
                              {event.budget.currency}
                              {vendor.depositPaid.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* AI Interview Questions Button */}
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--type-caption-xs)', color: 'var(--gold-400)' }}
                          onClick={() => setActiveInterviewGuide(vendor)}
                        >
                          <HelpCircle size={14} />
                          <span>AI Interview Guide</span>
                        </button>

                        {/* Card Footer Actions: Advance Stage & Edit/Delete */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid var(--border-subtle)',
                            paddingTop: '6px',
                            marginTop: '2px',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px' }}
                              onClick={() => openEditModal(vendor)}
                              aria-label="Edit vendor"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px', color: '#f87171' }}
                              onClick={() => handleDeleteVendor(vendor.id)}
                              aria-label="Delete vendor"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {vendor.status !== 'confirmed' && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 10px' }}
                              onClick={() => advanceStage(vendor)}
                            >
                              <span>Next</span>
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Interview Guides Modal */}
      {activeInterviewGuide && (
        <div className="modal-backdrop" onClick={() => setActiveInterviewGuide(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={20} color="var(--gold-400)" />
                <h3 className="modal-title">AI Vetting Guide: {activeInterviewGuide.name}</h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setActiveInterviewGuide(null)}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 'var(--type-body-sm)', marginBottom: 'var(--space-4)' }}>
              Tailored interview and negotiation questions for <strong>{activeInterviewGuide.category.toUpperCase()}</strong> vendors. 
              Copy any question to your email or interview notes:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {activeInterviewGuide.aiSuggestedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="glass-card"
                  style={{
                    padding: 'var(--space-3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                  }}
                >
                  <p style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-primary)', flex: 1 }}>
                    "{q}"
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyQuestion(q, idx)}
                    title="Copy question text"
                  >
                    {copiedQuestionIdx === idx ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveInterviewGuide(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h3>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVendor}>
              <div className="form-group">
                <label className="form-label" htmlFor="vendor-business-name">Vendor Business Name</label>
                <input
                  id="vendor-business-name"
                  type="text"
                  className="form-input"
                  required
                  maxLength={100}
                  placeholder="e.g. Silver Crest Audio or Napa Valley Cellars"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="vendor-category-select">Category</label>
                  <select
                    id="vendor-category-select"
                    className="form-select"
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value as BudgetCategoryKey)}
                  >
                    {BUDGET_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="vendor-status-select">Pipeline Stage</label>
                  <select
                    id="vendor-status-select"
                    className="form-select"
                    value={vendorStatus}
                    onChange={(e) => setVendorStatus(e.target.value as VendorPipelineStatus)}
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="vendor-contact-input">Contact Person</label>
                  <input
                    id="vendor-contact-input"
                    type="text"
                    className="form-input"
                    maxLength={100}
                    placeholder="e.g. Chef Antoine"
                    value={vendorContactPerson}
                    onChange={(e) => setVendorContactPerson(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="vendor-rating-input">Rating (1–5 Stars)</label>
                  <input
                    id="vendor-rating-input"
                    type="number"
                    min="1"
                    max="5"
                    className="form-input"
                    value={vendorRating}
                    onChange={(e) => setVendorRating(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="vendor-email-input">Email Address</label>
                  <input
                    id="vendor-email-input"
                    type="email"
                    className="form-input"
                    maxLength={100}
                    placeholder="contact@vendor.com"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="vendor-phone-input">Phone Number</label>
                  <input
                    id="vendor-phone-input"
                    type="tel"
                    className="form-input"
                    maxLength={30}
                    placeholder="+1 (555) 000-0000"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="vendor-quoted-amount">Quoted Amount ({event.budget.currency})</label>
                  <input
                    id="vendor-quoted-amount"
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    placeholder="0"
                    value={vendorQuotedAmount}
                    onChange={(e) => setVendorQuotedAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="vendor-deposit-paid">Deposit Paid ({event.budget.currency})</label>
                  <input
                    id="vendor-deposit-paid"
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    placeholder="0"
                    value={vendorDepositPaid}
                    onChange={(e) => setVendorDepositPaid(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="vendor-notes-input">Contract Clauses & Notes</label>
                <textarea
                  id="vendor-notes-input"
                  className="form-textarea"
                  maxLength={500}
                  placeholder="Inclusions, setup arrival time, meal requirements..."
                  value={vendorNotes}
                  onChange={(e) => setVendorNotes(e.target.value)}
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
                  {editingVendor ? 'Save Changes' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
