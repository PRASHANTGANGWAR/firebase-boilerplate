export function generateUniqueSlug() {
  const vowels = 'AEIOU';
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';

  while (true) {
    // Generate a new slug following the pattern
    let slug = '';
    slug += consonants.charAt(Math.floor(Math.random() * consonants.length));
    slug += vowels.charAt(Math.floor(Math.random() * vowels.length));
    slug += consonants.charAt(Math.floor(Math.random() * consonants.length));
    slug += vowels.charAt(Math.floor(Math.random() * vowels.length));
    slug += consonants.charAt(Math.floor(Math.random() * consonants.length));
    slug += vowels.charAt(Math.floor(Math.random() * vowels.length));
    return slug;
  }
}
