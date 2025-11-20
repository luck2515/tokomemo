
import React from 'react';
import { Icon } from '../constants';

interface PrivacyScreenProps {
  onBack: () => void;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 animate-fade-in flex flex-col">
      <header className="sticky top-0 z-50 flex items-center p-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-700/80" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Icon name="arrow-left" className="w-6 h-6 text-neutral-800 dark:text-neutral-100" />
        </button>
        <h1 className="text-lg font-bold text-center flex-1 -ml-10 text-neutral-900 dark:text-neutral-100">プライバシーポリシー</h1>
      </header>
      
      <main className="flex-1 p-6 pb-20">
        <div className="max-w-2xl mx-auto prose dark:prose-invert">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">最終更新日: 2025年2月17日</p>
            
            <h2 className="text-xl font-bold mb-4">1. 収集する情報</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                本アプリは、以下の情報を収集します。
            </p>
            <ul className="list-disc pl-5 mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 space-y-1">
                <li>アカウント情報（メールアドレス）</li>
                <li>ユーザーが作成したコンテンツ（スポット情報、メモ、画像）</li>
                <li>利用ログ（AI機能の利用回数など）</li>
            </ul>

            <h2 className="text-xl font-bold mb-4">2. 情報の利用目的</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                収集した情報は、以下の目的で利用します。
            </p>
            <ul className="list-disc pl-5 mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 space-y-1">
                <li>本アプリの機能提供（認証、データ保存、共有）</li>
                <li>AI機能による情報補完</li>
                <li>サービスの改善および新機能の開発</li>
                <li>不正利用の防止</li>
            </ul>

            <h2 className="text-xl font-bold mb-4">3. 第三者への提供</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                本アプリは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
            </p>
            <ul className="list-disc pl-5 mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 space-y-1">
                <li>ユーザーの同意がある場合（ペアリング機能によるパートナーへの共有を含む）</li>
                <li>法令に基づく場合</li>
                <li>外部サービスプロバイダー（Supabase, Google AI等）を利用する場合</li>
            </ul>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                なお、AI機能の利用にあたり、入力されたURL等の情報はGoogle Gemini APIに送信されますが、学習データとしては利用されません。
            </p>

            <h2 className="text-xl font-bold mb-4">4. データの保存とセキュリティ</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                ユーザーデータは、Supabase Inc.が提供するデータベースおよびストレージに安全に保存されます。
                通信はすべてSSL/TLSにより暗号化されています。
            </p>

            <h2 className="text-xl font-bold mb-4">5. クッキーおよびローカルストレージ</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                本アプリは、ログイン状態の保持や設定の保存のために、クッキー(Cookies)およびローカルストレージを使用します。
            </p>

            <h2 className="text-xl font-bold mb-4">6. お問い合わせ</h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                本ポリシーに関するお問い合わせは、アプリ内の設定画面にあるサポートまでご連絡ください。
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

export default PrivacyScreen;
