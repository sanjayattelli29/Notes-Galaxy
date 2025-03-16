
export const getNoteCardStyles = (noteSize: string, hasImage: boolean) => {
  const baseStyles = "w-full transition-all duration-300 hover:shadow-lg animate-fade-in dark:border-gray-800";
  
  if (!hasImage) {
    // Default size for notes without images
    return `${baseStyles} h-auto`;
  }
  
  switch (noteSize) {
    case "small":
      return `${baseStyles} max-h-[300px]`;
    case "large":
      return `${baseStyles} max-h-[500px]`;
    case "medium":
    default:
      return `${baseStyles} max-h-[400px]`;
  }
};

export const getContentClasses = (noteSize: string) => {
  switch (noteSize) {
    case "small":
      return "line-clamp-2 text-sm";
    case "large":
      return "line-clamp-6 text-base";
    case "medium":
    default:
      return "line-clamp-4 text-base";
  }
};
