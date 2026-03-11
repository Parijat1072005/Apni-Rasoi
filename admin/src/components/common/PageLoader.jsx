export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-700 border-t-transparent animate-spin" />
        </div>
        <p className="font-display text-brand-700">Loading...</p>
      </div>
    </div>
  );
}