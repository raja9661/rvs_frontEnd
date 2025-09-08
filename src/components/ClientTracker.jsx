import React, { useEffect, useMemo, useState } from 'react';
import Layout from './Layout/Layout';

const API_BASE = import.meta.env.VITE_Backend_Base_URL || '';

function num3(n) {
  if (n === null || n === undefined) return '0.000';
  return Number(n).toFixed(3);
}

export default function ClientTracker() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalGroups, setTotalGroups] = useState(0);

  const [filters, setFilters] = useState({ year: '', month: '', clientCode: '', userId: '' });

  const [viewOpen, setViewOpen] = useState(false);
  const [viewCtx, setViewCtx] = useState({ userId: '', clientCode: '' });
  const [cases, setCases] = useState([]);
  const [casesPage, setCasesPage] = useState(1);
  const [casesTotal, setCasesTotal] = useState(0);
  const [casesLoading, setCasesLoading] = useState(false);

  const totalPages = useMemo(() => Math.ceil((totalGroups || 0) / limit), [totalGroups, limit]);

  async function fetchSummary(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await fetch(`${API_BASE}/mapping/summary?${params.toString()}`);
      const json = await res.json();
      setData(json.data || []);
      setTotalGroups(json.totalGroups || 0);
      setPage(json.page || p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCases(p = 1, ctx = viewCtx) {
    setCasesLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50', userId: ctx.userId });
      if (ctx.clientCode) params.append('clientCode', ctx.clientCode);
      const res = await fetch(`${API_BASE}/mapping/cases?${params.toString()}`);
      const json = await res.json();
      setCases(json.items || []);
      setCasesTotal(json.total || 0);
      setCasesPage(json.page || p);
    } catch (e) {
      console.error(e);
    } finally {
      setCasesLoading(false);
    }
  }

  useEffect(() => { fetchSummary(); }, [limit]);

  function onDownload(row) {
    const params = new URLSearchParams({ userId: row.userId });
    if (row.clientCode) params.append('clientCode', row.clientCode);
    const url = `${API_BASE}/mapping/download?${params.toString()}`;
    window.open(url, '_blank');
  }

  function onView(row) {
    setViewCtx({ userId: row.userId, clientCode: row.clientCode });
    setViewOpen(true);
    fetchCases(1, { userId: row.userId, clientCode: row.clientCode });
  }

  return (
    <Layout>
    <div className="p-4 md:p-8 space-y-6">
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Client-wise Completion Tracker</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <input className="border rounded p-2" placeholder="Year" value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} />
          <input className="border rounded p-2" placeholder="Month" value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))} />
          <input className="border rounded p-2" placeholder="Client Code" value={filters.clientCode} onChange={e => setFilters(f => ({ ...f, clientCode: e.target.value }))} />
          <input className="border rounded p-2" placeholder="User ID" value={filters.userId} onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))} />
          <button onClick={() => fetchSummary(1)} disabled={loading} className="bg-blue-600 text-white rounded px-4 py-2">
            {loading ? 'Loading...' : 'Apply'}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">User ID</th>
                <th className="px-3 py-2 text-left">Client Code</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Total Closed</th>
                <th className="px-3 py-2 text-right">Completion %</th>
                <th className="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{row.userId}</td>
                  <td className="px-3 py-2">{row.clientCode}</td>
                  <td className="px-3 py-2 text-right">{row.total}</td>
                  <td className="px-3 py-2 text-right">{row.totalClosed}</td>
                  <td className="px-3 py-2 text-right font-semibold">{num3(row.completionRate)}</td>
                  <td className="px-3 py-2 text-center space-x-2">
                    <button onClick={() => onView(row)} className="px-2 py-1 border rounded hover:bg-gray-100">View</button>
                    <button onClick={() => onDownload(row)} className="px-2 py-1 bg-green-600 text-white rounded">Download</button>
                  </td>
                </tr>
              ))}
              {(!loading && data.length === 0) && (
                <tr><td colSpan={6} className="text-center py-4 text-gray-500">No records</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-600">Page {page} of {Math.max(totalPages, 1)}</span>
          <div className="space-x-2">
            <button disabled={page <= 1} onClick={() => fetchSummary(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => fetchSummary(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-4 relative">
            <button onClick={() => setViewOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
            <h3 className="text-lg font-semibold mb-4">Cases for {viewCtx.userId} {viewCtx.clientCode && `(${viewCtx.clientCode})`}</h3>

            <div className="overflow-x-auto max-h-[60vh] border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Case ID</th>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-left">Correct UPN</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Case Status</th>
                    <th className="px-3 py-2 text-left">List of Employee</th>
                    <th className="px-3 py-2 text-left">Vendor Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">{c.caseId}</td>
                      <td className="px-3 py-2">{c.updatedProductName || c.product}</td>
                      <td className="px-3 py-2">{c.correctUPN}</td>
                      <td className="px-3 py-2">{c.status}</td>
                      <td className="px-3 py-2">{c.caseStatus}</td>
                      <td className="px-3 py-2">{c.listByEmployee}</td>
                      <td className="px-3 py-2">{c.vendorStatus}</td>
                    </tr>
                  ))}
                  {(!casesLoading && cases.length === 0) && (
                    <tr><td colSpan={7} className="text-center py-4 text-gray-500">No cases</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-2 mt-3">
              <button disabled={casesPage <= 1} onClick={() => fetchCases(casesPage - 1)} className="px-3 py-1 border rounded">Prev</button>
              <button disabled={(casesPage * 50 >= casesTotal)} onClick={() => fetchCases(casesPage + 1)} className="px-3 py-1 border rounded">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}
