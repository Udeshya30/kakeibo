import React, { useEffect, useState } from 'react';
import { getCategoryTotalsForMonth } from '@/features/reporting/application/reportingService';
import { getAppSettings } from '@/features/preferences/application/preferencesService';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import styles from '../Reporting.module.scss';

export function ReportingPage({ monthId }: { monthId?: string }) {
  const [totals, setTotals] = useState<{ category: string; totalMinor: number }[] | null>(null);
  const [locale, setLocale] = useState<string>('en-US');
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    void (async () => {
      const s = await getAppSettings();
      if (s) {
        setLocale(s.locale);
        setCurrency(s.baseCurrency);
      }
    })();
  }, []);

  useEffect(() => {
    if (!monthId) return;
    void (async () => {
      const t = await getCategoryTotalsForMonth(monthId);
      setTotals(t.map((x) => ({ category: x.category, totalMinor: x.totalMinor })));
    })();
  }, [monthId]);

  if (!monthId) return <div>No month selected</div>;
  if (!totals) return <div>Loading report…</div>;

  const nf = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 });

  const chartData = totals.map((t) => ({ name: t.category, value: t.totalMinor / 100 }));

  return (
    <div className={styles.container}>
      <h2>Report for {monthId}</h2>
      <figure aria-labelledby="report-caption" className={styles.figure}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 10, right: 16, left: 16, bottom: 10 }}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => nf.format(Number(v))} />
            <Tooltip formatter={(v: number) => nf.format(Number(v))} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
        <figcaption id="report-caption">Category totals for the selected month</figcaption>
      </figure>
      <ul className={styles.totalsList}>
        {totals.map((t) => (
          <li key={t.category}>
            <strong>{t.category}</strong>: {nf.format(t.totalMinor / 100)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReportingPage;
