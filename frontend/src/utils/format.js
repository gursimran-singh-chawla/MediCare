export function formatDateTime(value) {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export const frequencies = ['OD', 'BD', 'TDS', 'QID', 'SOS', 'HS', 'Other'];

export const emptyMedicine = () => ({ name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' });
