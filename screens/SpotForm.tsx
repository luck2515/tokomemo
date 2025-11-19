import React, { useState, useEffect, useRef } from 'react';
import { Spot, Photo, AppScreen } from '../types';
import { Icon } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '../lib/supabase';

interface SpotFormProps {
  spot?: Spot;
  onClose: () => void;
  onSave: (spot: Partial<Spot> & { id?: string }) => void;
  onNavigate: (screen: AppScreen) => void;
}

const FormField: React.FC<{ label: string, children: React.ReactNode, description?: string }> = ({ label, children, description }) => (
    <div>
        <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">{label}</label>
        {description && <p className="text-xs text-neutral-500 mt-1">{description}</p>}
        <div className="mt-2">{children}</div>
    </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props} 
        className={`w-full h-12 px-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition duration-200 ${props.className}`} 
    />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea
        {...props}
        rows={4}
        className="w-full p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition duration-200"
    />
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
                    id: `new-spot-${Date.now()}-${Math.random()}`, // Temporary ID used in App.tsx logic
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
            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <div className="grid grid-cols-4 gap-3">
                {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={photo.url} alt="upload preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <button type="button" onClick={() => handleDelete(photo.id)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all scale-90 group-hover:scale-100">
                          <Icon name="x-mark" className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddClick} disabled={uploading} className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-400 dark:text-neutral-500 flex flex-col items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    {uploading ? <div className="animate-spin h-6 w-6 border-2 border-neutral-400 rounded-full border-t-transparent"></div> : <Icon name="photo" className="w-8 h-8" />}
                    <span className="text-xs font-semibold mt-1">{uploading ? '...' : '追加'}</span>
                </button>
            </div>
        </div>
    );
};

const TagInput: React.FC<{ tags: string[], setTags: (tags: string[]) => void }> = ({ tags, setTags }) => {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInputValue('');
        }
    };
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };
    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full text-sm font-medium">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                            <Icon name="x-mark" className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <TextInput
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="タグを入力してEnter"
            />
        </div>
    );
};


const SpotForm: React.FC<SpotFormProps> = ({ spot, onClose, onSave, onNavigate }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [memo, setMemo] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const isEditing = !!spot;

  useEffect(() => {
    if (spot) {
      setName(spot.name || '');
      setUrl(spot.url || '');
      setMemo(spot.memo || '');
      setAddress(spot.address || '');
      setPhone(spot.phone || '');
      setTags(spot.tags || []);
      setPhotos(spot.photos || []);
    }
  }, [spot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('スポット名は必須です。');
      return;
    }
    const spotData: Partial<Spot> & { id?: string } = {
      id: spot?.id, name, url, memo, address, phone, tags, photos
    };
    onSave(spotData);
    onClose();
  };
  
    const handleAiFetch = async () => {
    if (!url) {
      alert("URLを入力してください。");
      return;
    }
    setIsAiLoading(true);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the place." },
          address: { type: Type.STRING, description: "The full address of the place." },
          phone: { type: Type.STRING, description: "The phone number of the place." },
          openingHours: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of opening hours for each day." },
          tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant tags for the place, like 'cafe', 'ramen', etc." },
          memo: { type: Type.STRING, description: "A brief, interesting summary or description of the place." },
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Extract key information for a restaurant, shop, or point of interest from the content of this URL: ${url}. Please provide details for the following fields. If information is not available, return an empty string or array for that field.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const jsonStr = response.text.trim();
      const completionData = JSON.parse(jsonStr) as Partial<Spot>;
      
      if (spot?.id) {
         onNavigate({ view: 'ai-completion', spotId: spot.id, completionData });
      } else {
        setName(prev => completionData.name || prev);
        setAddress(prev => completionData.address || prev);
        setPhone(prev => completionData.phone || prev);
        setMemo(prev => completionData.memo || prev);
        setTags(current => [...new Set([...current, ...(completionData.tags || [])])]);
        alert('AIによる情報補完が完了しました。内容を確認して保存してください。');
      }

    } catch (error) {
      console.error("AI fetch failed:", error);
      alert("情報の取得に失敗しました。URLが正しいか確認してください。");
    } finally {
      setIsAiLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-neutral-50 dark:bg-neutral-900 animate-slide-up-fast flex flex-col">
      <header className="flex-shrink-0 flex items-center p-2 border-b border-neutral-200 dark:border-neutral-700/80" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Icon name="x-mark" className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-center flex-1">{isEditing ? 'スポットを編集' : 'スポットを追加'}</h1>
        <button form="spot-form" type="submit" className="px-5 py-2 rounded-full bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold text-sm shadow-md shadow-[#FF5252]/30 transition-transform active:scale-95">
          保存
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <form id="spot-form" onSubmit={handleSubmit} className="space-y-6 p-4">
          <FormField label="スポット名 *">
            <TextInput type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="例：ブルーボトルコーヒー 渋谷カフェ" />
          </FormField>
          
          <FormField label="写真">
              <PhotoUploader photos={photos} setPhotos={setPhotos} />
          </FormField>

          <FormField label="URL" description="URLからAIが情報を自動入力できます">
             <div className="flex items-center gap-2">
                <TextInput type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
                <button type="button" onClick={handleAiFetch} disabled={isAiLoading} className="h-12 px-4 rounded-xl bg-neutral-200 dark:bg-neutral-700 font-semibold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-2 flex-shrink-0 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50 active:scale-95">
                    <Icon name="sparkles" className={`w-5 h-5 ${isAiLoading ? 'animate-spin' : ''}`} />
                    <span>{isAiLoading ? '取得中' : 'AI補完'}</span>
                </button>
            </div>
          </FormField>
          
          <FormField label="タグ">
            <TagInput tags={tags} setTags={setTags} />
          </FormField>
          
          <FormField label="メモ">
            <TextArea placeholder="この場所についてのメモ..." value={memo} onChange={e => setMemo(e.target.value)} />
          </FormField>

          <FormField label="住所">
            <TextInput type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="東京都渋谷区..." />
          </FormField>
          
          <FormField label="電話番号">
            <TextInput type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="03-1234-5678" />
          </FormField>
          
        </form>
      </main>
      <style>{`
        .animate-slide-up-fast { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default SpotForm;