  import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Business } from "@/types/digitalTwin";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { safeJoin, safeArray, warnMalformedData } from "@/utils/safeRender";

interface Step2BusinessProps {
  data: Business[];
  onChange: (data: Business[]) => void;
}

export const Step2Business = ({ data, onChange }: Step2BusinessProps) => {
  // Ensure data is always an array with safe defaults
  const safeData = safeArray(data);

  const addBusiness = () => {
    onChange([
      ...safeData,
      { name: "", role: "", description: "", link: "", products: [], duration: "" },
    ]);
  };

  const removeBusiness = (index: number) => {
    onChange(safeData.filter((_, i) => i !== index));
  };

  const updateBusiness = (index: number, field: keyof Business, value: string | string[]) => {
    const updated = [...safeData];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleProductsChange = (index: number, value: string) => {
    const products = value.split(",").map((p) => p.trim()).filter(Boolean);
    updateBusiness(index, "products", products);
  };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Business Ecosystem</h2>
          <p className="text-muted-foreground">Tell us about your ventures, companies, and projects.</p>
        </div>

        <div className="space-y-4">
          {safeData.map((business, index) => (
            <Card key={index} className="p-6 relative">
              {safeData.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={() => removeBusiness(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

              <div className="space-y-4 pr-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Business Name *</Label>
                    <Input
                      value={business?.name ?? ""}
                      onChange={(e) => updateBusiness(index, "name", e.target.value)}
                      placeholder="Company or venture name"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Your Role *</Label>
                    <Input
                      value={business?.role ?? ""}
                      onChange={(e) => updateBusiness(index, "role", e.target.value)}
                      placeholder="e.g., Founder, Advisor, Investor"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label>Duration / Active Years</Label>
                  <Input
                    value={business?.duration ?? ""}
                    onChange={(e) => updateBusiness(index, "duration", e.target.value)}
                    placeholder="e.g., 2020 - Present"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={business?.description ?? ""}
                    onChange={(e) => updateBusiness(index, "description", e.target.value)}
                    placeholder="What does this business do?"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Key Products/Offerings</Label>
                  <Input
                    value={safeJoin(business?.products)}
                    onChange={(e) => handleProductsChange(index, e.target.value)}
                    placeholder="Comma-separated list"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Website or Link</Label>
                  <Input
                    value={business?.link ?? ""}
                    onChange={(e) => updateBusiness(index, "link", e.target.value)}
                    placeholder="https://..."
                    className="mt-1.5"
                  />
                </div>
              </div>
            </Card>
          ))}

          <Button onClick={addBusiness} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Business
          </Button>
        </div>
      </div>
    );
  };
