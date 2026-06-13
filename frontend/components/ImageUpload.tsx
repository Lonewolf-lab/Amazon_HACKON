"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onFileSelected?: (file: File | null) => void;
}

export function ImageUpload({ onFileSelected }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0] ?? null;
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
    }
    onFileSelected?.(file);
  }

  function clear() {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileSelected?.(null);
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Upload preview"
            className="max-h-48 rounded-lg object-contain"
          />
        ) : (
          <>
            <UploadCloud className="mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drag &amp; drop a photo, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              PNG or JPG of the returned item
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {fileName && (
        <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
          <span className="truncate">{fileName}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
