import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Networking } from "@/types/digitalTwin";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { safeArray, safeText } from "@/utils/safeRender";

interface Step8NetworkingProps {
  data: Networking;
  onChange: (data: Networking) => void;
}

export const Step8Networking = ({ data, onChange }: Step8NetworkingProps) => {
  const [boundaryInput, setBoundaryInput] = useState("");
  
  // Ensure data and arrays are safe
  const safeData = data ?? { audience: "", intent: "", boundaries: [] };
  const boundaries = safeArray(safeData?.boundaries);

  const handleChange = (field: keyof Networking, value: string | string[]) => {
    onChange({ ...safeData, [field]: value });
  };

  const addBoundary = () => {
    if (boundaryInput.trim() && !boundaries.includes(boundaryInput.trim())) {
      handleChange("boundaries", [...boundaries, boundaryInput.trim()]);
      setBoundaryInput("");
    }
  };

  const removeBoundary = (boundary: string) => {
    handleChange("boundaries", boundaries.filter((b) => b !== boundary));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Networking Goals</h2>
        <p className="text-muted-foreground">How should your net twin engage with others?</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Target Audience</Label>
          <Textarea
            value={safeText(safeData?.audience)}
            onChange={(e) => handleChange("audience", e.target.value)}
            placeholder="Who should your twin connect with? (e.g., clients, founders, investors, recruiters)"
            className="mt-1.5 min-h-[80px]"
          />
        </div>

        <div>
          <Label>Primary Intent</Label>
          <Textarea
            value={safeText(safeData?.intent)}
            onChange={(e) => handleChange("intent", e.target.value)}
            placeholder="What's the goal? (e.g., networking, collaboration, visibility, pitching)"
            className="mt-1.5 min-h-[80px]"
          />
        </div>

        <div>
          <Label>Boundaries</Label>
          <Input
            value={boundaryInput}
            onChange={(e) => setBoundaryInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBoundary())}
            placeholder="Topics to avoid (press Enter)"
            className="mt-1.5"
          />
          <p className="text-sm text-muted-foreground mt-1">
            What topics or areas should your twin not discuss?
          </p>
          {Array.isArray(boundaries) && boundaries.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {boundaries.map((boundary) => (
                <Badge key={boundary} variant="secondary">
                  {boundary}
                  <button onClick={() => removeBoundary(boundary)} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
