export function ProgramCTA() {
  return (
    <section className="bg-orange py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
          Feed your group all year with Buddas.
        </h2>
        <p className="text-white/80 text-base mb-8 max-w-xl mx-auto">
          Join the Corporate Catering Program today. No signup fee, no
          prepayment — just great food at a better price, every time you order.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#signup"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-orange font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg text-base"
          >
            Join the Program
          </a>
          <a
            href="#signup"
            className="inline-flex items-center justify-center px-10 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-base"
          >
            Talk to Our Catering Team
          </a>
        </div>
        <p className="mt-6 text-white/50 text-sm">
          2 · 4 · 6 orders per year · 10% · 15% · 20% off · 12-month term
        </p>
      </div>
    </section>
  );
}
