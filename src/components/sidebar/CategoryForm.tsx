
import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const COLORS = [
  { label: "Red", value: "bg-red-500" },
  { label: "Blue", value: "bg-blue-500" },
  { label: "Green", value: "bg-green-500" },
  { label: "Yellow", value: "bg-yellow-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Pink", value: "bg-pink-500" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Teal", value: "bg-teal-500" },
];

interface CategoryFormProps {
  formData: {
    name: string;
    color: string;
  };
  onChange: (data: { name: string; color: string }) => void;
  onSubmit: () => void;
  submitLabel: string;
}

export const CategoryForm = ({ formData, onChange, onSubmit, submitLabel }: CategoryFormProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            onChange({ ...formData, name: e.target.value })
          }
          placeholder="Enter category name"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="color">Color</Label>
        <Select
          value={formData.color}
          onValueChange={(value) =>
            onChange({ ...formData, color: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a color" />
          </SelectTrigger>
          <SelectContent>
            {COLORS.map((color) => (
              <SelectItem
                key={color.value}
                value={color.value}
                className="flex items-center gap-2"
              >
                <span className={`w-4 h-4 rounded-full ${color.value}`} />
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  );
};
