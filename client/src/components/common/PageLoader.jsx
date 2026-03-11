export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-700 border-t-transparent animate-spin" />
        </div>
        <p className="font-display text-brand-700 text-lg">Apni Rasoi</p>
      </div>
    </div>
  );
}