import {
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Landmark,
  PiggyBank,
  Plus,
  ReceiptText,
  ShieldCheck,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import {
  addTreasuryBill,
  addTreasuryDebt,
  addTreasuryExpense,
  addTreasuryIncome,
  addTreasurySavingsGoal,
  completeTreasuryRecovery,
  deleteTreasuryTransaction,
  finalizeTreasuryWeek,
  getTreasuryDashboard,
  recordBillPayment,
  recordDebtPayment,
  recordSavingsContribution,
  saveTreasuryWeekPlan,
  updateTreasuryChallengeSettings,
} from '@/game/treasury';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';
import type {
  LocalDateKey,
  TreasuryBill,
  TreasuryDebt,
  TreasuryExpenseCategory,
  TreasurySavingsGoal,
  TreasuryTransaction,
} from '@/types/game';

type Tab = 'command' | 'ledger' | 'bills' | 'debt' | 'savings' | 'review';
type DashboardData = Awaited<ReturnType<typeof getTreasuryDashboard>>;

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'command', label: 'Command' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'bills', label: 'Bills' },
  { id: 'debt', label: 'Debt' },
  { id: 'savings', label: 'Savings' },
  { id: 'review', label: 'Weekly' },
];

const EXPENSE_CATEGORIES: Array<{ id: TreasuryExpenseCategory; label: string }> = [
  { id: 'housing', label: 'Housing' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'dining', label: 'Dining out' },
  { id: 'transportation', label: 'Transportation' },
  { id: 'health', label: 'Health' },
  { id: 'personal', label: 'Personal care' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'giving', label: 'Giving' },
  { id: 'other', label: 'Other' },
];

function cents(value: string) {
  const parsed = Number(value.replace(/[$,]/g, ''));
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}

function dollars(value: number, hidden = false) {
  if (hidden) return '$••••';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value / 100);
}

function MoneyInput({
  label,
  value,
  onChange,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      <span>{label}</span>
      <div className="treasury-money-input">
        <span>$</span>
        <input
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function ProgressBar({ value, accent = '#43e6c2' }: { value: number; accent?: string }) {
  return (
    <div className="treasury-progress" aria-label={`${Math.round(value)} percent`}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: accent }} />
    </div>
  );
}

export function TreasuryPage() {
  const {
    systemDate,
    settings,
    treasuryChallenge,
    passTreasuryChallenge,
    failTreasuryChallenge,
    declineTreasuryChallenge,
    refresh,
  } = useGameStore();
  const [tab, setTab] = useState<Tab>('command');
  const [data, setData] = useState<DashboardData>();
  const [hidden, setHidden] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const cassian = getCompanion('cassian');

  const reload = useCallback(async () => {
    if (!settings) return;
    setData(await getTreasuryDashboard(systemDate, settings.weekStartsOn));
  }, [settings, systemDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = useCallback(
    async (action: () => Promise<unknown>) => {
      setBusy(true);
      setError(undefined);
      try {
        await action();
        await Promise.all([reload(), refresh()]);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : 'The Treasury could not save that entry.',
        );
      } finally {
        setBusy(false);
      }
    },
    [refresh, reload],
  );

  if (!data || !settings) {
    return (
      <div className="page">
        <section className="panel treasury-loading">Opening the encrypted ledger…</section>
      </div>
    );
  }

  const activeChallenge =
    data.challenges.find((item) => item.date === systemDate) ?? treasuryChallenge;

  return (
    <div className={`page treasury-page ${hidden ? 'is-masked' : ''}`}>
      <section
        className="treasury-hero panel"
        style={{ '--companion-accent': cassian.accent } as React.CSSProperties}
      >
        <div className="treasury-hero__portrait">
          <img src={getCompanionImage(cassian.image)} alt="Cassian, The Steward" />
          <span>
            <ShieldCheck size={14} /> LOCAL VAULT
          </span>
        </div>
        <div className="treasury-hero__copy">
          <p className="eyebrow">CASSIAN · THE STEWARD · TREASURY COMMAND</p>
          <h1>Give every resource a purpose.</h1>
          <p>
            Track paychecks, spending, bills, debt, and savings without linking a bank. Cassian
            helps you review the truth, protect the future, and recover without shame.
          </p>
          <div className="treasury-hero__actions">
            <button className="button button--ghost" onClick={() => setHidden((value) => !value)}>
              {hidden ? <Eye size={16} /> : <EyeOff size={16} />}{' '}
              {hidden ? 'Reveal amounts' : 'Hide amounts'}
            </button>
            <Link className="button button--ghost" to="/campaigns">
              <Landmark size={16} /> Cassian questline
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="treasury-error" role="alert">
          {error}
        </div>
      )}

      <nav className="treasury-tabs" aria-label="Treasury sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? 'is-active' : ''}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === 'command' && (
        <CommandTab
          data={data}
          hidden={hidden}
          challenge={activeChallenge}
          busy={busy}
          act={act}
          pass={passTreasuryChallenge}
          fail={failTreasuryChallenge}
          decline={declineTreasuryChallenge}
        />
      )}
      {tab === 'ledger' && (
        <LedgerTab
          date={systemDate}
          transactions={data.transactions}
          hidden={hidden}
          busy={busy}
          act={act}
        />
      )}
      {tab === 'bills' && (
        <BillsTab date={systemDate} bills={data.bills} hidden={hidden} busy={busy} act={act} />
      )}
      {tab === 'debt' && (
        <DebtTab date={systemDate} debts={data.debts} hidden={hidden} busy={busy} act={act} />
      )}
      {tab === 'savings' && (
        <SavingsTab
          date={systemDate}
          goals={data.savingsGoals}
          hidden={hidden}
          busy={busy}
          act={act}
        />
      )}
      {tab === 'review' && (
        <ReviewTab
          data={data}
          weekStartsOn={settings.weekStartsOn}
          hidden={hidden}
          busy={busy}
          act={act}
        />
      )}

      <footer className="treasury-privacy panel">
        <ShieldCheck size={18} />
        <p>
          <strong>Private by design.</strong> Treasury data stays in this app on this device and is
          included in Archive Shield exports. No bank connection, financial institution, or cloud
          account is used. This is a personal planning tool, not financial advice.
        </p>
      </footer>
    </div>
  );
}

function CommandTab({
  data,
  hidden,
  challenge,
  busy,
  act,
  pass,
  fail,
  decline,
}: {
  data: DashboardData;
  hidden: boolean;
  challenge?: DashboardData['challenges'][number];
  busy: boolean;
  act: (action: () => Promise<unknown>) => Promise<void>;
  pass: () => Promise<void>;
  fail: () => Promise<void>;
  decline: () => Promise<void>;
}) {
  const { summary } = data;
  const totalDebt = data.debts
    .filter((item) => item.active)
    .reduce((sum, item) => sum + item.balanceCents, 0);
  const saved = data.savingsGoals.reduce((sum, item) => sum + item.currentCents, 0);
  const stabilityAccent =
    summary.stabilityScore >= 80 ? '#43e6c2' : summary.stabilityScore >= 60 ? '#f4c95d' : '#ff795f';
  return (
    <div className="treasury-stack">
      <section className="treasury-summary-grid">
        <article className="panel">
          <span>Budget Stability</span>
          <strong style={{ color: stabilityAccent }}>{summary.stabilityScore}</strong>
          <ProgressBar value={summary.stabilityScore} accent={stabilityAccent} />
          <small>Weekly signal, never account XP</small>
        </article>
        <article className="panel">
          <span>Income this week</span>
          <strong>{dollars(summary.incomeCents, hidden)}</strong>
          <small>Logged paychecks and income</small>
        </article>
        <article className="panel">
          <span>Spent this week</span>
          <strong>{dollars(summary.expenseCents, hidden)}</strong>
          <small>{dollars(summary.diningCents, hidden)} dining</small>
        </article>
        <article className="panel">
          <span>Future directed</span>
          <strong>{dollars(summary.debtPaidCents + summary.savingsCents, hidden)}</strong>
          <small>
            {dollars(totalDebt, hidden)} debt · {dollars(saved, hidden)} saved
          </small>
        </article>
      </section>

      <ChallengeCard
        challenge={challenge}
        busy={busy}
        act={act}
        pass={pass}
        fail={fail}
        decline={decline}
      />

      <section className="panel treasury-command-map">
        <div className="treasury-section-heading">
          <div>
            <p className="eyebrow">THIS WEEK</p>
            <h2>Command map</h2>
          </div>
          <span>
            {data.week.weekStart} — {data.week.weekEnd}
          </span>
        </div>
        <div className="treasury-command-map__grid">
          <div>
            <span>Spending limit</span>
            <strong>
              {data.week.spendingLimitCents
                ? dollars(data.week.spendingLimitCents, hidden)
                : 'Not set'}
            </strong>
          </div>
          <div>
            <span>Dining limit</span>
            <strong>
              {data.week.diningLimitCents ? dollars(data.week.diningLimitCents, hidden) : 'Not set'}
            </strong>
          </div>
          <div>
            <span>Savings target</span>
            <strong>
              {data.week.savingsTargetCents
                ? dollars(data.week.savingsTargetCents, hidden)
                : 'Not set'}
            </strong>
          </div>
          <div>
            <span>Debt target</span>
            <strong>
              {data.week.debtTargetCents ? dollars(data.week.debtTargetCents, hidden) : 'Not set'}
            </strong>
          </div>
        </div>
        <p className="treasury-cassian-line">
          “
          {data.week.cassianMessage ??
            'Clarity first. We are not restricting a life; we are protecting what that life is trying to become.'}
          ”
        </p>
      </section>
    </div>
  );
}

function ChallengeCard({
  challenge,
  busy,
  act,
  pass,
  fail,
  decline,
}: {
  challenge?: DashboardData['challenges'][number];
  busy: boolean;
  act: (action: () => Promise<unknown>) => Promise<void>;
  pass: () => Promise<void>;
  fail: () => Promise<void>;
  decline: () => Promise<void>;
}) {
  const [recovery, setRecovery] = useState(challenge?.recoveryPlan ?? '');
  if (!challenge)
    return (
      <section className="panel treasury-challenge-card is-quiet">
        <UtensilsCrossed size={25} />
        <div>
          <p className="eyebrow">DAILY CHALLENGE ROLL</p>
          <h2>No directive today.</h2>
          <p>
            The 75% roll did not activate. The kitchen line is still available as a voluntary
            choice.
          </p>
        </div>
      </section>
    );
  return (
    <section className={`panel treasury-challenge-card is-${challenge.status}`}>
      <UtensilsCrossed size={27} />
      <div>
        <p className="eyebrow">CASSIAN DIRECTIVE · NO EATING OUT</p>
        <h2>
          {challenge.status === 'active'
            ? 'Hold the kitchen line today.'
            : challenge.status === 'passed'
              ? 'Directive cleared.'
              : challenge.status === 'failed'
                ? 'Honest result recorded.'
                : challenge.status === 'declined'
                  ? 'Directive declined.'
                  : 'Directive expired.'}
        </h2>
        <p>
          {challenge.status === 'active'
            ? `Make or use food already available. Clear it for +${challenge.rewardXp} XP and Stewardship progress.`
            : challenge.status === 'passed'
              ? `You protected the plan and earned +${challenge.rewardXp} XP.`
              : challenge.status === 'failed'
                ? 'No account XP was removed. Complete a short recovery plan to rebuild half of the Budget Stability penalty.'
                : challenge.status === 'declined'
                  ? 'No reward and no penalty. Optional means optional; another day can carry another opportunity.'
                  : 'No account XP was removed. Return to the next clear choice.'}
        </p>
        {challenge.status === 'active' && (
          <div className="treasury-inline-actions">
            <button
              className="button button--primary"
              disabled={busy}
              onClick={() => void act(pass)}
            >
              <Check size={16} /> I did not eat out
            </button>
            <button className="button button--ghost" disabled={busy} onClick={() => void act(fail)}>
              I ordered out
            </button>
            <button
              className="button button--ghost"
              disabled={busy}
              onClick={() => void act(decline)}
            >
              Decline challenge
            </button>
          </div>
        )}
        {challenge.status === 'failed' && !challenge.recoveryCompletedAt && (
          <form
            className="treasury-recovery"
            onSubmit={(event) => {
              event.preventDefault();
              void act(() => completeTreasuryRecovery(challenge.date, recovery));
            }}
          >
            <label>
              <span>Recovery plan</span>
              <textarea
                value={recovery}
                onChange={(event) => setRecovery(event.target.value)}
                placeholder="What made ordering easier, and what will be ready next time?"
                required
              />
            </label>
            <button className="button button--primary" disabled={busy}>
              Complete debrief
            </button>
          </form>
        )}
        {challenge.recoveryCompletedAt && (
          <small className="treasury-recovered">
            <ShieldCheck size={14} /> Recovery protocol complete · 5 Stability restored
          </small>
        )}
      </div>
    </section>
  );
}

function LedgerTab({
  date,
  transactions,
  hidden,
  busy,
  act,
}: {
  date: LocalDateKey;
  transactions: TreasuryTransaction[];
  hidden: boolean;
  busy: boolean;
  act: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const [mode, setMode] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<TreasuryExpenseCategory>('groceries');
  const [isEatingOut, setEatingOut] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const action =
      mode === 'income'
        ? addTreasuryIncome({ date, amountCents: cents(amount), source: label })
        : addTreasuryExpense({ date, amountCents: cents(amount), label, category, isEatingOut });
    void act(async () => {
      await action;
      setAmount('');
      setLabel('');
      setEatingOut(false);
    });
  };
  return (
    <div className="treasury-two-column">
      <form className="panel treasury-form" onSubmit={submit}>
        <div className="treasury-section-heading">
          <div>
            <p className="eyebrow">NEW ENTRY</p>
            <h2>{mode === 'expense' ? 'Log spending' : 'Log income'}</h2>
          </div>
        </div>
        <div className="treasury-toggle">
          <button
            type="button"
            className={mode === 'expense' ? 'is-active' : ''}
            onClick={() => setMode('expense')}
          >
            <ArrowUpCircle size={16} /> Expense
          </button>
          <button
            type="button"
            className={mode === 'income' ? 'is-active' : ''}
            onClick={() => setMode('income')}
          >
            <ArrowDownCircle size={16} /> Income
          </button>
        </div>
        <MoneyInput label="Amount" value={amount} onChange={setAmount} />
        <label>
          <span>{mode === 'expense' ? 'What was it?' : 'Income source'}</span>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            required
            placeholder={mode === 'expense' ? 'Groceries' : 'Paycheck'}
          />
        </label>
        {mode === 'expense' && (
          <>
            <label>
              <span>Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as TreasuryExpenseCategory)}
              >
                {EXPENSE_CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="treasury-check">
              <input
                type="checkbox"
                checked={isEatingOut}
                onChange={(event) => setEatingOut(event.target.checked)}
              />
              <span>This was eating out or delivery</span>
            </label>
          </>
        )}
        <button className="button button--primary" disabled={busy}>
          <Plus size={16} /> Add to ledger
        </button>
      </form>
      <section className="panel treasury-list-panel">
        <div className="treasury-section-heading">
          <div>
            <p className="eyebrow">ENCRYPTED LEDGER</p>
            <h2>Recent activity</h2>
          </div>
          <span>{transactions.length} entries</span>
        </div>
        <div className="treasury-record-list">
          {transactions.length ? (
            transactions.map((item) => (
              <article key={item.id}>
                <span className={`treasury-record-icon is-${item.kind}`}>
                  {item.kind === 'income' ? (
                    <ArrowDownCircle size={18} />
                  ) : item.kind === 'savings' ? (
                    <PiggyBank size={18} />
                  ) : item.kind === 'debt-payment' ? (
                    <CreditCard size={18} />
                  ) : (
                    <ReceiptText size={18} />
                  )}
                </span>
                <div>
                  <strong>{item.label}</strong>
                  <small>
                    {item.date} · {item.kind.replaceAll('-', ' ')}
                    {item.isEatingOut ? ' · eating out' : ''}
                  </small>
                </div>
                <b>
                  {item.kind === 'income' ? '+' : '−'}
                  {dollars(item.amountCents, hidden)}
                </b>
                <button
                  aria-label={`Delete ${item.label}`}
                  disabled={busy}
                  onClick={() => void act(() => deleteTreasuryTransaction(item.id))}
                >
                  <Trash2 size={15} />
                </button>
              </article>
            ))
          ) : (
            <div className="treasury-empty">No entries yet. Start with one honest number.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function BillsTab({
  date,
  bills,
  hidden,
  busy,
  act,
}: {
  date: LocalDateKey;
  bills: TreasuryBill[];
  hidden: boolean;
  busy: boolean;
  act: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [cadence, setCadence] = useState<TreasuryBill['cadence']>('monthly');
  const [autopay, setAutopay] = useState(false);
  return (
    <div className="treasury-two-column">
      <form
        className="panel treasury-form"
        onSubmit={(event) => {
          event.preventDefault();
          void act(async () => {
            await addTreasuryBill({
              name,
              amountCents: cents(amount),
              dueDay: Number(dueDay),
              cadence,
              autopay,
            });
            setName('');
            setAmount('');
          });
        }}
      >
        <p className="eyebrow">RECURRING OBLIGATIONS</p>
        <h2>Add a bill</h2>
        <label>
          <span>Bill name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Phone"
          />
        </label>
        <MoneyInput label="Expected amount" value={amount} onChange={setAmount} />
        <label>
          <span>Due day</span>
          <input
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(event) => setDueDay(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Frequency</span>
          <select
            value={cadence}
            onChange={(event) => setCadence(event.target.value as TreasuryBill['cadence'])}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="one-time">One time</option>
          </select>
        </label>
        <label className="treasury-check">
          <input
            type="checkbox"
            checked={autopay}
            onChange={(event) => setAutopay(event.target.checked)}
          />
          <span>Autopay is enabled</span>
        </label>
        <button className="button button--primary" disabled={busy}>
          <Plus size={16} /> Add bill
        </button>
      </form>
      <section className="panel treasury-list-panel">
        <p className="eyebrow">BILL WATCH</p>
        <h2>Protected essentials</h2>
        <div className="treasury-card-list">
          {bills.length ? (
            bills.map((bill) => (
              <article key={bill.id}>
                <div className="treasury-card-list__icon">
                  <ReceiptText size={20} />
                </div>
                <div>
                  <strong>{bill.name}</strong>
                  <span>{dollars(bill.amountCents, hidden)}</span>
                  <small>
                    Due day {bill.dueDay} · {bill.cadence}
                    {bill.autopay ? ' · Autopay' : ''}
                  </small>
                </div>
                <button
                  className="button button--ghost"
                  disabled={busy}
                  onClick={() => void act(() => recordBillPayment({ billId: bill.id, date }))}
                >
                  Mark paid
                </button>
              </article>
            ))
          ) : (
            <div className="treasury-empty">No bills listed yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function DebtTab({
  date,
  debts,
  hidden,
  busy,
  act,
}: {
  date: LocalDateKey;
  debts: TreasuryDebt[];
  hidden: boolean;
  busy: boolean;
  act: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [minimum, setMinimum] = useState('');
  const [kind, setKind] = useState<TreasuryDebt['kind']>('credit-card');
  const [payments, setPayments] = useState<Record<string, string>>({});
  return (
    <div className="treasury-two-column">
      <form
        className="panel treasury-form"
        onSubmit={(event) => {
          event.preventDefault();
          void act(async () => {
            await addTreasuryDebt({
              name,
              kind,
              balanceCents: cents(balance),
              aprBasisPoints: apr ? Math.round(Number(apr) * 100) : undefined,
              minimumPaymentCents: minimum ? cents(minimum) : undefined,
            });
            setName('');
            setBalance('');
            setApr('');
            setMinimum('');
          });
        }}
      >
        <p className="eyebrow">DEBT COMMAND</p>
        <h2>Log an account</h2>
        <label>
          <span>Account name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Main credit card"
          />
        </label>
        <label>
          <span>Type</span>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as TreasuryDebt['kind'])}
          >
            <option value="credit-card">Credit card</option>
            <option value="personal-loan">Personal loan</option>
            <option value="student-loan">Student loan</option>
            <option value="medical">Medical</option>
            <option value="other">Other</option>
          </select>
        </label>
        <MoneyInput label="Current balance" value={balance} onChange={setBalance} />
        <label>
          <span>APR % (optional)</span>
          <input
            inputMode="decimal"
            value={apr}
            onChange={(event) => setApr(event.target.value)}
            placeholder="24.99"
          />
        </label>
        <MoneyInput
          label="Minimum payment (optional)"
          value={minimum}
          onChange={setMinimum}
          required={false}
        />
        <button className="button button--primary" disabled={busy}>
          <Plus size={16} /> Add debt
        </button>
      </form>
      <section className="panel treasury-list-panel">
        <p className="eyebrow">BALANCE REDUCTION</p>
        <h2>Debt accounts</h2>
        <div className="treasury-card-list">
          {debts.length ? (
            debts.map((debt) => (
              <article key={debt.id}>
                <div className="treasury-card-list__icon">
                  <CreditCard size={20} />
                </div>
                <div>
                  <strong>{debt.name}</strong>
                  <span>{dollars(debt.balanceCents, hidden)}</span>
                  <small>
                    {debt.kind.replaceAll('-', ' ')}
                    {debt.aprBasisPoints !== undefined
                      ? ` · ${(debt.aprBasisPoints / 100).toFixed(2)}% APR`
                      : ''}
                  </small>
                  <div className="treasury-quick-payment">
                    <div className="treasury-money-input">
                      <span>$</span>
                      <input
                        inputMode="decimal"
                        placeholder="Payment"
                        value={payments[debt.id] ?? ''}
                        onChange={(event) =>
                          setPayments({ ...payments, [debt.id]: event.target.value })
                        }
                      />
                    </div>
                    <button
                      className="button button--ghost"
                      disabled={busy || !payments[debt.id]}
                      onClick={() =>
                        void act(async () => {
                          await recordDebtPayment({
                            debtId: debt.id,
                            date,
                            amountCents: cents(payments[debt.id] ?? ''),
                          });
                          setPayments({ ...payments, [debt.id]: '' });
                        })
                      }
                    >
                      Record
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="treasury-empty">
              No debt accounts listed. If you have none, keep building your reserve.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SavingsTab({
  date,
  goals,
  hidden,
  busy,
  act,
}: {
  date: LocalDateKey;
  goals: TreasurySavingsGoal[];
  hidden: boolean;
  busy: boolean;
  act: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [contributions, setContributions] = useState<Record<string, string>>({});
  return (
    <div className="treasury-two-column">
      <form
        className="panel treasury-form"
        onSubmit={(event) => {
          event.preventDefault();
          void act(async () => {
            await addTreasurySavingsGoal({
              name,
              targetCents: cents(target),
              currentCents: cents(current),
            });
            setName('');
            setTarget('');
            setCurrent('');
          });
        }}
      >
        <p className="eyebrow">RESERVE PROTOCOL</p>
        <h2>Create a savings goal</h2>
        <label>
          <span>Goal name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Emergency fund"
          />
        </label>
        <MoneyInput label="Target" value={target} onChange={setTarget} />
        <MoneyInput
          label="Already saved (optional)"
          value={current}
          onChange={setCurrent}
          required={false}
        />
        <button className="button button--primary" disabled={busy}>
          <Plus size={16} /> Create goal
        </button>
      </form>
      <section className="panel treasury-list-panel">
        <p className="eyebrow">FUTURE SHIELDS</p>
        <h2>Savings goals</h2>
        <div className="treasury-card-list">
          {goals.length ? (
            goals.map((goal) => {
              const percent = goal.targetCents ? (goal.currentCents / goal.targetCents) * 100 : 0;
              return (
                <article key={goal.id}>
                  <div className="treasury-card-list__icon">
                    <PiggyBank size={20} />
                  </div>
                  <div>
                    <strong>{goal.name}</strong>
                    <span>
                      {dollars(goal.currentCents, hidden)} / {dollars(goal.targetCents, hidden)}
                    </span>
                    <ProgressBar value={percent} />
                    <small>{Math.min(100, Math.round(percent))}% funded</small>
                    <div className="treasury-quick-payment">
                      <div className="treasury-money-input">
                        <span>$</span>
                        <input
                          inputMode="decimal"
                          placeholder="Contribution"
                          value={contributions[goal.id] ?? ''}
                          onChange={(event) =>
                            setContributions({ ...contributions, [goal.id]: event.target.value })
                          }
                        />
                      </div>
                      <button
                        className="button button--ghost"
                        disabled={busy || !contributions[goal.id]}
                        onClick={() =>
                          void act(async () => {
                            await recordSavingsContribution({
                              goalId: goal.id,
                              date,
                              amountCents: cents(contributions[goal.id] ?? ''),
                            });
                            setContributions({ ...contributions, [goal.id]: '' });
                          })
                        }
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="treasury-empty">
              No savings goals yet. Name the first shield you want to build.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ReviewTab({
  data,
  weekStartsOn,
  hidden,
  busy,
  act,
}: {
  data: DashboardData;
  weekStartsOn: number;
  hidden: boolean;
  busy: boolean;
  act: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const [limit, setLimit] = useState(
    data.week.spendingLimitCents ? String(data.week.spendingLimitCents / 100) : '',
  );
  const [dining, setDining] = useState(
    data.week.diningLimitCents ? String(data.week.diningLimitCents / 100) : '',
  );
  const [savings, setSavings] = useState(
    data.week.savingsTargetCents ? String(data.week.savingsTargetCents / 100) : '',
  );
  const [debt, setDebt] = useState(
    data.week.debtTargetCents ? String(data.week.debtTargetCents / 100) : '',
  );
  const [intention, setIntention] = useState(data.week.intention ?? '');
  const [reflection, setReflection] = useState(data.week.reflection ?? '');
  const [enabled, setEnabled] = useState(data.settings.challengeEnabled);
  const summary = data.summary;
  const save = () =>
    saveTreasuryWeekPlan(data.week.weekStart, weekStartsOn, {
      spendingLimitCents: cents(limit),
      diningLimitCents: cents(dining),
      savingsTargetCents: cents(savings),
      debtTargetCents: cents(debt),
      intention,
    });
  return (
    <div className="treasury-two-column">
      <form
        className="panel treasury-form"
        onSubmit={(event) => {
          event.preventDefault();
          void act(save);
        }}
      >
        <p className="eyebrow">WEEKLY COMMAND MAP</p>
        <h2>Set realistic limits</h2>
        <MoneyInput
          label="Total spending limit"
          value={limit}
          onChange={setLimit}
          required={false}
        />
        <MoneyInput label="Dining out limit" value={dining} onChange={setDining} required={false} />
        <MoneyInput label="Savings target" value={savings} onChange={setSavings} required={false} />
        <MoneyInput label="Debt payment target" value={debt} onChange={setDebt} required={false} />
        <label>
          <span>One intention for the week</span>
          <textarea
            value={intention}
            onChange={(event) => setIntention(event.target.value)}
            placeholder="Prepare two easy dinners before the busy days."
          />
        </label>
        <button className="button button--primary" disabled={busy}>
          Save weekly plan
        </button>
        <div className="treasury-chance-setting">
          <div>
            <strong>No Eating Out directives</strong>
            <small>Currently a 75% daily chance</small>
          </div>
          <button
            type="button"
            className={enabled ? 'is-on' : ''}
            onClick={() => {
              const next = !enabled;
              setEnabled(next);
              void act(() => updateTreasuryChallengeSettings({ enabled: next, chance: 0.75 }));
            }}
          >
            {enabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </form>
      <section className="panel treasury-review-panel">
        <p className="eyebrow">WEEKLY REVIEW · +90 XP</p>
        <h2>{data.week.status === 'reviewed' ? 'Review complete' : 'Close the ledger honestly'}</h2>
        <div className="treasury-review-stats">
          <div>
            <span>Stability</span>
            <strong>{summary.stabilityScore}</strong>
          </div>
          <div>
            <span>Income</span>
            <strong>{dollars(summary.incomeCents, hidden)}</strong>
          </div>
          <div>
            <span>Spent</span>
            <strong>{dollars(summary.expenseCents, hidden)}</strong>
          </div>
          <div>
            <span>Dining</span>
            <strong>{dollars(summary.diningCents, hidden)}</strong>
          </div>
          <div>
            <span>Bills</span>
            <strong>
              {summary.billsPaid}/{summary.billsDue}
            </strong>
          </div>
          <div>
            <span>Challenges</span>
            <strong>{summary.noEatingOutWins} won</strong>
          </div>
        </div>
        {data.week.cassianMessage && <blockquote>“{data.week.cassianMessage}”</blockquote>}
        {data.week.status !== 'reviewed' ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void act(async () => {
                await save();
                await finalizeTreasuryWeek(data.week.weekStart, reflection);
              });
            }}
          >
            <label>
              <span>What worked, what leaked, and what will change?</span>
              <textarea
                required
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                placeholder="I spent less when dinner was already planned…"
              />
            </label>
            <button className="button button--primary" disabled={busy}>
              <ShieldCheck size={16} /> Finalize weekly review
            </button>
          </form>
        ) : (
          <div className="treasury-review-complete">
            <Check size={18} /> Review archived · XP and Stewardship awarded once
          </div>
        )}
      </section>
    </div>
  );
}
