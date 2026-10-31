import { useEffect, useMemo, useState, type FormEvent } from 'react'

type VoucherKind = 'Sales' | 'Purchase' | 'Receipt' | 'Payment' | 'Journal'
type Voucher = { id: string; kind: VoucherKind; party: string; amount: number; date: string; note: string }
type Page = 'Overview' | 'Sales' | 'Purchases' | 'Expenses' | 'Cash & bank' | 'Parties' | 'Reports'

const storageKey = 'ledgerly-vouchers-v1'
const seedVouchers: Voucher[] = [
  { id: 'INV-1048', kind: 'Sales', party: 'Northstar Studio', amount: 42800, date: '2026-09-30', note: 'Brand identity project' },
  { id: 'PAY-0732', kind: 'Payment', party: 'Horizon Office Co.', amount: 12650, date: '2026-09-29', note: 'Office supplies' },
  { id: 'REC-0318', kind: 'Receipt', party: 'Mango & Co.', amount: 28500, date: '2026-09-28', note: 'Invoice INV-1042' },
  { id: 'PUR-0211', kind: 'Purchase', party: 'Paperplane Prints', amount: 8400, date: '2026-09-27', note: 'Packaging materials' },
  { id: 'INV-1047', kind: 'Sales', party: 'Mango & Co.', amount: 19200, date: '2026-09-26', note: 'Monthly retainer' },
]
const navGroups: { label: string; items: { name: Page; glyph: string }[] }[] = [
  { label: 'WORKSPACE', items: [{ name: 'Overview', glyph: '◫' }, { name: 'Sales', glyph: '↗' }, { name: 'Purchases', glyph: '↙' }, { name: 'Expenses', glyph: '⊙' }] },
  { label: 'MANAGE', items: [{ name: 'Cash & bank', glyph: '▤' }, { name: 'Parties', glyph: '♧' }, { name: 'Reports', glyph: '▥' }] },
]
const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
const dateLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

function readVouchers(): Voucher[] {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) as Voucher[] : seedVouchers
  } catch {
    return seedVouchers
  }
}

function App() {
  const [page, setPage] = useState<Page>('Overview')
  const [vouchers, setVouchers] = useState<Voucher[]>(readVouchers)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [kind, setKind] = useState<VoucherKind>('Sales')
  const [notice, setNotice] = useState('')

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(vouchers)) }, [vouchers])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timer)
  }, [notice])

  const visibleVouchers = useMemo(() => {
    const term = search.trim().toLowerCase()
    let rows = [...vouchers].sort((a, b) => b.date.localeCompare(a.date))
    if (page === 'Sales') rows = rows.filter((row) => row.kind === 'Sales' || row.kind === 'Receipt')
    if (page === 'Purchases') rows = rows.filter((row) => row.kind === 'Purchase' || row.kind === 'Payment')
    if (page === 'Expenses') rows = rows.filter((row) => row.kind === 'Payment')
    if (term) rows = rows.filter((row) => `${row.id} ${row.party} ${row.note} ${row.kind}`.toLowerCase().includes(term))
    return rows
  }, [vouchers, search, page])

  const sales = vouchers.filter((item) => item.kind === 'Sales').reduce((sum, item) => sum + item.amount, 0) + 184200
  const purchases = vouchers.filter((item) => item.kind === 'Purchase').reduce((sum, item) => sum + item.amount, 0) + 97200
  const collected = vouchers.filter((item) => item.kind === 'Receipt').reduce((sum, item) => sum + item.amount, 0) + 126400
  const outstanding = Math.max(0, sales - collected)
  const title = page === 'Overview' ? 'Good morning, Alex' : page

  function addVoucher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const amount = Number(form.get('amount'))
    const party = String(form.get('party')).trim()
    if (!party || !Number.isFinite(amount) || amount <= 0) return
    const prefix: Record<VoucherKind, string> = { Sales: 'INV', Purchase: 'PUR', Receipt: 'REC', Payment: 'PAY', Journal: 'JRN' }
    const id = `${prefix[kind]}-${String(Date.now()).slice(-4)}`
    const newVoucher: Voucher = { id, kind, party, amount, date: String(form.get('date')), note: String(form.get('note') || '').trim() }
    setVouchers((current) => [newVoucher, ...current])
    setDialogOpen(false)
    setNotice(`${kind} voucher ${id} saved`)
  }

  function openVoucher(nextKind: VoucherKind = 'Sales') {
    setKind(nextKind)
    setDialogOpen(true)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">l<span>.</span></div><div><strong>ledgerly</strong><small>BUSINESS BOOKS</small></div></div>
        <button className="company-switch"><span className="company-avatar">N</span><span className="company-name"><b>Northstar Studio</b><small>FY 2026–27</small></span><span className="chevron">⌄</span></button>
        <div className="side-search"><span>⌕</span><input aria-label="Search workspace" placeholder="Search anything" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></div>
        <nav aria-label="Main navigation">
          {navGroups.map((group) => <div className="nav-group" key={group.label}><span className="nav-heading">{group.label}</span>{group.items.map((item) => <button key={item.name} className={`nav-link ${page === item.name ? 'active' : ''}`} onClick={() => setPage(item.name)}><span className="nav-glyph">{item.glyph}</span>{item.name}{item.name === 'Sales' && <span className="nav-count">12</span>}</button>)}</div>)}
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✳</div><strong>Need a hand?</strong><p>Get help setting up your books.</p><button onClick={() => setNotice('Help center is coming soon')}>Visit help center <span>→</span></button></div><button className="profile"><span className="profile-avatar">AK</span><span><b>Alex Kim</b><small>Owner</small></span><span className="profile-more">···</span></button></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumbs"><span>Northstar Studio</span><span className="crumb-sep">/</span><b>{page}</b></div><div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={() => setNotice('You’re all caught up')}><span>♧</span><i /></button><button className="outline-button" onClick={() => setNotice('Your books are up to date')}>↻ <span>Sync</span></button><button className="primary-button top-create" onClick={() => openVoucher()}>＋ <span>Create entry</span></button></div></header>
        <div className="page-content">
          <section className="welcome-row"><div><div className="eyebrow">TUESDAY, SEPTEMBER 30, 2026 <span className="live-dot" /> BOOKS ARE UP TO DATE</div><h1>{title}<span className="wave">✳</span></h1><p className="subtitle">Here’s what’s happening with your business today.</p></div><button className="date-filter" onClick={() => setNotice('Showing activity for this financial year')}>◷ <span>This month</span><span className="chevron">⌄</span></button></section>

          {page === 'Reports' ? <Reports sales={sales} purchases={purchases} outstanding={outstanding} /> : page === 'Parties' ? <Parties vouchers={vouchers} /> : page === 'Cash & bank' ? <CashPanel collected={collected} vouchers={vouchers} /> : <>
            <section className="stats-grid" aria-label="Financial summary">
              <article className="stat-card"><div className="stat-top"><span>Total sales</span><span className="stat-icon sales-icon">↗</span></div><strong>{money(sales)}</strong><div className="stat-foot"><span className="trend positive">↗ 12.8%</span><span>vs last month</span></div><div className="spark spark-green"><svg viewBox="0 0 100 32" preserveAspectRatio="none"><path d="M0 28 C10 25 11 15 21 19 S33 24 42 15 52 20 62 13 73 16 82 6 91 14 100 2" /></svg></div></article>
              <article className="stat-card"><div className="stat-top"><span>Amount collected</span><span className="stat-icon collect-icon">↓</span></div><strong>{money(collected)}</strong><div className="stat-foot"><span className="trend positive">↗ 8.2%</span><span>vs last month</span></div><div className="spark spark-blue"><svg viewBox="0 0 100 32" preserveAspectRatio="none"><path d="M0 25 C12 28 14 16 24 21 S37 17 45 18 53 9 62 13 74 7 81 12 91 8 100 3" /></svg></div></article>
              <article className="stat-card"><div className="stat-top"><span>To be collected</span><span className="stat-icon due-icon">◷</span></div><strong>{money(outstanding)}</strong><div className="stat-foot"><span className="due-badge">8 invoices</span><span>awaiting payment</span></div><div className="spark spark-orange"><svg viewBox="0 0 100 32" preserveAspectRatio="none"><path d="M0 8 C12 10 15 5 24 12 S38 14 46 9 56 19 64 16 76 21 83 17 92 26 100 23" /></svg></div></article>
              <article className="stat-card"><div className="stat-top"><span>Total purchases</span><span className="stat-icon purchase-icon">↙</span></div><strong>{money(purchases)}</strong><div className="stat-foot"><span className="trend neutral">↘ 2.4%</span><span>vs last month</span></div><div className="spark spark-purple"><svg viewBox="0 0 100 32" preserveAspectRatio="none"><path d="M0 13 C10 18 17 5 27 12 S37 17 46 12 55 20 65 17 72 24 82 18 91 23 100 19" /></svg></div></article>
            </section>

            <section className="content-grid"><article className="panel cashflow-panel"><div className="panel-heading"><div><h2>Cash flow</h2><p>Money in and out over time</p></div><button className="select-button" onClick={() => setNotice('Cash flow shown for the last 6 months')}>Last 6 months⌄</button></div><div className="chart-legend"><span><i className="legend-in" /> Money in</span><span><i className="legend-out" /> Money out</span></div><CashflowChart /></article><article className="panel breakdown-panel"><div className="panel-heading"><div><h2>At a glance</h2><p>Your business summary</p></div><button className="more-button" aria-label="More summary options" onClick={() => setNotice('Summary options')}>···</button></div><div className="health-ring"><div><strong>78<span>%</span></strong><small>healthy</small></div></div><div className="health-label">Looking good this month <span>↗</span></div><div className="breakdown-row"><span><i className="dot dot-purple" /> Income</span><b>{money(sales)}</b></div><div className="breakdown-row"><span><i className="dot dot-orange" /> Expenses</span><b>{money(purchases)}</b></div><div className="breakdown-row"><span><i className="dot dot-green" /> Net profit</span><b>{money(sales - purchases)}</b></div></article></section>

            <section className="panel activity-panel"><div className="panel-heading activity-heading"><div><h2>{page === 'Overview' ? 'Recent activity' : `${page} activity`}</h2><p>Your latest business transactions</p></div><div className="activity-actions"><button className="filter-button" onClick={() => setNotice('Showing all transaction types')}>☷ <span>Filter</span></button><button className="text-button" onClick={() => setPage('Sales')}>View all <span>→</span></button></div></div><TransactionTable rows={visibleVouchers.slice(0, 5)} /></section>
          </>}
          <footer className="page-footer"><span>Ledgerly <span className="footer-dot">·</span> Your books, in good shape.</span><span>Financial year 2026–27 <span className="footer-dot">·</span> All amounts in INR</span></footer>
        </div>
      </main>

      {dialogOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false) }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-top"><div><span className="modal-kicker">NEW TRANSACTION</span><h2 id="modal-title">Create an entry</h2></div><button className="close-button" aria-label="Close" onClick={() => setDialogOpen(false)}>×</button></div><form onSubmit={addVoucher}><label>Entry type<select value={kind} onChange={(event) => setKind(event.target.value as VoucherKind)}>{(['Sales', 'Purchase', 'Receipt', 'Payment', 'Journal'] as VoucherKind[]).map((item) => <option key={item}>{item}</option>)}</select></label><label>Customer or account<input name="party" placeholder="e.g. Acme Studio" required autoFocus /></label><div className="form-row"><label>Amount (₹)<input name="amount" type="number" min="1" step="0.01" placeholder="0.00" required /></label><label>Date<input name="date" type="date" defaultValue="2026-09-30" required /></label></div><label>Description <span className="optional">OPTIONAL</span><input name="note" placeholder="What is this entry for?" /></label><div className="modal-note"><span>ⓘ</span> This demo saves entries in this browser only. Entries are not sent to a server.</div><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setDialogOpen(false)}>Cancel</button><button type="submit" className="primary-button">Save entry <span>→</span></button></div></form></section></div>}
      {notice && <div className="toast" role="status"><span className="toast-check">✓</span>{notice}</div>}
    </div>
  )
}

function TransactionTable({ rows }: { rows: Voucher[] }) {
  if (!rows.length) return <div className="empty-state"><span>⌕</span><strong>No entries found</strong><p>Try a different search or create a new entry.</p></div>
  return <div className="table-scroll"><table><thead><tr><th>TRANSACTION</th><th>PARTY / ACCOUNT</th><th>DATE</th><th>TYPE</th><th className="amount-cell">AMOUNT</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><div className="transaction-id"><span className={`transaction-mark ${row.kind.toLowerCase()}`}>{row.kind === 'Sales' ? '↗' : row.kind === 'Receipt' ? '↓' : '↙'}</span><span><b>{row.id}</b><small>{row.note || 'No description'}</small></span></div></td><td className="party-cell">{row.party}</td><td className="date-cell">{dateLabel(row.date)}</td><td><span className={`type-pill ${row.kind.toLowerCase()}`}>{row.kind}</span></td><td className={`amount-cell amount-${row.kind === 'Sales' || row.kind === 'Receipt' ? 'in' : 'out'}`}>{row.kind === 'Sales' || row.kind === 'Receipt' ? '+' : '−'}{money(row.amount)}</td><td><button className="row-more" aria-label={`Options for ${row.id}`}>···</button></td></tr>)}</tbody></table></div>
}

function CashflowChart() {
  const bars = [
    { m: 'Apr', a: 72, b: 43 }, { m: 'May', a: 55, b: 36 }, { m: 'Jun', a: 78, b: 48 },
    { m: 'Jul', a: 62, b: 42 }, { m: 'Aug', a: 86, b: 55 }, { m: 'Sep', a: 94, b: 58 },
  ]
  return <div className="chart-area"><div className="chart-y"><span>₹2.0L</span><span>₹1.5L</span><span>₹1.0L</span><span>₹0.5L</span><span>₹0</span></div><div className="chart-plot"><div className="chart-lines"><i /><i /><i /><i /><i /></div><div className="bar-groups">{bars.map((bar) => <div className="bar-group" key={bar.m}><div className="bar-pair"><i className="bar-in" style={{ height: `${bar.a}%` }} /><i className="bar-out" style={{ height: `${bar.b}%` }} /></div><span>{bar.m}</span></div>)}</div></div></div>
}

function Reports({ sales, purchases, outstanding }: { sales: number; purchases: number; outstanding: number }) {
  return <section className="report-view"><div className="report-intro"><div><h2>Your business, at a glance</h2><p>A quick summary for financial year 2026–27.</p></div><button className="outline-button" onClick={() => window.print()}>↧ <span>Export report</span></button></div><div className="report-cards"><article><span>REVENUE</span><strong>{money(sales)}</strong><small className="report-positive">↗ 12.8% vs previous period</small></article><article><span>EXPENSES</span><strong>{money(purchases)}</strong><small>Purchases and operating costs</small></article><article><span>NET PROFIT</span><strong>{money(sales - purchases)}</strong><small className="report-positive">{((sales - purchases) / sales * 100).toFixed(1)}% profit margin</small></article><article><span>RECEIVABLES</span><strong>{money(outstanding)}</strong><small>8 invoices awaiting payment</small></article></div><article className="panel report-table"><div className="panel-heading"><div><h2>Profit & loss</h2><p>Summary for this financial year</p></div><span className="report-period">APR 1, 2026 — MAR 31, 2027</span></div><div className="report-line"><span>Income <small>Sales and services</small></span><b>{money(sales)}</b></div><div className="report-line"><span>Cost of goods & purchases <small>Direct business expenses</small></span><b>− {money(purchases)}</b></div><div className="report-line total"><span>Net profit <small>Income less expenses</small></span><b>{money(sales - purchases)}</b></div><div className="report-line"><span>Accounts receivable <small>Outstanding customer invoices</small></span><b>{money(outstanding)}</b></div></article></section>
}

function Parties({ vouchers }: { vouchers: Voucher[] }) {
  const parties = Array.from(new Set(vouchers.map((item) => item.party)))
  return <section className="panel parties-panel"><div className="panel-heading"><div><h2>Customers & suppliers</h2><p>Your contacts from recent transactions</p></div><span className="party-count">{parties.length} contacts</span></div><div className="parties-list">{parties.map((party, index) => { const items = vouchers.filter((v) => v.party === party); const received = items.filter((v) => v.kind === 'Sales' || v.kind === 'Receipt').reduce((sum, v) => sum + v.amount, 0); return <div className="party-row" key={party}><span className={`party-avatar avatar-${index % 5}`}>{party.slice(0, 1).toUpperCase()}</span><span className="party-name"><b>{party}</b><small>{items.length} transaction{items.length === 1 ? '' : 's'} · Last active {dateLabel(items[0].date)}</small></span><span className="party-total"><small>Sales / receipts</small><b>{money(received)}</b></span><span className="party-chevron">›</span></div> })}</div></section>
}

function CashPanel({ collected, vouchers }: { collected: number; vouchers: Voucher[] }) {
  const payments = vouchers.filter((v) => v.kind === 'Payment').reduce((sum, v) => sum + v.amount, 0) + 48300
  return <section className="cash-view"><div className="report-cards"><article><span>CASH & BANK BALANCE</span><strong>{money(286450 + collected - payments)}</strong><small className="report-positive">Across all accounts</small></article><article><span>MONEY RECEIVED</span><strong>{money(collected)}</strong><small>Customer receipts this period</small></article><article><span>MONEY PAID</span><strong>{money(payments)}</strong><small>Supplier and expense payments</small></article></div><article className="panel account-panel"><div className="panel-heading"><div><h2>Accounts</h2><p>Balances across your cash and bank ledgers</p></div><button className="text-button">Manage accounts →</button></div><div className="account-row"><span className="account-icon bank">▤</span><span><b>HDFC Business Account</b><small>Bank ···· 4921</small></span><strong>{money(214350 + collected - payments)}</strong></div><div className="account-row"><span className="account-icon cash">₹</span><span><b>Cash on hand</b><small>Cash account</small></span><strong>{money(72100)}</strong></div></article></section>
}

export default App
