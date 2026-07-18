import { MenuCategory } from '../types/menu';
import { request } from './client';

export function getMenu(): Promise<MenuCategory[]> {
  return request<MenuCategory[]>('/menu');
}

export function getCategories(): Promise<string[]> {
  return request<string[]>('/menu/categories');
}
