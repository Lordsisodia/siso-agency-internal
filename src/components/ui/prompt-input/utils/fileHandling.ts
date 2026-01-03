/**
 * File handling utilities for prompt input
 * Extracted from ai-prompt-box.tsx for reusability
 */

export interface FileHandlingState {
  files: File[];
  filePreviews: { [key: string]: string };
}

export interface FileHandlingActions {
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setFilePreviews: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

/**
 * Check if a file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

/**
 * Process a file and generate preview if it's an image
 */
export const processFile = (
  file: File,
  currentFiles: File[],
  actions: FileHandlingActions,
  maxFiles: number = 10
): void => {
  if (currentFiles.length >= maxFiles) return;
  
  actions.setFiles((prevFiles) => [...prevFiles, file]);
  
  if (isImageFile(file)) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        actions.setFilePreviews((prev) => ({
          ...prev,
          [file.name]: e.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  }
};

/**
 * Remove a file and its preview
 */
export const removeFile = (
  index: number,
  files: File[],
  actions: FileHandlingActions
): void => {
  const file = files[index];
  actions.setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  
  if (isImageFile(file)) {
    actions.setFilePreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[file.name];
      return newPreviews;
    });
  }
};

/**
 * Handle drag over event
 */
export const handleDragOver = (e: React.DragEvent): void => {
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handle drag leave event
 */
export const handleDragLeave = (e: React.DragEvent): void => {
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handle file drop event
 */
export const handleDrop = (
  e: React.DragEvent,
  currentFiles: File[],
  actions: FileHandlingActions,
  maxFiles: number = 10
): void => {
  e.preventDefault();
  e.stopPropagation();
  
  const droppedFiles = Array.from(e.dataTransfer.files);
  droppedFiles.forEach((file) => processFile(file, currentFiles, actions, maxFiles));
};

/**
 * Process multiple files from input element
 */
export const processMultipleFiles = (
  fileList: FileList | null,
  currentFiles: File[],
  actions: FileHandlingActions,
  maxFiles: number = 10
): void => {
  if (!fileList) return;
  
  const files = Array.from(fileList);
  files.forEach((file) => processFile(file, currentFiles, actions, maxFiles));
};