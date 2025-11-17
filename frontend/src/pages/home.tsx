import { SuspendFallback } from '@/shared/components';
import s from '@/shared/styles/pages/home.module.scss'
import { Suspense } from 'react';

export default function Home() {
  return <div className={s.container}>
    <Suspense fallback={<SuspendFallback />}>
      <div>Home</div>
    </Suspense><SuspendFallback />
  </div>;
}