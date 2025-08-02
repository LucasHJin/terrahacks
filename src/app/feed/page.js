import ProtectedRoute from "@/components/ProtectedRoute";
import Feed from "@/components/Feed";

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 mobile-page-container" style={{ backgroundColor: '#f8fbfc', fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-medium mb-8 text-center" style={{ color: '#071012', fontWeight: 500 }}>
            Photo Feed
          </h1>
          <Feed />
        </div>
      </div>
    </ProtectedRoute>
  );
}
