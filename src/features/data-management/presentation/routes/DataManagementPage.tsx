import React, { useRef, useState } from 'react';
import { exportDatabase, bundleToJson } from '@/features/data-management/infrastructure/exportService';
import { importDatabase } from '@/features/data-management/infrastructure/importService';
import { Button } from '@/shared/ui/actions/Button';
import styles from '../DataManagement.module.scss';

export function DataManagementPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [summary, setSummary] = useState<{ [k: string]: number } | null>(null);

  async function handleExport() {
    setStatus('exporting');
    try {
      const bundle = await exportDatabase();
      const json = bundleToJson(bundle);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kakeibo-backup-${bundle.exportedAt}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('exported');
    } catch (err) {
      setStatus('export-failed');
    }
  }

  function computeSummary(bundle: any) {
    const recs = bundle?.records ?? {};
    return {
      appSettings: (recs.appSettings || []).length,
      budgetMonths: (recs.budgetMonths || []).length,
      budgetPlans: (recs.budgetPlans || []).length,
      transactions: (recs.transactions || []).length,
      monthlyReviews: (recs.monthlyReviews || []).length
    };
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    setStatus(null);
    const file = e.target.files?.[0];
    if (!file) return setStatus('no-file');

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setPreview(parsed);
      setSummary(computeSummary(parsed));
      setStatus('preview-ready');
    } catch (err) {
      setStatus('import-failed');
    }
  }

  async function confirmImport() {
    if (!preview) return setStatus('no-preview');
    setStatus('importing');
    const result = await importDatabase(preview);
    if (result.success) {
      setStatus('imported');
      setPreview(null);
      setSummary(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setStatus(`import-failed:${result.reason}`);
    }
  }

  function cancelPreview() {
    setPreview(null);
    setSummary(null);
    setStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className={styles.container}>
      <h2>Data Management</h2>
      <div className={styles.controls}>
        <Button onClick={handleExport}>Export backup</Button>
      </div>
      <div className={styles.importRow}>
        <label htmlFor="import-file" className={styles.fileLabel}>Import backup file</label>
        <input id="import-file" ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} aria-label="Import backup file" />
      </div>

      {status === 'preview-ready' && summary ? (
        <section aria-live="polite" className={styles.preview}>
          <h3>Import preview</h3>
          <p>Records contained in the selected backup:</p>
          <ul>
            <li>App settings: {summary.appSettings}</li>
            <li>Months: {summary.budgetMonths}</li>
            <li>Plans: {summary.budgetPlans}</li>
            <li>Transactions: {summary.transactions}</li>
            <li>Reviews: {summary.monthlyReviews}</li>
          </ul>
          <div className={styles.previewActions}>
            <Button variant="secondary" onClick={cancelPreview}>Cancel</Button>
            <Button onClick={confirmImport}>Replace local data with this backup</Button>
          </div>
        </section>
      ) : null}

      <div aria-live="polite" className={styles.status}>{status && status !== 'preview-ready' ? status : null}</div>
    </div>
  );
}

export default DataManagementPage;
