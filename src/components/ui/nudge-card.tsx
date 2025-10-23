import { Card, CardContent } from "./card";
import { VeggieButton } from "./veggie-button";
import { ArrowRight } from "lucide-react";

interface NudgeCardProps {
  suggestionText: string;
  onAccept?: () => void;
}

export function NudgeCard({ suggestionText, onAccept }: NudgeCardProps) {
  return (
    <Card className="border-card-border bg-gradient-to-r from-lettuce/5 to-primary/5">
      <CardContent className="flex items-center justify-between p-4">
        <p className="text-sm text-foreground flex-grow pr-4">
          {suggestionText}
        </p>
        {onAccept && (
          <VeggieButton size="sm" onClick={onAccept}>
            Accept <ArrowRight className="ml-1 h-4 w-4" />
          </VeggieButton>
        )}
      </CardContent>
    </Card>
  );
}

