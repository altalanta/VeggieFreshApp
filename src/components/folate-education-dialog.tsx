import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VeggieButton } from "@/components/ui/veggie-button";

export function FolateEducationDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <VeggieButton variant="link" className="text-xs p-0 h-auto">Learn more</VeggieButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Folate vs. Folic Acid</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p><strong>Folate</strong> is the natural form of vitamin B9 found in foods like leafy greens, beans, and citrus fruits. It plays a crucial role in preventing neural tube defects.</p>
          <p><strong>Folic Acid</strong> is the synthetic form of vitamin B9 used in supplements and fortified foods. While effective, it's important to monitor your intake to avoid exceeding the upper limit of 1,000 mcg per day from synthetic sources, unless advised by your doctor.</p>
          <p>This app tracks both forms separately to help you maintain a healthy balance.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
