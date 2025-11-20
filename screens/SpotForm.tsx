
import React, { useState, useEffect, useRef } from 'react';
import { Spot, Photo, AppScreen } from '../types';
import { Icon } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../lib/supabase';

interface SpotFormProps {
  spot?: Spot;
  onClose: () => void;
  onSave: (spot: Partial<Spot> & { id?: string }) => void;
  onNavigate: (screen: AppScreen) => void;
  checkStorageLimit: (additional?: number) => boolean;
  checkAiLimit: () => boolean;
  incrementAiUsage: () => void;
}

const FormField: React.FC<{ label: string, children: React.ReactNode, description?: string, error?: string }> = ({ label, children, description, error }) => (
    <div>
        <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">{label}</label>
        {description && <p className="text-xs text-neutral-500 mt-1">{description}</p>}
        <div className={`mt-2 ${error ? 'border-red-500' : ''}`}>{children}</div>
        {error && <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>}
    </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }> = ({ error, className, ...props }) => (
    <input 
        {...props} 
        className={`w-full h-12 px-4 rounded-xl border-2 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-neutral-200 dark:border-neutral-700 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/20'} bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 transition duration-200 ${className}`} 
    />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea
        {...props}
        rows={4}
        className="w-full p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition duration-200"
    />
);

const PhotoUploader: React.FC<{ photos: Photo[], setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>, checkLimit: (n: number) => boolean }> = ({ photos, setPhotos, checkLimit }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleAddClick = () => fileInputRef.current?.click();
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;
        
        if (!checkLimit(fileList.length)) {
            // Reset input
            e.target.value = '';
            return;
        }

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
        e.target.value = '';
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


const SpotForm: React.FC<SpotFormProps> = ({ spot, onClose, onSave, onNavigate, checkStorageLimit, checkAiLimit, incrementAiUsage }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [memo, setMemo] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  
  // Additional details
  const [openingHours, setOpeningHours] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [paymentMethods, setPaymentMethods] = useState('');

  const [errors, setErrors] = useState<{[key: string]: string}>({});
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
      setOpeningHours(spot.openingHours ? spot.openingHours.join('\n') : '');
      setPriceMin(spot.priceMin?.toString() || '');
      setPriceMax(spot.priceMax?.toString() || '');
      setPaymentMethods(spot.paymentMethods ? spot.paymentMethods.join(', ') : '');
    }
  }, [spot]);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
        newErrors.name = 'スポット名は必須です。';
    }

    if (url && !url.startsWith('http')) {
        newErrors.url = 'URLは http または https で始まる必要があります。';
    }

    if (phone && !/^[0-9-+\s()]+$/.test(phone)) {
        newErrors.phone = '電話番号の形式が正しくありません。';
    }

    if (priceMin && priceMax && parseInt(priceMin) > parseInt(priceMax)) {
        newErrors.price = '最低予算は最高予算以下である必要があります。';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const spotData: Partial<Spot> & { id?: string } = {
      id: spot?.id, 
      name, 
      url, 
      memo, 
      address, 
      phone, 
      tags, 
      photos,
      openingHours: openingHours ? openingHours.split('\n').filter(s => s.trim()) : undefined,
      priceMin: priceMin ? parseInt(priceMin) : undefined,
      priceMax: priceMax ? parseInt(priceMax) : undefined,
      paymentMethods: paymentMethods ? paymentMethods.split(',').map(s => s.trim()).filter(s => s) : undefined
    };
    onSave(spotData);
    onClose();
  };
  
  const handleAiFetch = async () => {
    if (!url) {
      setErrors(prev => ({ ...prev, url: "URLを入力してください。" }));
      return;
    }
    
    if (!checkAiLimit()) return;

    setIsAiLoading(true);
    setErrors({});

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
          以下のURLについて、Google検索を行い、店舗または場所の詳細情報を抽出してください。
          
          URL: ${url}

          必ず以下のJSONフォーマットで出力してください。JSON以外のテキストは含めないでください。
          
          \`\`\`json
          {
            "name": "店舗名",
            "address": "住所",
            "phone": "電話番号",
            "openingHours": ["月-金: 10:00-18:00", ...],
            "tags": ["カフェ", "電源あり", ...],
            "memo": "店舗の魅力や特徴の要約",
            "priceMin": 1000,
            "priceMax": 2000,
            "paymentMethods": ["VISA", "PayPay", ...],
            "recommendations": "おすすめメニューなど",
            "access": "最寄り駅からのアクセス"
          }
          \`\`\`
        `,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
          throw new Error("Could not parse AI response");
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const rawData = JSON.parse(jsonStr);

      let mergedMemo = rawData.memo || "";
      if (rawData.recommendations) {
          mergedMemo += `\n\n【おすすめ】\n${rawData.recommendations}`;
      }
      if (rawData.access) {
          mergedMemo += `\n\n【アクセス】\n${rawData.access}`;
      }
      
      const completionData: Partial<Spot> = {
          name: rawData.name,
          address: rawData.address,
          phone: rawData.phone,
          tags: rawData.tags,
          openingHours: rawData.openingHours,
          priceMin: rawData.priceMin,
          priceMax: rawData.priceMax,
          paymentMethods: rawData.paymentMethods,
          memo: mergedMemo,
      };
      
      if (spot?.id) {
         // If editing, go to confirm modal (which counts usage on apply)
         onNavigate({ view: 'ai-completion', spotId: spot.id, completionData });
      } else {
        // If creating new, just fill details and count usage
        setName(prev => completionData.name || prev);
        setAddress(prev => completionData.address || prev);
        setPhone(prev => completionData.phone || prev);
        setMemo(prev => completionData.memo || prev);
        setTags(current => [...new Set([...current, ...(completionData.tags || [])])]);
        setOpeningHours(prev => completionData.openingHours ? completionData.openingHours.join('\n') : prev);
        setPriceMin(prev => completionData.priceMin?.toString() || prev);
        setPriceMax(prev => completionData.priceMax?.toString() || prev);
        setPaymentMethods(prev => completionData.paymentMethods ? completionData.paymentMethods.join(', ') : prev);
        
        incrementAiUsage();
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
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[95vh] bg-neutral-50 dark:bg-neutral-900 rounded-t-2xl flex flex-col animate-slide-up-fast">
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
            <form id="spot-form" onSubmit={handleSubmit} className="space-y-6 p-4 pb-20">
            <FormField label="スポット名 *" error={errors.name}>
                <TextInput error={!!errors.name} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：ブルーボトルコーヒー 渋谷カフェ" />
            </FormField>
            
            <FormField label="写真">
                <PhotoUploader photos={photos} setPhotos={setPhotos} checkLimit={checkStorageLimit} />
            </FormField>

            <FormField label="URL" description="URLからAIが情報を自動入力できます" error={errors.url}>
                <div className="flex items-center gap-2">
                    <TextInput error={!!errors.url} type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
                    <button type="button" onClick={handleAiFetch} disabled={isAiLoading} className="h-12 px-4 rounded-xl bg-neutral-200 dark:bg-neutral-700 font-semibold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-2 flex-shrink-0 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50 active:scale-95">
                        <Icon name="sparkles" className={`w-5 h-5 ${isAiLoading ? 'animate-spin' : ''}`} />
                        <span>{isAiLoading ? '取得中' : 'AI補完'}</span>
                    </button>
                </div>
            </FormField>
            
            <FormField label="タグ">
                <TagInput tags={tags} setTags={setTags} />
            </FormField>
            
            <FormField label="メモ (概要・おすすめ・アクセス)">
                <TextArea placeholder="この場所についてのメモ..." value={memo} onChange={e => setMemo(e.target.value)} />
            </FormField>

            <FormField label="住所">
                <TextInput type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="東京都渋谷区..." />
            </FormField>
            
            <FormField label="電話番号" error={errors.phone}>
                <TextInput error={!!errors.phone} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="03-1234-5678" />
            </FormField>

            <FormField label="営業時間・定休日">
                <TextArea rows={3} value={openingHours} onChange={e => setOpeningHours(e.target.value)} placeholder="月-金: 10:00-20:00&#13;&#10;土日: 11:00-21:00" />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="最低予算" error={errors.price}>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">¥</span>
                        <TextInput type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="pl-7" placeholder="1000" />
                    </div>
                </FormField>
                <FormField label="最高予算">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">¥</span>
                        <TextInput type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="pl-7" placeholder="3000" />
                    </div>
                </FormField>
            </div>

            <FormField label="支払い方法">
                <TextInput type="text" value={paymentMethods} onChange={e => setPaymentMethods(e.target.value)} placeholder="VISA, PayPay, 現金..." />
            </FormField>
            
            </form>
        </main>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up-fast { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default SpotForm;
