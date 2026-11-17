import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTicketCode(): string {
  const year = new Date().getFullYear();
  const chars = '0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ASP-${year}-${randomPart}`;
}

export function getDefaultPassword(nimNip: string): string {
  return `Uin${nimNip.trim()}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(d) + ' WIB';
}

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasNoSpaces: boolean;
  error?: string;
}

export function validatePasswordRules(password: string): PasswordValidationResult {
  const pwd = password || '';
  const hasMinLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`^]/.test(pwd);
  const hasNoSpaces = pwd.length > 0 && !/\s/.test(pwd);

  const isValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSymbol &&
    hasNoSpaces;

  let error: string | undefined;
  if (!pwd) {
    error = 'Password baru wajib diisi.';
  } else if (!hasMinLength) {
    error = 'Password baru minimal harus 8 karakter.';
  } else if (!hasUppercase) {
    error = 'Password harus mengandung minimal 1 huruf besar (A-Z).';
  } else if (!hasLowercase) {
    error = 'Password harus mengandung minimal 1 huruf kecil (a-z).';
  } else if (!hasNumber) {
    error = 'Password harus mengandung minimal 1 angka (0-9).';
  } else if (!hasSymbol) {
    error = 'Password harus mengandung minimal 1 simbol / karakter khusus (!@#$%^&* dll).';
  } else if (!hasNoSpaces) {
    error = 'Password tidak boleh mengandung spasi.';
  }

  return {
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
    hasNoSpaces,
    error,
  };
}
