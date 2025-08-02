import ProtectedRoute from "@/components/ProtectedRoute";

export default function Profile() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
          <p className="text-gray-600">User profile information will be displayed here.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
