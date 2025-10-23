import { Card, CardContent } from "./card";
import { Info } from "lucide-react";

interface GentleNudgeCardProps {
  message: string;
}

export function GentleNudgeCard({ message }: GentleNudgeCardProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="flex items-center p-4">
        <Info className="h-5 w-5 text-blue-500 mr-3" />
        <p className="text-sm text-blue-700">{message}</p>
      </CardContent>
    </Card>
  );
}
