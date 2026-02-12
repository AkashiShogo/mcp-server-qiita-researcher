/**
 * HTML cleanup utilities using cheerio
 * Removes token-heavy elements while preserving readable content
 */

import * as cheerio from 'cheerio';

/**
 * Clean HTML by removing token-heavy elements and converting to text
 * @param html - Raw HTML content
 * @returns Cleaned text content
 */
export function cleanHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove token-heavy elements
  $('iframe, script, style').remove();

  // Replace images with text references
  $('img').each((_, elem) => {
    const src = $(elem).attr('src');
    if (src?.startsWith('data:')) {
      // Remove data URIs entirely (very token-heavy)
      $(elem).remove();
    } else if (src) {
      // Keep external image URLs as text references
      $(elem).replaceWith(`[画像: ${src}]`);
    } else {
      $(elem).remove();
    }
  });

  // Extract clean text
  const text = $('body').text();

  // Normalize whitespace
  return text
    .replace(/\n\n+/g, '\n\n')  // Multiple newlines -> double newline
    .replace(/[ \t]+/g, ' ')     // Multiple spaces/tabs -> single space
    .trim();
}
