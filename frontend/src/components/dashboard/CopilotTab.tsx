import React, { useState, useEffect } from 'react';
import {
  Sparkles, Send, ShieldAlert, CheckCircle2, AlertTriangle, Terminal,
  ShieldCheck, RefreshCw, Layers, ExternalLink, HelpCircle, FileText
} from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { api } from '../../services/api';
import { CopilotResponse } from '../../types';

interface CopilotTabProps {
  initialIncidentId?: number | null;
  initialService?: string | null;
}

export const CopilotTab: React.FC<CopilotTabProps> = ({
  initialIncidentId,
  initialService
}) => {
  const { incidents, telemetry, refreshIncidents } = useLiveData();
  
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | undefined>(
    initialIncidentId || (incidents[0] ? incidents[0].id : undefined)
  );
  const [selectedService, setSelectedService] = useState<string>(
    initialService || 'payment-processor'
  );
  
  const [queryInput, setQueryInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copilotData, setCopilotData] = useState<CopilotResponse | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Trigger investigation
  const runInvestigation = async (customQuery?: string) => {
    setLoading(true);
    setActionSuccessMessage(null);
    try {
      const res = await api.investigate({
        incident_id: selectedIncidentId,
        service_name: selectedService,
        query: customQuery || queryInput
      });
      setCopilotData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runInvestigation();
  }, [selectedIncidentId, selectedService]);

  const handleApproveFromCopilot = async () => {
    if (!selectedIncidentId) return;
    setLoading(true);
    try {
      await api.approveIncident(selectedIncidentId, 'APPROVE');
      setActionSuccessMessage('Remediation action successfully approved and dispatched to cluster controller.');
      await refreshIncidents();
      await runInvestigation();
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="p-4 rounded-xl bg-midnight-900/80 border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">AI Incident Investigation Copilot</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-based root cause analysis with strict segregation between Facts, Inferences, and Hypotheses.
          </p>
        </div>

        {/* Target Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Linked Incident:</span>
            <select
              value={selectedIncidentId || ''}
              onChange={e => {
                const id = Number(e.target.value);
                setSelectedIncidentId(id);
                const match = incidents.find(i => i.id === id);
                if (match) setSelectedService(match.service_name);
              }}
              className="bg-midnight-950 border border-white/10 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-blue"
            >
              {incidents.map(inc => (
                <option key={inc.id} value={inc.id}>
                  INC-{inc.id}: {inc.service_name} ({inc.severity})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => runInvestigation()}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/30 text-xs text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Copilot Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Evidence Breakdown & Root Causes (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Summary Card */}
          <GlassCard glow className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Investigation Summary</span>
              <Badge variant="info">Target: {selectedService}</Badge>
            </div>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              {copilotData?.investigation_summary || 'Analyzing telemetry streams and correlated release logs...'}
            </p>
          </GlassCard>

          {/* Tri-Partite Evidence Breakdown (Facts, Inferences, Hypotheses) */}
          <GlassCard glow className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-xs font-bold text-white tracking-wide">
                Rigorous Evidence Breakdown (Fact vs Inference vs Hypothesis)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Zero hallucination protocol</span>
            </div>

            <div className="space-y-3">
              {copilotData?.evidence_breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    item.category === 'FACT'
                      ? 'bg-cyan-500/5 border-cyan-500/20'
                      : item.category === 'INFERENCE'
                      ? 'bg-violet-500/5 border-violet-500/20'
                      : 'bg-amber-500/5 border-amber-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        item.category === 'FACT' ? 'info' :
                        item.category === 'INFERENCE' ? 'elevated' : 'warning'
                      }
                    >
                      {item.category === 'FACT' ? '1. VERIFIABLE FACT' :
                       item.category === 'INFERENCE' ? '2. ALGORITHMIC INFERENCE' :
                       '3. TESTABLE HYPOTHESIS'}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Confidence: {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-slate-200 font-sans leading-relaxed">{item.statement}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">Data Source: {item.data_source}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Candidate Root Causes */}
          <GlassCard glow className="space-y-3">
            <span className="text-xs font-bold text-white tracking-wide block pb-2 border-b border-white/[0.08]">
              Candidate Root Causes & Blast Surface
            </span>

            <div className="space-y-2.5">
              {copilotData?.candidate_root_causes.map((rc, i) => (
                <div key={i} className="p-3 rounded-lg bg-midnight-950 border border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{rc.cause}</span>
                    <span className="text-cyan-400 font-mono font-bold">{(rc.probability * 100).toFixed(0)}% Prob</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>Impact Surface:</span>
                    {rc.impact_surface.map(surf => (
                      <span key={surf} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                        {surf}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Right Col: Diagnostics & Governed Remediation (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Proposed Remediation Blueprint */}
          {copilotData?.proposed_remediation && (
            <GlassCard glow className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Proposed Remediation Action</span>
                </div>
                <Badge variant="warning">
                  Risk: {copilotData.proposed_remediation.risk_level}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {copilotData.proposed_remediation.summary}
              </p>

              <div className="space-y-2">
                {copilotData.proposed_remediation.actions.map(act => (
                  <div key={act.action_id} className="p-3 rounded-xl bg-midnight-950 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-cyan-400 font-bold">{act.action_id} &bull; {act.type}</span>
                      <span className="text-slate-400">Impact: {act.risk_level}</span>
                    </div>
                    <p className="text-slate-200">{act.description}</p>
                    <p className="text-[10px] text-slate-500 italic">{act.estimated_impact}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-midnight-950 border border-white/5 text-[11px] text-slate-400 font-mono space-y-1">
                <span className="text-slate-500 text-[10px] uppercase block">Rollback Checkpoint:</span>
                <p className="text-cyan-300">{copilotData.proposed_remediation.rollback_procedure}</p>
              </div>

              <button
                onClick={handleApproveFromCopilot}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Authorize & Execute Remediation
              </button>
            </GlassCard>
          )}

          {/* Recommended Diagnostics Checks */}
          <GlassCard glow className="space-y-3">
            <span className="text-xs font-bold text-white tracking-wide block pb-2 border-b border-white/[0.08]">
              Recommended Read-Only Diagnostic Checks
            </span>

            <div className="space-y-2 text-xs">
              {copilotData?.recommended_diagnostics.map((diag, i) => (
                <div key={i} className="p-3 rounded-lg bg-midnight-950 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{diag.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">~{diag.estimated_duration_sec}s</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{diag.description}</p>
                  <div className="p-2 rounded bg-midnight-900 border border-white/5 font-mono text-[10px] text-cyan-300 flex items-center gap-1.5 overflow-x-auto">
                    <Terminal className="w-3.5 h-3.5 shrink-0" />
                    <code>{diag.command_snippet}</code>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* SRE Confidence Limitations Note */}
          <div className="p-3.5 rounded-xl bg-midnight-900/60 border border-white/[0.06] text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Safety & Evidence Guidelines
            </span>
            <p className="leading-relaxed">
              {copilotData?.confidence_limitations}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
