import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";
import { safeArray, safeText } from "@/utils/safeRender";

interface SkillsData {
  list: string[];
  coreDomains: string;
  signatureStrengths: string;
}

interface Step5SkillsProps {
  data: SkillsData;
  onChange: (data: SkillsData) => void;
}

export const Step5Skills = ({ data, onChange }: Step5SkillsProps) => {
  const [skillInput, setSkillInput] = useState("");
  
  // Ensure data and arrays are safe
  const safeData = data ?? { list: [], coreDomains: "", signatureStrengths: "" };
  const skillsList = safeArray(safeData?.list);

  const addSkill = () => {
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      onChange({ ...safeData, list: [...skillsList, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    onChange({ ...safeData, list: skillsList.filter((s) => s !== skill) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Skills & Capabilities</h2>
        <p className="text-muted-foreground">
          What are you exceptional at? What's your expertise?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="skills">Add Skills</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              id="skills"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a skill and press Enter"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Press Enter to add each skill. Examples: AI Strategy, Product Design, Systems Thinking
          </p>
        </div>

        {Array.isArray(skillsList) && skillsList.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
            {skillsList.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-sm px-3 py-1.5">
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-2 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div>
          <Label>Core Domains of Expertise</Label>
          <Textarea
            placeholder="What areas do you specialize in?"
            className="mt-1.5 min-h-[80px]"
            value={safeText(safeData?.coreDomains)}
            onChange={(e) => onChange({ ...safeData, coreDomains: e.target.value })}
          />
        </div>

        <div>
          <Label>Signature Strengths</Label>
          <Textarea
            placeholder="What unique strengths do you bring?"
            className="mt-1.5 min-h-[80px]"
            value={safeText(safeData?.signatureStrengths)}
            onChange={(e) => onChange({ ...safeData, signatureStrengths: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
