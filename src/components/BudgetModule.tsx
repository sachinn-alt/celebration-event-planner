import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Search,
  X,
} from 'lucide-react';
import type { EventPlan, BudgetItem, BudgetCategoryKey, ExpenseStatus } from '../types/event';
import { BUDGET_CATEGORIES } from '../data/presets';
import { StorageService } from '../services/storage';
import { IconlyAnimation } from './IconlyAnimation';

interface BudgetModuleProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const BudgetModule: React.FC<BudgetModuleProps> = ({ event, onUpdateEvent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal State for Add / Edit Line Item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<BudgetCategoryKey>('catering');
  const [itemEstimatedCost, setItemEstimatedCost] = useState('');
  const [itemActualCost, setItemActualCost] = useState('');
  const [itemStatus, setItemStatus] = useState<ExpenseStatus>('estimated');
  const [itemNotes, setItemNotes] = useState('');

  const analytics = StorageService.calculateBudgetAnalytics(event);

  const openAddModal = (defaultCategory?: BudgetCategoryKey) => {
    setEditingItem(null);
    setItemName('');
    setItemCategory(defaultCategory || 'catering');
    setItemEstimatedCost('');
    setItemActualCost('');
    setItemStatus('estimated');
    setItemNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemEstimatedCost(item.estimatedCost.toString());
    setItemActualCost(item.actualCost.toString());
    setItemStatus(item.status);
    setItemNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const estCost = Math.max(0, parseFloat(itemEstimatedCost) || 0);
    const actCost = Math.max(0, parseFloat(itemActualCost) || estCost);

    let updatedItems: BudgetItem[];

    if (editingItem) {
      updatedItems = event.budget.items.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              name: itemName.trim().slice(0, 100),
              category: itemCategory,
              estimatedCost: estCost,
              actualCost: actCost,
              status: itemStatus,
              notes: itemNotes.trim().slice(0, 500),
            }
          : i
      );
    } else {
      const newItem: BudgetItem = {
        id: `item-${Date.now()}`,
        name: itemName.trim().slice(0, 100),
        category: itemCategory,
        estimatedCost: estCost,
        actualCost: actCost,
        status: itemStatus,
        notes: itemNotes.trim().slice(0, 500),
      };
      updatedItems = [...event.budget.items, newItem];
    }

    const updatedEvent: EventPlan = {
      ...event,
      budget: {
        ...event.budget,
        items: updatedItems,
      },
    };

    onUpdateEvent(updatedEvent);
    setIsModalOpen(false);
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Delete this line item?')) {
      const updatedEvent: EventPlan = {
        ...event,
        budget: {
          ...event.budget,
          items: event.budget.items.filter((i) => i.id !== itemId),
        },
      };
      onUpdateEvent(updatedEvent);
    }
  };

  const cycleStatus = (item: BudgetItem) => {
    const nextStatus: Record<ExpenseStatus, ExpenseStatus> = {
      estimated: 'quoted',
      quoted: 'paid',
      paid: 'estimated',
    };
    const updatedItems = event.budget.items.map((i) =>
      i.id === item.id ? { ...i, status: nextStatus[i.status] } : i
    );
    onUpdateEvent({
      ...event,
      budget: {
        ...event.budget,
        items: updatedItems,
      },
    });
  };

  const handleContingencyChange = (newPercent: number) => {
    onUpdateEvent({
      ...event,
      budget: {
        ...event.budget,
        contingencyPercent: Math.max(5, Math.min(25, newPercent)),
      },
    });
  };

  // Filter line items
  const filteredItems = event.budget.items.filter((item) => {
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    const matchesStatus =
      selectedStatusFilter === 'all' || item.status === selectedStatusFilter;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  const hasActiveFilter =
    selectedCategoryFilter !== 'all' ||
    selectedStatusFilter !== 'all' ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategoryFilter('all');
    setSelectedStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Module Intro & Main Action Bar */}
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
            Intelligent Budget & Contingency Shield
          </h2>
          <p style={{ fontSize: 'var(--type-body-sm)' }}>
            Mathematical financial allocation tailored to {event.type.toUpperCase()} standards with locked contingency protection.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openAddModal()}
        >
          <Plus size={16} />
          <span>Add Expense Item</span>
        </button>
      </div>

      {/* Real-time Category Allocation Progress Meter */}
      <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600 }}>
            Proportional Allocation Meter
          </span>
          <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
            {event.budget.currency}
            {analytics.actualSpent.toLocaleString()} of {event.budget.currency}
            {analytics.totalBudget.toLocaleString()} Total Ceiling
          </span>
        </div>

        {/* Multi-Colored Segmented Bar */}
        <div
          style={{
            height: '14px',
            width: '100%',
            backgroundColor: 'var(--color-soft-mist)',
            border: '1px solid var(--color-carbon)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          {BUDGET_CATEGORIES.map((cat) => {
            const spend = analytics.categoryTotals[cat.key]?.actual || 0;
            const pct = (spend / analytics.totalBudget) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={cat.key}
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: cat.color,
                }}
                title={`${cat.label}: ${event.budget.currency}${spend.toLocaleString()} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Segment Legend */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-3)',
          }}
        >
          {BUDGET_CATEGORIES.map((cat) => {
            const spend = analytics.categoryTotals[cat.key]?.actual || 0;
            const pct = Math.round((spend / analytics.totalBudget) * 100);
            return (
              <div
                key={cat.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--type-caption-xs)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: cat.color,
                    display: 'inline-block',
                  }}
                />
                <span>
                  {cat.label} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contingency Shield Control Card */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-mint-pop)',
              border: '1px solid var(--color-carbon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} color="var(--color-carbon)" />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--type-heading-md)', color: 'var(--color-carbon)' }}>
              Contingency Shield ({event.budget.contingencyPercent}%) — {event.budget.currency}
              {analytics.contingencyReserved.toLocaleString()}
            </h3>
            <p style={{ fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Dedicated emergency reserve protecting against surprise vendor fees, overtime, and weather adjustments.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {[8, 10, 12, 15].map((pct) => (
            <button
              key={pct}
              type="button"
              className={`btn btn-sm ${event.budget.contingencyPercent === pct ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleContingencyChange(pct)}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="filter-search-box">
          <Search
            size={16}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search expenses or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills-group">
          <select
            className={`form-select filter-select ${selectedCategoryFilter !== 'all' ? 'active-filter' : ''}`}
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            aria-label="Filter expenses by category"
          >
            <option value="all">All Categories</option>
            {BUDGET_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            className={`form-select filter-select ${selectedStatusFilter !== 'all' ? 'active-filter' : ''}`}
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            aria-label="Filter expenses by lifecycle status"
          >
            <option value="all">All Statuses</option>
            <option value="estimated">Estimated</option>
            <option value="quoted">Quoted</option>
            <option value="paid">Paid</option>
          </select>

          {hasActiveFilter && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{ height: '42px', padding: '0 14px', fontSize: '12px' }}
              onClick={resetFilters}
              title="Reset all filters"
            >
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expense Line Items List */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-soft-mist)',
            borderBottom: '1px solid var(--color-carbon)',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
            gap: 'var(--space-2)',
            fontSize: 'var(--type-caption-xs)',
            color: 'var(--color-carbon)',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.03em',
          }}
        >
          <span>Line Item / Category</span>
          <span style={{ textAlign: 'right' }}>Est. Cost</span>
          <span style={{ textAlign: 'right' }}>Actual / Quoted</span>
          <span style={{ textAlign: 'center' }}>Lifecycle</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {filteredItems.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            No expense items matching the active filters.
          </div>
        ) : (
          filteredItems.map((item) => {
            const cat = BUDGET_CATEGORIES.find((c) => c.key === item.category);
            return (
              <div
                key={item.id}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--color-soft-mist)',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  transition: 'background-color 0.15s ease',
                }}
                className="table-row-hover"
              >
                {/* Item Name & Category Badge */}
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--type-body-sm)' }}>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span
                      style={{
                        fontSize: 'var(--type-caption-xs)',
                        color: cat?.color || 'var(--text-muted)',
                        fontWeight: 500,
                      }}
                    >
                      {cat?.label || item.category}
                    </span>
                    {item.notes && (
                      <span style={{ fontSize: 'var(--type-caption-xs)', color: 'var(--text-muted)' }}>
                        • {item.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Estimated Cost */}
                <div style={{ textAlign: 'right', fontSize: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
                  {event.budget.currency}
                  {item.estimatedCost.toLocaleString()}
                </div>

                {/* Actual Cost */}
                <div style={{ textAlign: 'right', fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {event.budget.currency}
                  {item.actualCost.toLocaleString()}
                </div>

                {/* Status Badge (Click to Cycle) */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => cycleStatus(item)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    title="Click to cycle status"
                  >
                    <span
                      className={`badge ${
                        item.status === 'paid'
                          ? 'badge-success'
                          : item.status === 'quoted'
                          ? 'badge-warning'
                          : 'badge-muted'
                      }`}
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      {item.status === 'paid' && <IconlyAnimation name="receipt-check" size={13} />}
                      {item.status}
                    </span>
                  </button>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '4px' }}
                    onClick={() => openEditModal(item)}
                    aria-label="Edit line item"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '4px', color: '#f87171' }}
                    onClick={() => handleDeleteItem(item.id)}
                    aria-label="Delete line item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Expense Item Modal with Skiper Spring Motion */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconlyAnimation name="dollar-up" size={22} alt="Expense Item" />
                  <h3 className="modal-title" style={{ margin: 0 }}>
                    {editingItem ? 'Edit Expense Item' : 'Add New Expense Item'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

            <form onSubmit={handleSaveItem}>
              <div className="form-group">
                <label className="form-label" htmlFor="expense-item-name">Item Description</label>
                <input
                  id="expense-item-name"
                  type="text"
                  className="form-input"
                  required
                  maxLength={100}
                  placeholder="e.g. Barrel Room Rental or Acoustic Duo"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-item-category">Category</label>
                <select
                  id="expense-item-category"
                  className="form-select"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value as BudgetCategoryKey)}
                >
                  {BUDGET_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label} (Standard {c.recommendedPercent[event.type]}%)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="expense-est-cost">Estimated Cost ({event.budget.currency})</label>
                  <input
                    id="expense-est-cost"
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    placeholder="0"
                    value={itemEstimatedCost}
                    onChange={(e) => setItemEstimatedCost(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="expense-act-cost">Actual / Quoted ({event.budget.currency})</label>
                  <input
                    id="expense-act-cost"
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    placeholder="0"
                    value={itemActualCost}
                    onChange={(e) => setItemActualCost(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-item-status">Payment Lifecycle Status</label>
                <select
                  id="expense-item-status"
                  className="form-select"
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value as ExpenseStatus)}
                >
                  <option value="estimated">Estimated (Rough Budget)</option>
                  <option value="quoted">Quoted (Vendor Estimate Received)</option>
                  <option value="paid">Paid (Deposit or Full Balance Cleared)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-item-notes">Contract / Vendor Notes</label>
                <textarea
                  id="expense-item-notes"
                  className="form-textarea"
                  maxLength={500}
                  placeholder="Terms, deadlines, or contact details..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
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
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
    </div>
  );
};
