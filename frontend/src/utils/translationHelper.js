/**
 * Gets the localized value for a multi-language field.
 *
 * @param {object} field - The field object with language keys (e.g., { en: 'Hello', fi: 'Hei' }).
 * @param {string} lang - The current language code (e.g., 'fi').
 * @returns {string} The localized value, falling back to English.
 */
export const getLocalizedValue = (field, lang) => {
  if (!field) {
    return '';
  }
  return field[lang] || field.en || '';
};
