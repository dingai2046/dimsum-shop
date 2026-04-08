"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

export function QuantitySelector({
  min = 1,
  max = 99,
  defaultValue = 1,
  onChange,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(defaultValue);

  function update(value: number) {
    const clamped = Math.min(max, Math.max(min, value));
    setQuantity(clamped);
    onChange?.(clamped);
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        size="icon"
        variant="outline"
        className="h-10 w-10 rounded-full"
        onClick={() => update(quantity - 1)}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center text-lg font-semibold tabular-nums">
        {quantity}
      </span>
      <Button
        size="icon"
        variant="outline"
        className="h-10 w-10 rounded-full"
        onClick={() => update(quantity + 1)}
        disabled={quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
