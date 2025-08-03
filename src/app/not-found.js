import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fbfc', fontFamily: 'Inter, sans-serif' }}>
      <div className="text-center">
        <h1 className="text-6xl font-medium mb-4" style={{ color: '#071012', fontWeight: 500 }}>404</h1>
        <h2 className="text-2xl font-medium mb-4" style={{ color: '#071012', fontWeight: 500 }}>Page Not Found</h2>
        <p className="font-extralight mb-8" style={{ color: '#071012', fontWeight: 200 }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link 
          href="/"
          className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-block hover:bg-orange-200"
          style={{
            backgroundColor: '#ffbc8a',
            color: '#071012',
            fontWeight: 500
          }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
