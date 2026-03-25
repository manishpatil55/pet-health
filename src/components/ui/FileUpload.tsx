import { useCallback, useState, type ChangeEvent } from 'react';
import { Upload, X, FileImage, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  label?: string;
  error?: string;
  className?: string;
}

const FileUpload = ({
  onFileSelect,
  accept = 'image/*,.pdf',
  multiple = false,
  maxSize = 5,
  label = 'Upload file',
  error,
  className = '',
}: FileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<
    Array<{ name: string; type: string; url?: string }>
  >([]);

  const handleFiles = useCallback(
    (files: FileList) => {
      const validFiles: File[] = [];
      const newPreviews: Array<{ name: string; type: string; url?: string }> = [];

      Array.from(files).forEach((file) => {
        if (file.size > maxSize * 1024 * 1024) return;
        validFiles.push(file);

        if (file.type.startsWith('image/')) {
          newPreviews.push({
            name: file.name,
            type: 'image',
            url: URL.createObjectURL(file),
          });
        } else {
          newPreviews.push({ name: file.name, type: 'pdf' });
        }
      });

      setPreviews((prev) => (multiple ? [...prev, ...newPreviews] : newPreviews));
      onFileSelect(validFiles);
    },
    [maxSize, multiple, onFileSelect],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#2F3A3A] mb-1.5">
          {label}
        </label>
      )}

      {/* Drop Zone */}
      <div
        className={`
          relative rounded-lg border-2 border-dashed p-6 text-center
          transition-colors duration-200
          ${dragOver ? 'border-[#4FB6B2] bg-[#CFEDEA]/20' : 'border-[#E6EEEE]'}
          ${error ? 'border-[#E76F51]' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="mx-auto h-8 w-8 text-[#7A8A8A] mb-2" />
        <p className="text-sm text-[#7A8A8A]">
          Drag & drop or{' '}
          <span className="text-[#4FB6B2] font-medium">browse</span>
        </p>
        <p className="text-xs text-[#7A8A8A] mt-1">
          Max {maxSize}MB per file
        </p>
      </div>

      {error && <p className="mt-1.5 text-xs text-[#E76F51]">{error}</p>}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="mt-3 space-y-2">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-[#E6EEEE] p-2"
            >
              {preview.type === 'image' && preview.url ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CFEDEA]">
                  {preview.type === 'image' ? (
                    <FileImage className="h-5 w-5 text-[#4FB6B2]" />
                  ) : (
                    <FileText className="h-5 w-5 text-[#4FB6B2]" />
                  )}
                </div>
              )}
              <span className="flex-1 text-sm text-[#2F3A3A] truncate">
                {preview.name}
              </span>
              <button
                onClick={() => removePreview(index)}
                className="p-1 rounded hover:bg-[#E6EEEE]/50"
              >
                <X className="h-4 w-4 text-[#7A8A8A]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { FileUpload };
export type { FileUploadProps };
