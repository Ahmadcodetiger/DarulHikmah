import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { CreditCard, Plus, HelpCircle, Check, DollarSign, Wallet } from 'lucide-react';
import { Unauthorized } from '../components/Unauthorized';
import { FINANCE_VIEW_ROLES, FINANCE_CREATE_ROLES, hasRole } from '../lib/permissions';

interface FinanceProps {
  user: any;
}

export const Finance = ({ user }: FinanceProps) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Invoice creation form states
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [category, setCategory] = useState('Tuition Fee');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [message, setMessage] = useState('');

  const canViewFinance = hasRole(user?.role, FINANCE_VIEW_ROLES);
  const canCreateInvoice = hasRole(user?.role, FINANCE_CREATE_ROLES);
  const isParent = user?.role === 'PARENT';

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const list = await api.finance.listInvoices(isParent ? 'std-1' : undefined);
      setInvoices(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    if (canCreateInvoice) {
      const loadStudents = async () => {
        const classList = await api.classes.list();
        if (classList.length > 0) {
          const list = await api.classes.getStudents(classList[0].id);
          setStudents(list);
          if (list.length > 0) setSelectedStudent(list[0].id);
        }
      };
      loadStudents();
    }
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amount || !dueDate) return;
    setSavingInvoice(true);
    setMessage('');

    try {
      // Create invoice in backend/mock database
      const savedInvoices = JSON.parse(localStorage.getItem('dh_invoices') || '[]');
      const newInvoice = {
        id: `inv-${Date.now()}`,
        studentId: selectedStudent,
        category,
        amount: parseFloat(amount),
        amountPaid: 0,
        dueDate,
        status: 'UNPAID',
        createdAt: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('dh_invoices', JSON.stringify([...savedInvoices, newInvoice]));
      
      setMessage('Invoice created successfully!');
      setAmount('');
      setDueDate('');
      fetchInvoices();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingInvoice(false);
    }
  };

  const handlePayOnline = async (invoiceId: string) => {
    if (!isParent) return;
    try {
      const email = user?.email || 'parent@darulhikmah.edu.ng';
      const response = await api.finance.initializePayment(invoiceId, email);
      if (response.data?.authorization_url) {
        // Redirect to Paystack checkouts (or mock redirect)
        window.location.href = response.data.authorization_url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initialize payment gateway.');
    }
  };

  if (!canViewFinance) {
    return <Unauthorized pageName="Finance" />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Finance Overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-full bg-emerald-500/10 rounded-l-full blur-xl pointer-events-none"></div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Outstanding Fees</p>
          <h2 className="text-3xl font-black mt-2">
            ₦{invoices.reduce((acc, curr) => acc + (curr.status !== 'PAID' ? (curr.amount - curr.amountPaid) : 0), 0).toLocaleString()}
          </h2>
          <span className="text-[11px] text-emerald-400 font-semibold mt-2 block">Darul Hikmah Science & Tech</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid Invoices</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {invoices.filter(i => i.status === 'PAID').length}
            </h3>
            <span className="text-emerald-500 text-xs font-semibold block mt-1.5">Cleared balances</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending/Partial</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {invoices.filter(i => i.status !== 'PAID').length}
            </h3>
            <span className="text-rose-500 text-xs font-semibold block mt-1.5">Action required</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Invoice listings */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" /> Fee Invoices
            </h2>
            <button onClick={fetchInvoices} className="text-xs font-bold text-emerald-600 hover:text-emerald-500 cursor-pointer">
              Refresh Accounts
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <span className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin"></span>
              <p className="text-xs font-semibold uppercase tracking-wider">Syncing ledger records...</p>
            </div>
          ) : invoices.length > 0 ? (
            <div className="divide-y divide-slate-150">
              {invoices.map((inv) => {
                const balance = inv.amount - inv.amountPaid;
                return (
                  <div key={inv.id} className="py-4.5 flex justify-between items-center flex-wrap gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/30 px-2 rounded-xl transition-all duration-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{inv.category}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' :
                          inv.status === 'PARTIAL' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold">
                        Student: <span className="text-slate-600 font-bold">{inv.student?.firstName} {inv.student?.lastName}</span> ({inv.student?.admissionNo || 'std-1'})
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">Due Date: {inv.dueDate}</p>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="text-slate-800 font-bold text-sm">
                        ₦{inv.amount.toLocaleString()} 
                        {balance > 0 && <span className="block text-[10px] text-slate-400 font-medium">Bal: ₦{balance.toLocaleString()}</span>}
                      </div>

                      {/* Payment Action buttons */}
                      {isParent && balance > 0 && (
                        <button
                          onClick={() => handlePayOnline(inv.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Pay with Paystack
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              No bills found in your school accounts.
            </div>
          )}
        </div>

        {/* Right column: Invoice Generator (Accountant view) or Instructions (Parent view) */}
        {canCreateInvoice ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-850 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> Create Fee Invoice
            </h3>

            {message && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
                <Check className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50 text-slate-700 font-medium"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.lastName}, {s.firstName} ({s.admissionNo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50 text-slate-700 font-medium"
                >
                  <option value="Tuition Fee">Tuition Fee</option>
                  <option value="Bus Fee">Bus Fee</option>
                  <option value="Book / Stationeries">Book / Stationeries</option>
                  <option value="Islamic Section Uniform">Islamic Section Uniform</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Amount (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm text-slate-855"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50 text-slate-700 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={savingInvoice || !selectedStudent}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer mt-4"
              >
                {savingInvoice ? 'Saving...' : 'Generate Invoice'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-24 h-full bg-emerald-500/10 rounded-l-full blur-xl pointer-events-none"></div>
            
            <h3 className="text-base font-extrabold tracking-wide flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" /> Payment Policy Guidelines
            </h3>

            <div className="space-y-4 text-xs leading-relaxed text-slate-350">
              <p>1. Tuition and book fees must be settled in full before the end of the 4th week of the academic term.</p>
              <p>2. Bus routes are automatically suspended for pupils with outstanding transportation balances.</p>
              <p>3. Online payments via Paystack are verified instantly, and official digital receipts are updated on your portal under invoice records.</p>
            </div>
            
            <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Finance Office, Darul Hikmah Academy
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
