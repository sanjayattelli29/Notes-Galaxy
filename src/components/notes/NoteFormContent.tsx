
import React from "react";
import { NoteFormState } from "@/hooks/useNoteForm";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/lib/api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NoteFormContentProps {
  noteForm: NoteFormState;
  setNoteForm: React.Dispatch<React.SetStateAction<NoteFormState>>;
  categories: Category[];
}

export const NoteFormContent: React.FC<NoteFormContentProps> = ({
  noteForm,
  setNoteForm,
  categories,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={noteForm.title}
            onChange={(e) =>
              setNoteForm((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter note title"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={noteForm.category}
            onValueChange={(value) =>
              setNoteForm((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.name.toLowerCase()}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${category.color}`}
                  ></span>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="link">Link (optional)</Label>
          <Input
            id="link"
            value={noteForm.link}
            onChange={(e) =>
              setNoteForm((prev) => ({ ...prev, link: e.target.value }))
            }
            placeholder="Enter URL (optional)"
          />
        </div>
      </div>
      <div className="grid gap-2 h-full">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={noteForm.content}
          onChange={(e) =>
            setNoteForm((prev) => ({ ...prev, content: e.target.value }))
          }
          placeholder="Write your note here..."
          className="min-h-[400px] flex-1"
        />
      </div>
    </div>
  );
};
