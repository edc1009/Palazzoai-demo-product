
import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon, TrashIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string, mimeType: string) => void;
  onReset: () => void;
  uploadedImage: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onReset, uploadedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Please upload a JPG or PNG file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should not exceed 5MB.');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(e.target?.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleResetClick = useCallback(() => {
    onReset();
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [onReset]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png"
        disabled={!!uploadedImage}
      />
      {!uploadedImage ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-secondary hover:bg-gray-50 transition-colors"
          onClick={handleClick}
        >
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-brand-secondary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG or JPG (max. 5MB)</p>
        </div>
      ) : (
        <div className="relative group">
          <img src={uploadedImage} alt="Uploaded room" className="w-full h-auto rounded-lg shadow-md" />
           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center rounded-lg">
             <button
              onClick={handleResetClick}
              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all transform group-hover:scale-100 scale-90"
              aria-label="Remove image"
            >
              <TrashIcon className="h-6 w-6" />
            </button>
           </div>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};
