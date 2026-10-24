import React, { useState } from 'react';
import {
  ShieldAlert, CheckCircle2, XCircle, Search, Filter, Clock,
  ArrowRight, ShieldCheck, AlertTriangle, Check, Terminal, ExternalLink, Sparkles
} from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Incident } from '../../types';
import { api } from '../../services/api';

interface IncidentManagementTabProps {
  onInvestigateIncident: (incidentId: number) => void;
  selectedIncidentId?: number | null;
}

export const IncidentManagementTab: React.FC<IncidentManagementTabProps> = ({
  onInvestigateIncident,
  selectedIncidentId: initialSelectedId
}) => {
  const { incidents, refreshIncidents } = useLiveData();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Action in flight
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Auto-open if initial selected id provided
  React.useEffect(() => {
    if (initialSelectedId) {
      const found = incidents.find(i => i.id === initialSelectedId);
      if (found) setSelectedIncident(found);
    }
  }, [initialSelectedId, incidents]);

  const filteredIncidents = incidents.filter(inc => {
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesSearch = !searchQuery || 
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const handleApprove = async () => {
    if (!selectedIncident) return;
    setActionLoading(true);
    try {
      const updated = await api.approveIncident(selectedIncident.id, 'APPROVE');
      setSelectedIncident(updated);
      await refreshIncidents();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedIncident) return;
    setActionLoading(true);
    try {
      const updated = await api.approveIncident(selectedIncident.id, 'REJECT', rejectionReason);
      setSelectedIncident(updated);
      setRejectionModalOpen(false);
      setRejectionReason('');
      await refreshIncidents();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedIncident) return;
    setActionLoading(true);
    try {
      const updated = await api.approveIncident(selectedIncident.id, 'RESOLVE');
      setSelectedIncident(updated);
      await refreshIncidents();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="p-4 rounded-xl bg-midnight-900/80 border border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incidents by title, service, root cause..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-midnight-950 border border-white/10 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-blue"
            >
              <option value="ALL">All Statuses</option>
              <option value="DETECTED">Detected</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="MITIGATING">Mitigating</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="bg-midnight-950 border border-white/10 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-blue"
            >
              <option value="ALL">All Severities</option>
              <option value="P1-Critical">P1 - Critical</option>
              <option value="P2-High">P2 - High</option>
              <option value="P3-Medium">P3 - Medium</option>
              <option value="P4-Low">P4 - Low</option>
            </select>
          </div>
        </div>

      </div>

      {/* Incidents Table / Cards */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <GlassCard className="text-center py-12 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-white">No incidents match the active filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the status or search criteria.</p>
          </GlassCard>
        ) : (
          filteredIncidents.map(inc => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className="p-4 rounded-xl bg-midnight-900/80 border border-white/[0.07] hover:border-brand-blue/40 cursor-pointer transition-all shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      inc.severity === 'P1-Critical' ? 'p1' :
                      inc.severity === 'P2-High' ? 'p2' : 'p3'
                    }
                    pulse={inc.status !== 'RESOLVED'}
                  >
                    {inc.severity}
                  </Badge>
                  <span className="font-bold text-sm text-white">{inc.title}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-midnight-950 text-slate-400 border border-white/5">
                    {inc.service_name}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1">{inc.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono">
                  <span>Detected: <strong className="text-slate-300">{inc.detected_at.slice(11, 19)} UTC</strong></span>
                  <span>CPU: <strong className="text-slate-300">{inc.cpu_usage}%</strong></span>
                  <span>Latency P99: <strong className="text-slate-300">{inc.latency_p99}ms</strong></span>
                  <span>Governance: <strong className={inc.approval_status === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}>{inc.approval_status}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                <Badge variant={inc.status === 'RESOLVED' ? 'success' : 'warning'}>
                  {inc.status}
                </Badge>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIncident(inc);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  Workbench &rarr;
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Incident Detail Workbench Modal */}
      {selectedIncident && (
        <Modal
          isOpen={!!selectedIncident}
          onClose={() => setSelectedIncident(null)}
          title={`INC-${selectedIncident.id}: ${selectedIncident.title}`}
          subtitle={`Service: ${selectedIncident.service_name} • Severity: ${selectedIncident.severity}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            
            {/* Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
                <span className="text-slate-500 text-[10px] block">LIFECYCLE STATUS</span>
                <span className="text-sm font-bold text-amber-400">{selectedIncident.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
                <span className="text-slate-500 text-[10px] block">SEVERITY</span>
                <span className="text-sm font-bold text-rose-400">{selectedIncident.severity}</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
                <span className="text-slate-500 text-[10px] block">P99 LATENCY</span>
                <span className="text-sm font-bold text-white">{selectedIncident.latency_p99}ms</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
                <span className="text-slate-500 text-[10px] block">APPROVAL STATUS</span>
                <span className={`text-sm font-bold ${selectedIncident.approval_status === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedIncident.approval_status}
                </span>
              </div>
            </div>

            {/* Root Cause Candidate */}
            <div className="p-3.5 rounded-xl bg-midnight-950 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Candidate Root Cause</span>
              <p className="text-slate-300 font-sans leading-relaxed">{selectedIncident.root_cause_candidate || 'Under initial telemetry triage.'}</p>
            </div>

            {/* Evidence Breakdown */}
            {selectedIncident.evidence_data && selectedIncident.evidence_data.length > 0 && (
              <div>
                <span className="font-bold text-white text-xs block mb-2">Supporting Evidence (Observed Telemetry)</span>
                <div className="space-y-2">
                  {selectedIncident.evidence_data.map((ev, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-midnight-950 border border-white/5 flex items-start gap-2.5">
                      <Badge variant={ev.category === 'FACT' ? 'info' : ev.category === 'INFERENCE' ? 'elevated' : 'warning'}>
                        {ev.category}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-slate-200">{ev.statement}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Source: {ev.data_source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chronological Timeline */}
            {selectedIncident.timeline_events && selectedIncident.timeline_events.length > 0 && (
              <div>
                <span className="font-bold text-white text-xs block mb-2">Chronological Audit Timeline</span>
                <div className="space-y-2 border-l border-white/10 pl-3 ml-1 font-mono">
                  {selectedIncident.timeline_events.map((evt, idx) => (
                    <div key={idx} className="space-y-0.5 relative">
                      <span className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-cyan-400" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{evt.timestamp.slice(11, 19)} UTC</span>
                        <span className="font-bold text-white text-[11px]">{evt.phase}</span>
                        <span className="text-[10px] text-slate-500 font-sans">by {evt.author}</span>
                      </div>
                      <p className="text-slate-300 font-sans">{evt.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proposed Remediation Blueprint & Governance Gate */}
            {selectedIncident.recommended_remediation && (
              <div className="p-4 rounded-xl bg-midnight-950/90 border border-brand-blue/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">Recommended Remediation Blueprint</span>
                  </div>
                  <Badge variant="nominal">Human Approval Required</Badge>
                </div>

                <p className="text-slate-300">{selectedIncident.recommended_remediation.summary}</p>

                {selectedIncident.recommended_remediation.actions && (
                  <div className="space-y-1.5">
                    {selectedIncident.recommended_remediation.actions.map((act, i) => (
                      <div key={i} className="p-2 rounded bg-midnight-900 border border-white/5 font-mono text-[11px] text-slate-300">
                        {act.command ? (
                          <div className="flex items-center gap-1.5 text-cyan-300">
                            <Terminal className="w-3.5 h-3.5 shrink-0" />
                            <code>{act.command}</code>
                          </div>
                        ) : (
                          <span>{act.action}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedIncident.recommended_remediation.rollback_procedure && (
                  <p className="text-[11px] text-slate-400 font-mono">
                    Rollback: {selectedIncident.recommended_remediation.rollback_procedure}
                  </p>
                )}
              </div>
            )}

            {/* Execution Result (if approved) */}
            {selectedIncident.execution_result && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono text-[11px] space-y-1">
                <span className="font-bold text-emerald-400 block">DISPATCHED EXECUTION LOG</span>
                {selectedIncident.execution_result.logs.map((log, i) => (
                  <p key={i} className="text-slate-300">&gt; {log}</p>
                ))}
              </div>
            )}

            {/* Human-in-the-Loop Governance Action Bar */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  const id = selectedIncident.id;
                  setSelectedIncident(null);
                  onInvestigateIncident(id);
                }}
                className="px-3.5 py-2 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Open in Copilot
              </button>

              <div className="flex items-center gap-2">
                {selectedIncident.status !== 'RESOLVED' && selectedIncident.approval_status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => setRejectionModalOpen(true)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Plan
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Approve & Execute
                    </button>
                  </>
                )}

                {selectedIncident.status !== 'RESOLVED' && (
                  <button
                    onClick={handleResolve}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectionModalOpen && (
        <Modal
          isOpen={rejectionModalOpen}
          onClose={() => setRejectionModalOpen(false)}
          title="Reject Proposed Remediation"
          subtitle="Record operator rationale in audit history"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Provide justification for rejecting this automated remediation plan. This decision will be permanently logged in the compliance audit trail.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Traffic surge is scheduled maintenance; rolling restart not required."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-lg bg-midnight-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-blue"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
