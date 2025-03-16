
import React from "react";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border mt-auto p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <div>
          <span className="font-semibold">NotesGalaxy</span> - Your Personal File, Notes, Task Management App
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <a href="tel:+918919200290" className="hover:text-foreground">
            +91 8919200290
          </a>
          <span className="hidden md:inline">•</span>
          <a href="mailto:attellisanjay29@gmail.com" className="hover:text-foreground">
            attellisanjay29@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};
