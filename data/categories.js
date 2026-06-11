import wine from './wine.js';
import whisky from './whisky.js';
import coffee from './coffee.js';
import brandy from './brandy.js';
import sake from './sake.js';
import cascalate from './cascalate.js';

export const CATEGORIES = [wine, whisky, coffee, brandy, sake, cascalate];

export function getCategory(id) {
  return CATEGORIES.find(c => c.id === id) || null;
}
