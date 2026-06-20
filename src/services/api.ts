import type { Package, CalculationRequest, CalculationResult } from '../types';

const API_BASE = '/api/packages';

export async function fetchPackages(): Promise<Package[]> {
  const res = await fetch(API_BASE);
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || '获取套餐列表失败');
}

export async function createPackage(pkg: Omit<Package, 'id' | 'createdAt'>): Promise<Package> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pkg),
  });
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || '创建套餐失败');
}

export async function updatePackage(id: string, updates: Partial<Package>): Promise<Package> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || '更新套餐失败');
}

export async function deletePackage(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || '删除套餐失败');
  }
}

export async function reorderPackages(ids: string[]): Promise<Package[]> {
  const res = await fetch(`${API_BASE}/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || '排序失败');
}

export async function calculatePrice(request: CalculationRequest): Promise<CalculationResult> {
  const res = await fetch(`${API_BASE}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return await res.json();
}

export async function validateSize(packageId: string, petSize: string): Promise<{ allowed: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/validate-size`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packageId, petSize }),
  });
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || '验证失败');
}
