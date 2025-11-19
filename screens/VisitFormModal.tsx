
import React, { useState, useEffect, useRef } from 'react';
import { Spot, Visit, Photo } from '../types';
import { Icon } from '../constants';
import { supabase } from '../lib/supabase';

interface VisitFormModalProps {
  spot: Spot;
  visit?: Visit; // Make visit optional for new entries
  onClose: () => void;
  onSave: (spotId: string, visit: Visit) => void;
}

const FormField: React.FC<{ label: string, children: React.ReactNode, error?: string }> = ({ label, children, error }) => (
    <div>
        <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">{label}</label>
        <div className={`mt-2 ${error ? 'border-red-500' : ''}`}>{children}</div>
        {error && <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>}
    </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }> = ({ error, className, ...props }) => (
    <input 
        {...props} 
        className={`w-full h-12 px-4 rounded-xl border-2 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-neutral-200 dark:border-neutral-700 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/20'} bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 transition duration-200 ${className}`} 
    />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea
        {...props}
        rows={4}
        className="w-full p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition duration-200"
    />
);

const RatingInput: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => (
    <div className="flex items-center justify-center gap-2 py-2">
        {[1, 2, 3, 4, 5].map(star => (
            <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95"
            >
                <Icon name="star" className={`w-10 h-10 ${rating >= star ? 'text-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`} />
            </button>
        ))}
    </div>
);

const PhotoUploader: React.FC<{ photos: Photo[], setPhotos: React.Dispatch<React.SetStateAction<Photo[]>> }> = ({ photos, setPhotos }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleAddClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const files: File[] = Array.from(fileList);
        setUploading(true);
        
        for (const file of files) {
             try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload to Supabase
                const { error: uploadError } = await supabase.storage
                    .from('photos')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('photos')
                    .getPublicUrl(filePath);

                const newPhoto: Photo = {
                    id: `new-visit-${Date.now()}-${Math.random()}`,
                    url: publicUrl,
                };
                setPhotos(prev => [...prev, newPhoto]);

            } catch (error) {
                console.error('Error uploading image:', error);
                alert('画像のアップロードに失敗しました');
            }
        }
        setUploading(false);
    };
    
    const handleDelete = (id: string) => {
      setPhotos(photos.filter(p => p.id !== id));
    }
    
    return (
        <div>
            <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <div className="grid grid-cols-4 gap-3">
                {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={photo.url} alt="upload preview" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <button 
                          type="button" 
                          onClick={() => handleDelete(photo.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all scale-90 group-hover:scale-100"
                        >
                          <Icon name="x-mark" className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddClick}
                    disabled={uploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-400 dark:text-neutral-500 flex flex-col items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                    {uploading ? <div className="animate-spin h-6 w-6 border-2 border-neutral-400 rounded-full border-t-transparent"></div> : <Icon name="photo" className="w-8 h-8" />}
                    <span className="text-xs font-semibold mt-1">{uploading ? '...' : '追加'}</span>
                </button>
            </div>
        </div>
    );
};


const VisitFormModal: React.FC<VisitFormModalProps> = ({ spot, visit, onClose, onSave }) => {
  const [visitedAt, setVisitedAt] = useState(new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState(3);
  const [bill, setBill] = useState('');
  const [memo, setMemo] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const isEditing = !!visit;

  useEffect(() => {
    if (visit) {
      setVisitedAt(new Date(visit.visitedAt).toISOString().split('T')[0]);
      setRating(visit.rating);
      setBill(visit.bill?.toString() || '');
      setMemo(visit.memo);
      setPhotos(visit.photos || []);
    }
  }, [visit]);

  const validate = () => {
      const newErrors: {[key: string]: string} = {};
      if (!visitedAt) {
          newErrors.visitedAt = '訪問日は必須です。';
      }
      if (bill && (isNaN(parseFloat(bill)) || parseFloat(bill) < 0)) {
          newErrors.bill = '費用は0以上の数値を入力してください。';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const visitData: Visit = {
      id: visit?.id || `new-${Date.now()}`, // Temporary ID for App.tsx to handle
      visitedAt,
      rating,
      memo,
      bill: bill ? parseFloat(bill) : undefined,
      photos,
    };
    onSave(spot.id, visitData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-neutral-50 dark:bg-neutral-900 rounded-2xl flex flex-col animate-slide-up-fast overflow-hidden shadow-2xl">
        <header className="flex-shrink-0 flex items-center p-4 border-b border-neutral-200 dark:border-neutral-700/80">
          <button onClick={onClose} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <Icon name="x-mark" className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-center flex-1">{isEditing ? '訪問記録を編集' : '訪問記録を追加'}</h1>
          <button form="visit-form" type="submit" className="px-5 py-2 rounded-full bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold text-sm shadow-md shadow-[#FF5252]/30 transition-transform active:scale-95">
            保存
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <form id="visit-form" onSubmit={handleSubmit} className="space-y-6 p-4">
            <FormField label="訪問日" error={errors.visitedAt}>
              <TextInput error={!!errors.visitedAt} type="date" value={visitedAt} onChange={e => setVisitedAt(e.target.value)} required />
            </FormField>

            <FormField label="評価">
              <RatingInput rating={rating} setRating={setRating} />
            </FormField>
            
            <FormField label="写真">
                <PhotoUploader photos={photos} setPhotos={setPhotos} />
            </FormField>

            <FormField label="費用" error={errors.bill}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">¥</span>
                <TextInput
                  error={!!errors.bill}
                  type="number"
                  placeholder="0"
                  value={bill}
                  onChange={e => setBill(e.target.value)}
                  className="pl-8"
                />
              </div>
            </FormField>

            <FormField label="メモ">
              <TextArea placeholder="楽しかったこと、美味しかったものなど..." value={memo} onChange={e => setMemo(e.target.value)} />
            </FormField>
          </form>
        </main>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up-fast { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes slideUp { from { transform: translateY(30px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default VisitFormModal;
