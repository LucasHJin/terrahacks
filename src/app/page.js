import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Be Jacked</h1>
            <p className="text-gray-600">Addressing the stigma of working out, one photo at a time.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
