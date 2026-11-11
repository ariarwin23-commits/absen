import React from 'react';
import { User, LogOut, CheckCircle2, Cloud } from 'lucide-react';

interface GoogleSignInButtonProps {
  currentUser: any | null;
  isLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  hasSheetsToken: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  currentUser,
  isLoading,
  onSignIn,
  onSignOut,
  hasSheetsToken,
}) => {
  if (currentUser) {
    return (
      <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-sm text-xs">
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'Google User'}
            className="w-6 h-6 rounded-full border border-indigo-400"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
            {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'G'}
          </div>
        )}
        <div className="hidden sm:flex flex-col text-left">
          <span className="font-semibold text-slate-200 truncate max-w-[120px]">
            {currentUser.displayName || currentUser.email?.split('@')[0]}
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Google Sheets Aktif
          </span>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          title="Keluar dari Akun Google"
          className="ml-1 p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSignIn}
      disabled={isLoading}
      className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium text-xs px-3 py-1.5 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
      title="Login dengan Google untuk Sinkronisasi Langsung ke Google Sheets API"
    >
      <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 48 48" className="w-4 h-4">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
      </div>
      <span>{isLoading ? 'Menghubungkan...' : 'Login Google'}</span>
    </button>
  );
};
