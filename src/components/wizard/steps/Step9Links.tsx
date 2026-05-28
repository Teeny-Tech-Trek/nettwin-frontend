import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Links } from "@/types/digitalTwin";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";
import { safeArray, safeText } from "@/utils/safeRender";

interface Step9LinksProps {
  data: Links;
  onChange: (data: Links) => void;
}

export const Step9Links = ({ data, onChange }: Step9LinksProps) => {
  const [socialInput, setSocialInput] = useState("");
  
  // Ensure data and arrays are safe
  const safeData = data ?? { linkedin: "", website: "", portfolio: "", socials: [] };
  const socials = safeArray(safeData?.socials);

  const handleChange = (field: keyof Links, value: string | string[]) => {
    onChange({ ...safeData, [field]: value });
  };

  const addSocial = () => {
    if (socialInput.trim() && !socials.includes(socialInput.trim())) {
      handleChange("socials", [...socials, socialInput.trim()]);
      setSocialInput("");
    }
  };

  const removeSocial = (social: string) => {
    handleChange("socials", socials.filter((s) => s !== social));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Digital Presence</h2>
        <p className="text-muted-foreground">Where can people find you online?</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>LinkedIn Profile</Label>
          <Input
            value={safeText(safeData?.linkedin)}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Personal Website</Label>
          <Input
            value={safeText(safeData?.website)}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://..."
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Portfolio / Company Site</Label>
          <Input
            value={safeText(safeData?.portfolio)}
            onChange={(e) => handleChange("portfolio", e.target.value)}
            placeholder="https://..."
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Other Social Media</Label>
          <Input
            value={socialInput}
            onChange={(e) => setSocialInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSocial())}
            placeholder="Add social links (press Enter)"
            className="mt-1.5"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Twitter/X, GitHub, Medium, etc.
          </p>
          {Array.isArray(socials) && socials.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {socials.map((social) => (
                <Badge key={social} variant="secondary" className="text-xs">
                  {social}
                  <button onClick={() => removeSocial(social)} className="ml-2">
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
