// Simple client-side template storage using localStorage keyed by user ID
// This is a lightweight fallback until a backend "saved templates" feature is implemented.

const STORAGE_PREFIX = 'consumerai_saved_templates_';

export function saveTemplate(userId: string, template: any) {
  if (!userId) throw new Error('User ID is required');
  const key = STORAGE_PREFIX + userId;
  const raw = localStorage.getItem(key);
  let list: any[] = [];
  try {
    list = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Corrupted saved templates, resetting', e);
    list = [];
  }

  // Avoid duplicates by id
  if (!list.find((t) => t.id === template.id)) {
    list.unshift(template);
  }

  // Limit to 200 saved templates to prevent abuse
  if (list.length > 200) list = list.slice(0, 200);

  localStorage.setItem(key, JSON.stringify(list));
}

export function getSavedTemplates(userId: string) {
  if (!userId) return [];
  const key = STORAGE_PREFIX + userId;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Error reading saved templates:', e);
    return [];
  }
}

export function removeSavedTemplate(userId: string, templateId: string) {
  if (!userId) return;
  const key = STORAGE_PREFIX + userId;
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const newList = list.filter((t: any) => t.id !== templateId);
    localStorage.setItem(key, JSON.stringify(newList));
  } catch (e) {
    console.warn('Failed to remove saved template:', e);
  }
}
