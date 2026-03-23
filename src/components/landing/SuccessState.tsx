import { CheckCircle2 } from "lucide-react";

export function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-green-100 rounded-full p-6 mb-6">
        <CheckCircle2 className="w-16 h-16 text-green-600" />
      </div>
      <h3 className="text-3xl font-bold font-heading text-teal-dark mb-4">
        Request Received!
      </h3>
      <p className="text-brown/80 text-lg max-w-md mx-auto mb-8">
        We've got your catering details safely in our kitchen. One of our dedicated account reps will reach out to you within the next 2 hours to confirm your menu.
      </p>
      <button 
        onClick={onReset}
        className="text-teal-base font-semibold hover:text-teal-dark underline underline-offset-4 transition-colors"
      >
        Submit another request
      </button>
    </div>
  );
}
