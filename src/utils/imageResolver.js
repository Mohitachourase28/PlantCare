// Resolve images from `src/assets` at build time using Vite's import.meta.glob
// Returns a URL for known asset names, and leaves absolute paths untouched.
const modules = import.meta.glob('../assets/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' });

const imageMap = Object.fromEntries(
  Object.keys(modules).map((key) => {
    const name = key.split('/').pop();
    return [name, modules[key]];
  })
);

export function resolveImagePath(imageString) {
  if (!imageString) return '/images/placeholder.jpg';
  // If already an absolute path (public) or remote URL, return as-is
  if (imageString.startsWith('/') || imageString.startsWith('http')) return imageString;

  // If the string includes a path, take the basename
  const parts = imageString.split('/');
  const name = parts[parts.length - 1];
  return imageMap[name] || imageString;
}

export default resolveImagePath;
