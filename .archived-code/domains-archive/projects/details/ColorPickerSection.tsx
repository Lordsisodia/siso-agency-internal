
import { Card } from "@/components/ui/card";
import { Palette } from "lucide-react";

export function ColorPickerSection() {
  const colors = [
    { name: "Primary", value: "#000000" },
    { name: "Accent", value: "#00FF00" },
  ];

  return (
    <Card className="p-6 bg-black/30 border-siso-text/10">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-semibold text-white">Color Pickers</h3>
        <Palette className="w-5 h-5 text-[#9b87f5]" />
      </div>
      <div className="space-y-3">
        {colors.map((color) => (
          <div key={color.name} className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded border border-gray-700"
              style={{ backgroundColor: color.value }}
            />
            <div>
              <p className="text-white">{color.name}</p>
              <p className="text-sm text-gray-400">{color.value}</p>
            </div>
          </div>
        ))}
        <p className="text-sm text-gray-400 mt-2">Color customization coming soon</p>
      </div>
    </Card>
  );
}
