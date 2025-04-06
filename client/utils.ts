import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDateToLocal(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const dateOptions = { ...defaultOptions, ...options };
  const dateToFormat = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', dateOptions).format(dateToFormat);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-amber-500 bg-amber-50';
    case 'processing':
      return 'text-blue-500 bg-blue-50';
    case 'shipped':
      return 'text-purple-500 bg-purple-50';
    case 'delivered':
      return 'text-green-500 bg-green-50';
    case 'cancelled':
      return 'text-red-500 bg-red-50';
    default:
      return 'text-gray-500 bg-gray-50';
  }
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function generateImagePlaceholder(text: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&background=6b46c1&color=fff&size=256`;
}

export function getRandomColor(): string {
  const colors = [
    'bg-red-100 text-red-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'thrifted':
      return 'bg-blue-100 text-blue-700';
    case 'handcrafted':
      return 'bg-primary-100 text-primary-700';
    case 'artisanal':
      return 'bg-yellow-100 text-yellow-700';
    case 'pre_order':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function formatCategoryName(category: string | undefined): string {
  if (!category) return '';
  return category.charAt(0).toUpperCase() + category.slice(1).replace('_', '-');
}
