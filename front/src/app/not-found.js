import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #c8eaf7 0%, #dff3fa 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'IM Hyemin', sans-serif",
    }}>
      <div style={{
        background: '#fffdf7',
        border: '2px solid #A8D3E5',
        borderRadius: 16,
        padding: '48px 40px',
        textAlign: 'center',
        maxWidth: 400,
        boxShadow: '0 4px 24px rgba(36,120,168,0.12)',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: 12 }}>( ˘•ω•˘ )</div>
        <h1 style={{ fontFamily: "'Kkukkukk', sans-serif", fontSize: '1.6rem', color: '#174A70', marginBottom: 8 }}>
          앗, 존재하지 않는 방이에요.
        </h1>
        <p style={{ color: '#607D8B', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.7 }}>
          주소가 바뀌었거나 삭제된 기록일 수 있어요.<br />
          빈 노트만 있는 방이네요... 🗒️
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              padding: '8px 20px',
              background: '#2478A8',
              color: '#fff',
              borderRadius: 20,
              textDecoration: 'none',
              fontSize: '0.88rem',
            }}
          >
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
