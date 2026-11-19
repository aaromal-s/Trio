import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  Table,
  SlidersHorizontal
} from 'lucide-react';
import { api, DatasetInfo } from '../../services/api';

interface DatasetsPageProps {
  datasetInfo: DatasetInfo;
  onRefreshDataset: () => void;
  onSelectFeatures: (features: string[]) => void;
}

export const DatasetsPage: React.FC<DatasetsPageProps> = ({
  datasetInfo,
  onRefreshDataset,
  onSelectFeatures
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<{ total_rows: number; columns: string[]; preview_rows: any[] } | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadDiagnostics, setUploadDiagnostics] = useState<any | null>(null);
  const [swatDetails, setSwatDetails] = useState<any>(null);
  const [selectedSensorFeatures, setSelectedSensorFeatures] = useState<string[]>(datasetInfo.selected_features);

  const loadPreview = useCallback(async () => {
    try {
      const res = await api.getDatasetPreview(25);
      setPreviewData(res);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch dataset preview and SWaT information
  useEffect(() => {
    loadPreview();
    api.getSwatInfo().then(setSwatDetails).catch(() => {});
  }, [datasetInfo.dataset_name, loadPreview]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');
    setUploadDiagnostics(null);

    try {
      const res = await api.uploadCSV(file);
      setUploadSuccess(`Successfully uploaded '${file.name}' with ${res.row_count} rows.` + (res.transposed ? ' (Auto-transposed from sensor-oriented format)' : ''));
      setUploadDiagnostics(null);
      onRefreshDataset();
      loadPreview();
    } catch (err: any) {
      setUploadError(err.message || 'CSV upload failed');
      setUploadDiagnostics(err.diagnostics || null);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Only CSV (.csv) files are supported.');
      setUploadDiagnostics(null);
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');
    setUploadDiagnostics(null);

    try {
      const res = await api.uploadCSV(file);
      setUploadSuccess(`Successfully uploaded '${file.name}' with ${res.row_count} rows.` + (res.transposed ? ' (Auto-transposed from sensor-oriented format)' : ''));
      setUploadDiagnostics(null);
      onRefreshDataset();
      loadPreview();
    } catch (err: any) {
      setUploadError(err.message || 'CSV upload failed');
      setUploadDiagnostics(err.diagnostics || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateSynthetic = async () => {
    setIsGenerating(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      await api.generateSynthetic(1500, Math.floor(Math.random() * 1000));
      setUploadSuccess('Fresh synthetic industrial SWaT simulation generated.');
      onRefreshDataset();
      loadPreview();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to generate dataset');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFeature = (col: string) => {
    let updated: string[];
    if (selectedSensorFeatures.includes(col)) {
      if (selectedSensorFeatures.length <= 2) {
        setUploadError("At least 2 sensor features are required for multivariate analysis.");
        return;
      }
      updated = selectedSensorFeatures.filter(f => f !== col);
    } else {
      updated = [...selectedSensorFeatures, col];
    }
    setSelectedSensorFeatures(updated);
    onSelectFeatures(updated);
  };

  const validation = datasetInfo.validation;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-trio-border gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-trio-cyan" />
            <span>Dataset Management &amp; Ingestion</span>
          </h2>
          <p className="text-xs text-trio-muted mt-1">
            Manage multi-sensor time series, configure feature subsets, and inspect data quality.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateSynthetic}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isGenerating ? 'Generating...' : 'Generate New Demo Dataset'}</span>
          </button>
        </div>
      </div>

      {/* Upload Status Alerts */}
      {uploadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-trio-green/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-trio-green shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess('')} className="text-emerald-400 hover:text-white">&times;</button>
        </div>
      )}

      {uploadError && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button 
              onClick={() => { setUploadError(''); setUploadDiagnostics(null); }} 
              className="text-rose-400 hover:text-white"
            >
              &times;
            </button>
          </div>

          {/* Dedicated Upload Diagnostics Panel (Distinct from Active Dataset) */}
          {uploadDiagnostics && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 text-xs text-slate-300 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Uploaded File Diagnostics: <span className="font-mono text-cyan-300">{uploadDiagnostics.filename}</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {uploadDiagnostics.file_size_bytes?.toLocaleString()} bytes &bull; {uploadDiagnostics.encoding} &bull; delimiter: '{uploadDiagnostics.delimiter}'
                </span>
              </div>

              {/* 4 Diagnostics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Parsed Observations</span>
                  <div className={`text-lg font-bold font-mono ${uploadDiagnostics.parsed_rows < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {uploadDiagnostics.parsed_rows}
                  </div>
                  <span className="text-[9px] text-slate-500">Requires &ge; 50 rows</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Parsed Columns</span>
                  <div className="text-lg font-bold font-mono text-white">
                    {uploadDiagnostics.parsed_columns}
                  </div>
                  <span className="text-[9px] text-slate-500">Total detected headers</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Numeric Sensors</span>
                  <div className={`text-lg font-bold font-mono ${uploadDiagnostics.numeric_feature_count < 2 ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {uploadDiagnostics.numeric_feature_count}
                  </div>
                  <span className="text-[9px] text-slate-500">Requires &ge; 2 channels</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Timestamp Detection</span>
                  <div className="text-sm font-bold font-mono text-purple-300 truncate" title={uploadDiagnostics.timestamp_column || 'None'}>
                    {uploadDiagnostics.timestamp_detected ? uploadDiagnostics.timestamp_column : 'None'}
                  </div>
                  <span className="text-[9px] text-slate-500">
                    {uploadDiagnostics.timestamp_detected ? 'Detected in headers' : 'Not detected (auto-indexable)'}
                  </span>
                </div>
              </div>

              {/* Sample Parsed Structure Preview */}
              {uploadDiagnostics.sample_structure && uploadDiagnostics.sample_structure.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Sample Structure Extracted from Upload (First {uploadDiagnostics.sample_structure.length} Rows):
                  </span>
                  <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                    <table className="w-full text-[10px] font-mono">
                      <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                        <tr>
                          {Object.keys(uploadDiagnostics.sample_structure[0]).slice(0, 6).map((k) => (
                            <th key={k} className="p-1.5 text-left font-semibold">{k}</th>
                          ))}
                          {Object.keys(uploadDiagnostics.sample_structure[0]).length > 6 && (
                            <th className="p-1.5 text-left text-slate-500 font-normal">+ {Object.keys(uploadDiagnostics.sample_structure[0]).length - 6} more</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {uploadDiagnostics.sample_structure.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-900/40">
                            {Object.keys(uploadDiagnostics.sample_structure[0]).slice(0, 6).map((k) => (
                              <td key={k} className="p-1.5 text-slate-300 truncate max-w-[120px]">{String(row[k] ?? '')}</td>
                            ))}
                            {Object.keys(uploadDiagnostics.sample_structure[0]).length > 6 && (
                              <td className="p-1.5 text-slate-600">...</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Suggested Action Box */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block text-[11px] mb-0.5">Suggested Corrective Action</span>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {uploadDiagnostics.suggested_action}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dataset Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-trio-card/90 border border-trio-border">
          <span className="text-xs text-trio-muted block mb-1">Active Dataset</span>
          <div className="text-sm font-bold text-white truncate" title={datasetInfo.dataset_name}>
            {datasetInfo.dataset_name}
          </div>
          <div className="text-[11px] text-trio-cyan mt-1 font-mono">
            {datasetInfo.is_simulated ? 'SIMULATED DEMO' : 'CUSTOM CSV'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-trio-card/90 border border-trio-border">
          <span className="text-xs text-trio-muted block mb-1">Total Observations</span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {validation.row_count.toLocaleString()}
          </div>
          <div className="text-[11px] text-trio-muted mt-1">
            {validation.column_count} Total Columns
          </div>
        </div>

        <div className="p-4 rounded-xl bg-trio-card/90 border border-trio-border">
          <span className="text-xs text-trio-muted block mb-1">Missing Values</span>
          <div className="text-2xl font-extrabold font-mono text-trio-green">
            {validation.total_missing}
          </div>
          <div className="text-[11px] text-trio-green mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Clean &bull; Auto-imputed forward</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-trio-card/90 border border-trio-border">
          <span className="text-xs text-trio-muted block mb-1">Timestamp Column</span>
          <div className="text-sm font-mono font-bold text-purple-300">
            {validation.timestamp_column || 'Chronological Index'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Strict chronological ordering
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone + SWaT Testbed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="p-8 rounded-2xl bg-trio-card/60 border-2 border-dashed border-trio-border hover:border-trio-cyan/50 transition-all flex flex-col items-center justify-center text-center group cursor-pointer relative"
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            disabled={isUploading}
          />
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 group-hover:bg-cyan-950/60 flex items-center justify-center text-trio-muted group-hover:text-trio-cyan mb-4 border border-slate-700 group-hover:border-trio-cyan/30 transition-all">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            {isUploading ? 'Ingesting and Preprocessing CSV...' : 'Drag and Drop CSV Dataset Here'}
          </h3>
          <p className="text-xs text-trio-muted max-w-sm mb-4 leading-relaxed">
            Upload your custom industrial testbed CSV or SWaT dataset. Minimum 50 rows and 2 numeric columns.
          </p>
          <span className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 group-hover:bg-trio-cyan group-hover:text-black transition-colors">
            Browse File
          </span>
        </div>

        {/* SWaT Official Testbed Information Card */}
        <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-widest text-trio-cyan">
                Research Testbed Reference
              </span>
              <a
                href={swatDetails?.official_url || "https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/#swat"}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-trio-cyan hover:underline flex items-center gap-1 font-mono"
              >
                <span>iTrust SUTD</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              Secure Water Treatment (SWaT) Testbed
            </h3>
            <p className="text-xs text-trio-muted leading-relaxed mb-4">
              SWaT is an operational six-stage physical water purification plant testbed built by iTrust at SUTD for critical cyber-physical systems research. Stages include Raw Water Intake (P1), Chemical Dosing (P2), Ultrafiltration (P3), Dechlorination (P4), Reverse Osmosis (P5), and Distribution (P6).
            </p>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-trio-amber/30 text-[11px] text-amber-200 leading-relaxed mb-3">
              <strong>Redistribution Policy:</strong> Real SWaT files require institutional authorization from SUTD. TRIO includes a high-fidelity synthetic generator mimicking SWaT physics (FIT101, LIT101, DPIT301, AIT202) for full compliance.
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-trio-border/60 pt-3">
            <span>Citation: Goh et al. (CRITIS 2016)</span>
            <span className="text-trio-cyan font-mono">Stage 1 to 6 Supported</span>
          </div>
        </div>
      </div>

      {/* Feature Selection Section */}
      <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-trio-cyan" />
              <span>Multi-Sensor Feature Selection for Model Training</span>
            </h3>
            <p className="text-xs text-trio-muted mt-0.5">
              Select which physical sensor channels TRIO monitors. Toggle chips to include or exclude variables.
            </p>
          </div>
          <span className="text-xs font-mono text-trio-cyan bg-cyan-950/40 px-2.5 py-1 rounded border border-trio-cyan/30">
            {selectedSensorFeatures.length} Active Channels
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {validation.numeric_columns.map((col) => {
            const isSelected = selectedSensorFeatures.includes(col);
            return (
              <button
                key={col}
                onClick={() => toggleFeature(col)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-trio-cyan/20 text-trio-cyan border border-trio-cyan/40 shadow-glow-cyan/20'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-600'
                }`}
              >
                <span>{col}</span>
                {isSelected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-trio-cyan" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dataset Preview Table */}
      {previewData && (
        <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-trio-purple" />
                <span>Raw Observation Table Preview</span>
              </h3>
              <p className="text-xs text-trio-muted mt-0.5">
                Displaying first {previewData.preview_rows.length} rows of chronological observations.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Total {previewData.total_rows} Records
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-trio-border">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-trio-muted border-b border-trio-border">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  {previewData.columns.slice(0, 10).map((col) => (
                    <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-trio-secondary/40">
                {previewData.preview_rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    {previewData.columns.slice(0, 10).map((col) => (
                      <td key={col} className="py-2 px-3 whitespace-nowrap text-slate-300">
                        {String(row[col] !== null ? row[col] : '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

