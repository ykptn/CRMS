export function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString('tr-TR');
  } catch {
    return value;
  }
}
