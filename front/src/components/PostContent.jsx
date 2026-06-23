'use client';

import { useEffect } from 'react';

export default function PostContent({ html }) {
  useEffect(() => {
    document.querySelectorAll('.md-body pre').forEach(pre => {
      if (pre.querySelector('.copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '복사';
      btn.setAttribute('type', 'button');
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code');
        navigator.clipboard?.writeText(code?.textContent || '').then(() => {
          btn.textContent = '✓ 복사됨';
          setTimeout(() => { btn.textContent = '복사'; }, 2000);
        });
      });
      pre.appendChild(btn);
    });
  }, [html]);

  return <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
