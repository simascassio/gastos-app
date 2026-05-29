import React, { useState, useEffect, useMemo } from 'react'
import { supabase, getDeviceId } from './supabase'
import './App.css'

const CATEGORIES = [
  { id: 'food',          label: 'Alimentação', emoji: '🍔', color: '#FF6B6B' },
  { id: 'transport',     label: 'Transporte',  emoji: '🚗', color: '#4ECDC4' },
  { id: 'fuel',          label: 'Gasolina',    emoji: '⛽', color: '#FFD93D' },
  { id: 'health',        label: 'Saúde',       emoji: '💊', color: '#6BCB77' },
  { id: 'entertainment', label: 'Lazer',       emoji: '🎮', color: '#C77DFF' },
  { id: 'shopping',      label: 'Compras',     emoji: '🛍️', color: '#FF9A3C' },
  { id: 'home',          label: 'Casa',        emoji: '🏠', color: '#4D96FF' },
  { id: 'education',     label: 'Educação',    emoji: '📚', color: '#FF6FC8' },
  { id: 'other',         label: 'Outros',      emoji: '📦', color: '#A0A0B0' },
]

const PERIODS = [
  { id: 'day',   label: 'Hoje'   },
  { id: 'week',  label: 'Semana' },
  { id: 'month', label: 'Mês'    },
  { id: 'year',  label: 'Ano'    },
  { id: 'all',   label: 'Tudo'   },
]

function getCat(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}

function formatBRL(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

function formatDate(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit'
  })
}

function inPeriod(dateStr, period) {
  const now = new Date()
  const d   = new Date(dateStr + 'T12:00:00')
  if (period === 'all')   return true
  if (period === 'day')   return d.toDateString() === now.toDateString()
  if (period === 'week')  { const w = new Date(now); w.setDate(now.getDate()-7); return d >= w }
  if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  if (period === 'year')  return d.getFullYear() === now.getFullYear()
  return true
}

const VIEWS = { LIST: 'list', ADD: 'add', STATS: 'stats' }

export default function App() {
  const [expenses,        setExpenses]        = useState([])
  const [loading,         setLoading]         = useState(true)
  const [syncing,         setSyncing]         = useState(false)
  const [view,            setView]            = useState(VIEWS.LIST)
  const [filterPeriod,    setFilterPeriod]    = useState('month')
  const [filterCategory,  setFilterCategory]  = useState('all')
  const [editingExpense,  setEditingExpense]  = useState(null)
  const [toast,           setToast]           = useState(null)
  const deviceId = getDeviceId()

  // ── Load from Supabase ──────────────────────────────────────
  useEffect(() => {
    loadExpenses()
  }, [])

  async function loadExpenses() {
    setLoading(true)
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('device_id', deviceId)
      .order('date', { ascending: false })

    if (!error && data) setExpenses(data)
    else if (error)     showToast('Erro ao carregar dados', 'error')
    setLoading(false)
  }

  // ── Toast ───────────────────────────────────────────────────
  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  // ── Add / Edit ──────────────────────────────────────────────
  async function handleSave(form) {
    setSyncing(true)
    if (editingExpense) {
      const { error } = await supabase
        .from('expenses')
        .update({ amount: form.amount, description: form.description, category: form.category, date: form.date })
        .eq('id', editingExpense.id)

      if (!error) {
        setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...e, ...form } : e))
        showToast('Gasto atualizado! ✅')
      } else showToast('Erro ao atualizar', 'error')
    } else {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ device_id: deviceId, ...form }])
        .select()
        .single()

      if (!error && data) {
        setExpenses(prev => [data, ...prev])
        showToast('Gasto adicionado! ✅')
      } else showToast('Erro ao salvar', 'error')
    }
    setSyncing(false)
    setEditingExpense(null)
    setView(VIEWS.LIST)
  }

  // ── Delete ──────────────────────────────────────────────────
  async function handleDelete(id) {
    setSyncing(true)
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (!error) {
      setExpenses(prev => prev.filter(e => e.id !== id))
      showToast('Removido!', 'error')
    } else showToast('Erro ao remover', 'error')
    setSyncing(false)
  }

  // ── Filtered list ───────────────────────────────────────────
  const filtered = useMemo(() => expenses.filter(e =>
    inPeriod(e.date, filterPeriod) &&
    (filterCategory === 'all' || e.category === filterCategory)
  ), [expenses, filterPeriod, filterCategory])

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0)

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="app">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      {syncing && <div className="sync-bar" />}

      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div>
            <p className="header-label">Meus Gastos</p>
            <h1 className="header-total">{formatBRL(total)}</h1>
            <p className="header-sub">
              {PERIODS.find(p => p.id === filterPeriod)?.label}
              {filterCategory !== 'all' && ` · ${getCat(filterCategory).label}`}
            </p>
          </div>
          <button className="fab" onClick={() => { setEditingExpense(null); setView(VIEWS.ADD) }}>+</button>
        </div>
      </header>

      {/* NAV */}
      <nav className="nav">
        <button className={`nav-btn ${view === VIEWS.LIST  ? 'active' : ''}`} onClick={() => setView(VIEWS.LIST)}>📋 Gastos</button>
        <button className={`nav-btn ${view === VIEWS.STATS ? 'active' : ''}`} onClick={() => setView(VIEWS.STATS)}>📊 Resumo</button>
      </nav>

      {/* CONTENT */}
      <main className="content">
        {loading ? (
          <div className="empty"><div className="spinner" /><p>Carregando...</p></div>
        ) : view === VIEWS.ADD ? (
          <AddForm
            initial={editingExpense}
            onSave={handleSave}
            onCancel={() => { setEditingExpense(null); setView(VIEWS.LIST) }}
          />
        ) : view === VIEWS.STATS ? (
          <StatsView expenses={filtered} filterPeriod={filterPeriod} setFilterPeriod={setFilterPeriod} />
        ) : (
          <ListView
            expenses={filtered}
            filterPeriod={filterPeriod}    setFilterPeriod={setFilterPeriod}
            filterCategory={filterCategory} setFilterCategory={setFilterCategory}
            onDelete={handleDelete}
            onEdit={e => { setEditingExpense(e); setView(VIEWS.ADD) }}
          />
        )}
      </main>
    </div>
  )
}

// ════════════════════════════════════════════════
// ADD / EDIT FORM
// ════════════════════════════════════════════════
function AddForm({ initial, onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0]
  const [amount,      setAmount]      = useState(initial ? String(initial.amount) : '')
  const [description, setDescription] = useState(initial?.description || '')
  const [category,    setCategory]    = useState(initial?.category    || 'food')
  const [date,        setDate]        = useState(initial?.date        || today)

  function submit() {
    const val = parseFloat(amount.replace(',', '.'))
    if (!val || val <= 0)       return alert('Informe um valor válido.')
    if (!description.trim())    return alert('Informe uma descrição.')
    onSave({ amount: val, description: description.trim(), category, date })
  }

  return (
    <div className="form">
      <h2 className="form-title">{initial ? 'Editar Gasto' : 'Novo Gasto'}</h2>

      <label className="lbl">Valor (R$)</label>
      <input className="inp" type="number" inputMode="decimal" placeholder="0,00"
        value={amount} onChange={e => setAmount(e.target.value)} />

      <label className="lbl">Descrição</label>
      <input className="inp" type="text" placeholder="Ex: Almoço, Uber, Mercado..."
        value={description} onChange={e => setDescription(e.target.value)} />

      <label className="lbl">Categoria</label>
      <div className="cat-grid">
        {CATEGORIES.map(cat => (
          <button key={cat.id}
            className={`cat-btn ${category === cat.id ? 'selected' : ''}`}
            style={{ '--cat-color': cat.color }}
            onClick={() => setCategory(cat.id)}>
            <span className="cat-emoji">{cat.emoji}</span>
            <span className="cat-name">{cat.label}</span>
          </button>
        ))}
      </div>

      <label className="lbl">Data</label>
      <input className="inp" type="date" value={date} onChange={e => setDate(e.target.value)} />

      <button className="btn-save"  onClick={submit}>{initial ? 'Salvar' : 'Adicionar'}</button>
      <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
    </div>
  )
}

// ════════════════════════════════════════════════
// LIST VIEW
// ════════════════════════════════════════════════
function ListView({ expenses, filterPeriod, setFilterPeriod, filterCategory, setFilterCategory, onDelete, onEdit }) {
  const grouped = useMemo(() => {
    const map = {}
    expenses.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e) })
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [expenses])

  return (
    <div>
      <div className="chips">
        {PERIODS.map(p => (
          <button key={p.id} className={`chip ${filterPeriod === p.id ? 'chip-active' : ''}`}
            onClick={() => setFilterPeriod(p.id)}>{p.label}</button>
        ))}
      </div>
      <div className="chips" style={{ marginBottom: 16 }}>
        <button className={`chip ${filterCategory === 'all' ? 'chip-active' : ''}`}
          onClick={() => setFilterCategory('all')}>Todos</button>
        {CATEGORIES.map(c => (
          <button key={c.id}
            className={`chip ${filterCategory === c.id ? 'chip-active' : ''}`}
            style={filterCategory === c.id ? { background: c.color, color: '#111', borderColor: c.color } : {}}
            onClick={() => setFilterCategory(c.id)}>{c.emoji}</button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 52 }}>💸</div>
          <p>Nenhum gasto encontrado</p>
          <small>Toque em + para adicionar</small>
        </div>
      ) : grouped.map(([date, items]) => (
        <div key={date} className="day-group">
          <div className="day-header">
            <span>{formatDate(date)}</span>
            <span className="day-total">{formatBRL(items.reduce((s, e) => s + Number(e.amount), 0))}</span>
          </div>
          {items.map(e => {
            const cat = getCat(e.category)
            return (
              <div key={e.id} className="card">
                <div className="card-icon" style={{ background: cat.color + '22' }}>{cat.emoji}</div>
                <div className="card-info">
                  <p className="card-desc">{e.description}</p>
                  <p className="card-cat">{cat.label}</p>
                </div>
                <div className="card-right">
                  <p className="card-amount">{formatBRL(e.amount)}</p>
                  <div className="card-actions">
                    <button onClick={() => onEdit(e)}>✏️</button>
                    <button onClick={() => onDelete(e.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════
// STATS VIEW
// ════════════════════════════════════════════════
function StatsView({ expenses, filterPeriod, setFilterPeriod }) {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

  const byCategory = useMemo(() => {
    const map = {}
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + Number(e.amount) })
    return Object.entries(map)
      .map(([id, amount]) => ({ ...getCat(id), amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [expenses])

  const byDay = useMemo(() => {
    const map = {}
    expenses.forEach(e => { map[e.date] = (map[e.date] || 0) + Number(e.amount) })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-14)
  }, [expenses])

  const maxDay = byDay.length ? Math.max(...byDay.map(d => d[1])) : 1

  return (
    <div>
      <div className="chips">
        {PERIODS.map(p => (
          <button key={p.id} className={`chip ${filterPeriod === p.id ? 'chip-active' : ''}`}
            onClick={() => setFilterPeriod(p.id)}>{p.label}</button>
        ))}
      </div>

      <div className="stat-card">
        <p className="stat-label">Total do período</p>
        <h2 className="stat-total">{formatBRL(total)}</h2>
        <p className="stat-sub">{expenses.length} transações</p>
      </div>

      {byDay.length > 1 && (
        <div className="section">
          <p className="section-title">Gastos por dia</p>
          <div className="bar-chart">
            {byDay.map(([date, amount]) => (
              <div key={date} className="bar-col">
                <span className="bar-val">{formatBRL(amount).replace('R$\u00a0','')}</span>
                <div className="bar" style={{ height: Math.max(8, (amount / maxDay) * 90) }} />
                <span className="bar-lbl">
                  {new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <p className="section-title">Por categoria</p>
        {byCategory.length === 0
          ? <div className="empty">Sem dados</div>
          : byCategory.map(cat => {
              const pct = total > 0 ? (cat.amount / total) * 100 : 0
              return (
                <div key={cat.id} className="cat-row">
                  <div className="cat-row-left">
                    <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                    <span className="cat-row-name">{cat.label}</span>
                  </div>
                  <div className="cat-row-right">
                    <div className="cat-bar"><div className="cat-fill" style={{ width:`${pct}%`, background: cat.color }} /></div>
                    <span className="cat-amount">{formatBRL(cat.amount)}</span>
                  </div>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
