import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Education } from "@/types/digitalTwin";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { safeArray, safeText } from "@/utils/safeRender";

interface Step4EducationProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export const Step4Education = ({ data, onChange }: Step4EducationProps) => {
  // Ensure data is always an array with safe defaults
  const safeData = safeArray(data);

  const addEducation = () => {
    onChange([...safeData, { institution: "", degree: "", year: "" }]);
  };

  const removeEducation = (index: number) => {
    onChange(safeData.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...safeData];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Education & Certifications</h2>
        <p className="text-muted-foreground">Academic background and professional certifications.</p>
      </div>

      <div className="space-y-4">
        {safeData.map((edu, index) => (
          <Card key={index} className="p-6 relative">
            {safeData.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => removeEducation(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            <div className="space-y-4 pr-8">
              <div>
                <Label>Institution *</Label>
                <Input
                  value={safeText(edu?.institution)}
                  onChange={(e) => updateEducation(index, "institution", e.target.value)}
                  placeholder="University or organization"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Degree / Certification *</Label>
                <Input
                  value={safeText(edu?.degree)}
                  onChange={(e) => updateEducation(index, "degree", e.target.value)}
                  placeholder="e.g., B.S. Computer Science"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Year *</Label>
                <Input
                  value={safeText(edu?.year)}
                  onChange={(e) => updateEducation(index, "year", e.target.value)}
                  placeholder="e.g., 2018"
                  className="mt-1.5"
                />
              </div>
            </div>
          </Card>
        ))}

        <Button onClick={addEducation} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>
    </div>
  );
};
