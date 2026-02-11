import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric"; // Ensure fabric is installed
import { Button } from "@/components/ui/button";
import { Eraser, Pencil, Trash2, Undo } from "lucide-react";

interface FundusDrawerProps {
  initialData?: any;
  onChange: (data: any) => void;
  label: string;
}

export function FundusDrawer({ initialData, onChange, label }: FundusDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [activeColor, setActiveColor] = useState<string>("red");
  const [isEraser, setIsEraser] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: 300,
      height: 300,
      backgroundColor: "#ffffff",
    });

    // Add Fundus Circle Background
    const circle = new fabric.Circle({
      radius: 130,
      fill: "transparent",
      stroke: "#cbd5e1", // slate-300
      strokeWidth: 2,
      left: 150,
      top: 150,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });
    
    // Crosshair
    const hLine = new fabric.Line([20, 150, 280, 150], { stroke: "#e2e8f0", selectable: false, evented: false });
    const vLine = new fabric.Line([150, 20, 150, 280], { stroke: "#e2e8f0", selectable: false, evented: false });

    canvas.add(circle, hLine, vLine);
    
    // Load initial data if exists
    if (initialData && Object.keys(initialData).length > 0) {
      canvas.loadFromJSON(initialData, () => {
        canvas.renderAll();
        // Re-add background elements if they were lost or duplicate logic needed
        // Typically loadFromJSON replaces everything, so background logic might need to be part of the saved state 
        // OR we handle background separate from user strokes. 
        // For simplicity, we assume saved state includes the background or we just append strokes.
      });
    }

    // configure brush
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = "red";

    canvas.on("path:created", () => {
      onChange(canvas.toJSON());
    });

    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Update Brush Settings
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    
    if (isEraser) {
      // Fabric.js Eraser Brush is essentially drawing with destination-out or white color
      // Since background is white, white brush acts as eraser visually
      canvas.freeDrawingBrush.color = "#ffffff";
      canvas.freeDrawingBrush.width = 15;
    } else {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = 3;
    }
  }, [activeColor, isEraser]);

  const clearCanvas = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    
    // Clear only paths (user drawings), keep background guide
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === "path") {
        canvas.remove(obj);
      }
    });
    onChange(canvas.toJSON());
  };

  const colors = [
    { value: "red", label: "Hemorrhage", class: "bg-red-500" },
    { value: "green", label: "Filter/Exudates", class: "bg-green-500" },
    { value: "#facc15", label: "Drusen", class: "bg-yellow-400" }, // yellow-400
    { value: "black", label: "Scarring", class: "bg-black" },
  ];

  return (
    <div className="flex flex-col gap-3 items-center">
      <h4 className="font-semibold text-muted-foreground">{label}</h4>
      <div className="relative shadow-md rounded-xl overflow-hidden border border-border">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex flex-wrap gap-2 justify-center w-full max-w-[300px]">
        {colors.map((c) => (
          <button
            key={c.value}
            onClick={() => { setActiveColor(c.value); setIsEraser(false); }}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${c.class} ${activeColor === c.value && !isEraser ? "ring-2 ring-offset-2 ring-primary border-transparent" : "border-transparent"}`}
            title={c.label}
          />
        ))}
        
        <div className="w-px h-8 bg-border mx-1" />
        
        <Button
          variant={isEraser ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setIsEraser(!isEraser)}
          className={isEraser ? "bg-muted text-foreground" : "text-muted-foreground"}
          title="Eraser"
        >
          <Eraser className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={clearCanvas}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Clear All"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
