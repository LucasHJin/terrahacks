import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center mobile-page-container mobile-landing-container" style={{ backgroundColor: '#f8fbfc', fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <h1 className="text-5xl font-medium mb-8" style={{ color: '#071012', fontWeight: 500 }}>
            Welcome to <span style={{ color: '#f0bc67' }}>BeProud</span>
          </h1>
          <p className="text-xl font-extralight max-w-lg mx-auto" style={{ color: '#071012', fontWeight: 200 }}>
            Addressing the stigma of working out, one photo at a time.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
