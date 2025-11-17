import { useEffect, useState } from 'react';
import s from './style.module.scss'

export default function SuspendFallback() {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={s.container}>
      <img src="/logo.svg" alt="logo" className={s.logo} />
      <span className={s.text}>
        게임을 초기화 하는 중{dots}
      </span>
    </div>
  );
}