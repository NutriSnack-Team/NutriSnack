import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';

import productsData from '@/data/products.json';

export function UploadBox({ onUploadSuccess }: { onUploadSuccess: (productId: number) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    
    // Attempt to match the uploaded file name to a product in the database
    let fileName = acceptedFiles[0].name.toLowerCase();
    
    // If the user uploads a back-of-pack label (e.g., '5 star label.png'), 
    // strip the ' label' part so it correctly matches the front-of-pack image name ('5 star.png')
    fileName = fileName.replace(' label.', '.');

    const matchedProduct = (productsData as any[]).find(p => 
      p.image && p.image.toLowerCase() === fileName
    );
    
    // Fallback to ID 25 (Treat Orange) if the image isn't in the database
    const finalProductId = matchedProduct ? matchedProduct.id : 25;

    // Simulate OCR and API delay
    setTimeout(() => {
      setIsUploading(false);
      setSuccess(true);
      setTimeout(() => {
        onUploadSuccess(finalProductId);
      }, 500);
    }, 2000);
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    maxFiles: 1 
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
        isDragActive ? 'border-primary bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
      } ${success ? 'border-green-500 bg-green-50' : 'bg-white'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        {isUploading ? (
          <>
            <div className="p-4 bg-primary/10 rounded-full">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Analyzing Product...</h3>
            <p className="text-sm text-gray-500">Extracting nutrition facts and ingredients</p>
          </>
        ) : success ? (
          <>
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Analysis Complete</h3>
          </>
        ) : (
          <>
            <div className="p-4 bg-gray-100 rounded-full group-hover:bg-green-100 transition-colors">
              <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Upload Product Image</h3>
              <p className="text-sm text-gray-500">Drag and drop, or click to browse</p>
            </div>
            <p className="text-xs text-gray-400">Supports JPG, PNG, WEBP (Max 5MB)</p>
          </>
        )}
      </div>
    </div>
  );
}
