
import React from "react";
import { Copy, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NoteCardActionsProps {
  content: string;
  link?: string;
}

export const NoteCardActions: React.FC<NoteCardActionsProps> = ({
  content,
  link,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Note content copied to clipboard");
  };

  const handleCopyLink = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Note",
        text: content,
      });
    } catch (err) {
      toast.error("Unable to share note");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="hover:text-primary"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4" />
      </Button>
      {link && (
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary"
          onClick={handleCopyLink}
        >
          <Link2 className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="hover:text-primary"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </>
  );
};
