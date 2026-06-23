'use client';

import { useEffect } from 'react';

export default function PostContent({ html }) {
  useEffect(() => {
    document.querySelectorAll('.md-body pre').forEach(pre => {
      if (pre.closest('.code-block-wrapper')) return;

      const code = pre.querySelector('code');
      // shiki는 data-lang 속성, 구형은 class="language-xxx"
      const lang = pre.getAttribute('data-lang')
        || code?.className?.match(/language-(\w+)/)?.[1]
        || '';

      // wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // header: macOS dots + language + copy
      const header = document.createElement('div');
      header.className = 'code-header';

      const dots = document.createElement('div');
      dots.className = 'code-dots';
      dots.innerHTML = '<span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>';

      const langEl = document.createElement('span');
      langEl.className = 'code-lang';
      langEl.textContent = lang;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '복사';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', '코드 복사');
      btn.addEventListener('click', () => {
        const text = code?.textContent || pre.textContent || '';
        navigator.clipboard?.writeText(text).then(() => {
          btn.textContent = '✓ 복사됨';
          setTimeout(() => { btn.textContent = '복사'; }, 2000);
        });
      });

      header.appendChild(dots);
      header.appendChild(langEl);
      header.appendChild(btn);
      wrapper.insertBefore(header, pre);
    });
  }, [html]);

  return <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
