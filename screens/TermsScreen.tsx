
import React from 'react';
import { Icon } from '../constants';

interface TermsScreenProps {
  onBack: () => void;
}

const TermsScreen: React.FC<TermsScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 animate-fade-in flex flex-col">
      <header className="sticky top-0 z-50 flex items-center p-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-700/80" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Icon name="arrow-left" className="w-6 h-6 text-neutral-800 dark:text-neutral-100" />
        </button>
        <h1 className="text-lg font-bold text-center flex-1 -ml-10 text-neutral-900 dark:text-neutral-100">利用規約</h1>
      </header>
      
      <main className="flex-1 p-6 pb-20">
        <div className="max-w-2xl mx-auto prose dark:prose-invert">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">最終更新日: 2025年2月17日</p>
            
            <h2 className="text-xl font-bold mb-4">1. はじめに</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                本利用規約（以下「本規約」）は、とこメモ（以下「本アプリ」）の利用条件を定めるものです。本アプリを利用するユーザーは、本規約に同意したものとみなされます。
            </p>

            <h2 className="text-xl font-bold mb-4">2. アカウント登録</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                本アプリの利用には、メールアドレスとパスワードによるアカウント登録が必要です。ユーザーは、自己の責任においてアカウント情報を管理するものとします。
            </p>

            <h2 className="text-xl font-bold mb-4">3. ペアリング機能とデータ共有</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                本アプリには、他のユーザーとデータを共有する「ペアリング機能」があります。
                ペアリングを行うことで、ユーザーが「共有」に設定したスポット情報は、パートナーに公開されます。
                ペアリングを解除すると、共有設定されたスポットは複製され、それぞれの個人リストとして保持されます。
            </p>

            <h2 className="text-xl font-bold mb-4">4. AI機能に関する免責事項</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                本アプリは、Google Gemini APIを利用した情報補完機能を提供します。
                AIによって生成された情報（営業時間、住所、価格帯など）は、必ずしも正確であるとは限りません。
                ユーザーは、AI生成情報を自己の責任において確認し、利用するものとします。
            </p>

            <h2 className="text-xl font-bold mb-4">5. 画像データの取り扱い</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                ユーザーがアップロードした画像は、クラウドストレージに保存されます。
                公序良俗に反する画像、著作権を侵害する画像のアップロードは禁止されています。
                違反が確認された場合、運営者は事前の通知なく画像を削除し、アカウントを停止する権利を有します。
            </p>

            <h2 className="text-xl font-bold mb-4">6. 禁止事項</h2>
            <ul className="list-disc pl-5 mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 space-y-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>他のユーザーへの迷惑行為</li>
                <li>本アプリのサーバーやネットワークに過度な負荷をかける行為</li>
                <li>リバースエンジニアリング等の解析行為</li>
            </ul>

            <h2 className="text-xl font-bold mb-4">7. 免責事項</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                本アプリの利用により生じた損害について、運営者は一切の責任を負いません。
                本アプリは、予告なくサービスの変更、停止、終了を行うことがあります。
            </p>
        </div>
      </main>
       <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default TermsScreen;
