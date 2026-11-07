import { Button } from "@/components/ui/button";

type MobileConsultationBarProps = {
  label?: string;
  href?: string;
};

export function MobileConsultationBar({
  label = "Expert guidance · Zero brokerage",
  href = "#lead-form",
}: MobileConsultationBarProps) {
  return (
    <div data-bottom-bar className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-12px_40px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
      <Button href={href} className="w-full">
        {label}
      </Button>
    </div>
  );
}
