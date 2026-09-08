/**
 * Creates a standard direct WhatsApp URL with pre-filled message text.
 * Works on both mobile WhatsApp app and Web WhatsApp desktop.
 */
export function getWhatsAppShareUrl(messageText: string, phoneNumber?: string): string {
  const encodedText = encodeURIComponent(messageText);
  if (phoneNumber) {
    const cleanedPhone = phoneNumber.replace(/[^00-9]/g, '');
    return `https://wa.me/${cleanedPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Copy text to clipboard safely
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}
