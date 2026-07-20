import { useEffect, useState } from 'react';
import { getAppSettings, updateAppSettings } from '@/features/preferences/application/preferencesService';
import type { AppSettingsRecord } from '@/shared/domain/persistence';
import { Button } from '@/shared/ui/actions/Button';
import styles from '../Preferences.module.scss';

function validateSettings(s: AppSettingsRecord) {
  const errors: Record<string, string> = {};
  if (!s.baseCurrency || s.baseCurrency.trim() === '') errors.baseCurrency = 'Currency is required';
  if (!s.locale || s.locale.trim() === '') errors.locale = 'Locale is required';
  if (Number.isNaN(Number(s.weekStartsOn)) || s.weekStartsOn < 0 || s.weekStartsOn > 6) errors.weekStartsOn = 'Week start must be 0-6';
  return errors;
}

export function PreferencesPage() {
  const [settings, setSettings] = useState<AppSettingsRecord | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    void (async () => {
      const s = await getAppSettings();
      if (s) setSettings(s);
    })();
  }, []);

  async function save() {
    if (!settings) return;
    const validation = validateSettings(settings);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setStatus('validation-failed');
      return;
    }

    setStatus('saving');
    const updated = await updateAppSettings(settings);
    setSettings(updated);
    setStatus('saved');
  }

  if (!settings) return <div role="status">Loading...</div>;

  return (
    <div className={styles.container}>
      <h2 id="preferences-heading">Preferences</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
        aria-labelledby="preferences-heading"
      >
        <div className={styles.field}>
          <label htmlFor="baseCurrency">Base currency</label>
          <input
            id="baseCurrency"
            aria-invalid={errors.baseCurrency ? 'true' : 'false'}
            aria-describedby={errors.baseCurrency ? 'baseCurrency-error' : undefined}
            value={settings.baseCurrency}
            onChange={(e) => setSettings({ ...settings, baseCurrency: e.target.value })}
            required
          />
          {errors.baseCurrency ? <div id="baseCurrency-error" role="alert">{errors.baseCurrency}</div> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="locale">Locale</label>
          <input
            id="locale"
            aria-invalid={errors.locale ? 'true' : 'false'}
            aria-describedby={errors.locale ? 'locale-error' : undefined}
            value={settings.locale}
            onChange={(e) => setSettings({ ...settings, locale: e.target.value })}
            required
          />
          {errors.locale ? <div id="locale-error" role="alert">{errors.locale}</div> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="weekStartsOn">Week starts on (0-6)</label>
          <input
            id="weekStartsOn"
            type="number"
            min={0}
            max={6}
            aria-invalid={errors.weekStartsOn ? 'true' : 'false'}
            aria-describedby={errors.weekStartsOn ? 'weekStartsOn-error' : undefined}
            value={settings.weekStartsOn}
            onChange={(e) => setSettings({ ...settings, weekStartsOn: Number(e.target.value) })}
            required
          />
          {errors.weekStartsOn ? <div id="weekStartsOn-error" role="alert">{errors.weekStartsOn}</div> : null}
        </div>

        <div>
          <Button type="submit">Save</Button>
        </div>

        <div aria-live="polite" className={styles.status}>{status === 'saving' ? 'Saving…' : status === 'saved' ? 'Preferences saved' : status === 'validation-failed' ? 'Fix validation errors' : null}</div>
      </form>
    </div>
  );
}

export default PreferencesPage;
