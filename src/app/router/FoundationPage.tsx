import { Link } from 'react-router-dom';
import styles from '@/app/router/FoundationPage.module.scss';

interface FoundationPageProps {
  readonly title: string;
  readonly description: string;
}

export function FoundationPage({ title, description }: FoundationPageProps) {
  return (
    <section className={styles.page} aria-labelledby="page-title">
      <p className={styles.eyebrow}>Foundation release</p>
      <h1 id="page-title">{title}</h1>
      <p>{description}</p>
      <Link className={styles.link} to="/plan">
        View the planned first workflow
      </Link>
    </section>
  );
}
