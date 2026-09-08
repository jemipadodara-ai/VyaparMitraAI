import { ExtractedTaskData } from '../types';

export function exportTasksToCsv(tasks: ExtractedTaskData[], filename = 'vyaparmitra_tasks.csv') {
  if (!tasks || tasks.length === 0) return;

  const headers = [
    'Customer Name',
    'Action Type',
    'Items & Quantity',
    'Amount',
    'Payment Status',
    'Due Date',
    'Priority',
    'Status',
    'Summary (Gujarati)',
    'Summary (English)',
    'WhatsApp Message',
    'Created At',
  ];

  const escapeCell = (cell: any) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = tasks.map((t) => [
    escapeCell(t.customerName),
    escapeCell(t.actionType),
    escapeCell(t.itemsQuantity),
    escapeCell(t.formattedAmount || t.amount || '₹0'),
    escapeCell(t.paymentStatus),
    escapeCell(t.dueDateLabel || t.dueDate),
    escapeCell(t.priority),
    escapeCell(t.status),
    escapeCell(t.summaryGujarati),
    escapeCell(t.summary),
    escapeCell(t.whatsappMessage),
    escapeCell(t.createdAt || new Date().toISOString()),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
