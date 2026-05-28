import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Personality } from "@/types/digitalTwin";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";
import { safeArray, safeText } from "@/utils/safeRender";

interface Step6PersonalityProps {
  data: Personality;
  onChange: (data: Personality) => void;
}

export const Step6Personality = ({ data, onChange }: Step6PersonalityProps) => {
  const [traitInput, setTraitInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  
  // Ensure data and arrays are safe
  const safeData = data ?? { traits: [], values: [], leadership_style: "", decision_style: "", tone: "", archetype: "" };
  const traits = safeArray(safeData?.traits);
  const values = safeArray(safeData?.values);

  const handleChange = (field: keyof Personality, value: string | string[]) => {
    onChange({ ...safeData, [field]: value });
  };

  const addTrait = () => {
    if (traitInput.trim() && !traits.includes(traitInput.trim())) {
      handleChange("traits", [...traits, traitInput.trim()]);
      setTraitInput("");
    }
  };

  const removeTrait = (trait: string) => {
    handleChange("traits", traits.filter((t) => t !== trait));
  };

  const addValue = () => {
    if (valueInput.trim() && !values.includes(valueInput.trim())) {
      handleChange("values", [...values, valueInput.trim()]);
      setValueInput("");
    }
  };

  const removeValue = (value: string) => {
    handleChange("values", values.filter((v) => v !== value));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Personality & Leadership</h2>
        <p className="text-muted-foreground">How would you describe your professional persona?</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Personality Traits</Label>
          <Input
            value={traitInput}
            onChange={(e) => setTraitInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTrait())}
            placeholder="Add traits (press Enter)"
            className="mt-1.5"
          />
          {Array.isArray(traits) && traits.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {traits.map((trait) => (
                <Badge key={trait} variant="secondary">
                  {trait}
                  <button onClick={() => removeTrait(trait)} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Leadership Style</Label>
          <Input
            value={safeText(safeData?.leadership_style)}
            onChange={(e) => handleChange("leadership_style", e.target.value)}
            placeholder="e.g., Visionary, Hands-on, Mentor"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Decision-Making Style</Label>
          <Input
            value={safeText(safeData?.decision_style)}
            onChange={(e) => handleChange("decision_style", e.target.value)}
            placeholder="e.g., Data-driven, Intuitive, Collaborative"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Communication Tone</Label>
          <Input
            value={safeText(safeData?.tone)}
            onChange={(e) => handleChange("tone", e.target.value)}
            placeholder="e.g., Friendly, Confident, Consultative"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Personal Archetype</Label>
          <Input
            value={safeText(safeData?.archetype)}
            onChange={(e) => handleChange("archetype", e.target.value)}
            placeholder="e.g., Visionary, Architect, Explorer, Strategist"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Core Values</Label>
          <Input
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addValue())}
            placeholder="Add values (press Enter)"
            className="mt-1.5"
          />
          {Array.isArray(values) && values.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {values.map((value) => (
                <Badge key={value} variant="secondary">
                  {value}
                  <button onClick={() => removeValue(value)} className="ml-2">
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
