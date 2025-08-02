import ProtectedRoute from "@/components/ProtectedRoute";
import Camera from "@/components/Camera";

export default function TakePhoto() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8" style={{ backgroundColor: '#f8fbfc', fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Camera />
        </div>
      </div>
    </ProtectedRoute>
  );
}
