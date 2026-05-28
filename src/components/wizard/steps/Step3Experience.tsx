import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Experience } from "@/types/digitalTwin";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { safeJoin, safeArray } from "@/utils/safeRender";

interface Step3ExperienceProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export const Step3Experience = ({ data, onChange }: Step3ExperienceProps) => {
  // Ensure data is always an array with safe defaults
  const safeData = safeArray(data);

  const addExperience = () => {
    onChange([...safeData, { company: "", role: "", duration: "", key_projects: [] }]);
  };

  const removeExperience = (index: number) => {
    onChange(safeData.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    const updated = [...safeData];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleProjectsChange = (index: number, value: string) => {
    const projects = value.split(",").map((p) => p.trim()).filter(Boolean);
    updateExperience(index, "key_projects", projects);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Professional Background</h2>
        <p className="text-muted-foreground">Share your work experience and key achievements.</p>
      </div>

      <div className="space-y-4">
        {safeData.map((exp, index) => (
          <Card key={index} className="p-6 relative">
            {safeData.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => removeExperience(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

              <div className="space-y-4 pr-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company *</Label>
                    <Input
                      value={exp?.company ?? ""}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      placeholder="Company name"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Role *</Label>
                    <Input
                      value={exp?.role ?? ""}
                      onChange={(e) => updateExperience(index, "role", e.target.value)}
                      placeholder="Your position"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label>Duration *</Label>
                  <Input
                    value={exp?.duration ?? ""}
                    onChange={(e) => updateExperience(index, "duration", e.target.value)}
                    placeholder="e.g., Jan 2020 - Dec 2022"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Key Projects / Achievements</Label>
                  <Input
                    value={safeJoin(exp?.key_projects)}
                    onChange={(e) => handleProjectsChange(index, e.target.value)}
                    placeholder="Comma-separated list of notable projects"
                    className="mt-1.5"
                  />
                </div>
              </div>
          </Card>
        ))}

        <Button onClick={addExperience} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>
    </div>
  );
};
