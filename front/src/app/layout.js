import './globals.css';

export const metadata = {
  title: "so0126의 TIL",
  description: "오늘 배운 것을 잊지 않기 위한 기록",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
