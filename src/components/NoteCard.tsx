
import React, { useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ImageCarousel } from "./ImageCarousel";
import { NoteCardActions } from "./notes/NoteCardActions";
import { NoteManagementActions } from "./notes/NoteManagementActions";
import { getNoteCardStyles, getContentClasses } from "./notes/NoteCardUtils";

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  link?: string;
  image_url?: string;
  category: string;
  categoryColor: string;
  is_starred: boolean;
  is_pinned?: boolean;
  isInTrash?: boolean;
  onStar?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onEdit?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  title,
  content,
  link,
  image_url,
  category,
  categoryColor,
  is_starred,
  is_pinned = false,
  isInTrash,
  onStar,
  onPin,
  onDelete,
  onRestore,
  onEdit,
}) => {
  const [noteSize, setNoteSize] = useState<string>("medium");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("note_size")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        if (data && data.note_size) {
          setNoteSize(data.note_size);
        }
      } catch (error) {
        console.error("Error fetching note size preference:", error);
      }
    };

    fetchUserPreferences();

    // Process image URLs
    if (image_url) {
      // If the image_url contains multiple URLs (comma-separated)
      if (image_url.includes(',')) {
        setImages(image_url.split(',').map(url => url.trim()));
      } else {
        setImages([image_url]);
      }
    }
  }, [image_url]);

  return (
    <Card className={getNoteCardStyles(noteSize, !!image_url)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1 text-xl">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {!isInTrash && (
              <NoteManagementActions 
                is_starred={is_starred}
                is_pinned={is_pinned}
                onStar={onStar}
                onPin={onPin}
                onEdit={onEdit}
                onDelete={onDelete}
                isInTrash={false}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        {images.length > 0 && (
          <ImageCarousel 
            images={images}
            size={noteSize as "small" | "medium" | "large"}
          />
        )}
        <p className={`text-muted-foreground ${getContentClasses(noteSize)}`}>{content}</p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Link2 className="h-4 w-4" />
            {link}
          </a>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className={`text-sm px-3 py-1 rounded-full ${categoryColor}`}>
          {category}
        </span>
        <div className="flex gap-2">
          <NoteCardActions content={content} link={link} />
          {isInTrash && (
            <NoteManagementActions 
              isInTrash={true}
              is_starred={is_starred}
              is_pinned={is_pinned}
              onDelete={onDelete}
              onRestore={onRestore}
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
