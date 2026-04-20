/**
 * Levenshtein edit distance between two strings.
 * Iterative two-row implementation — O(m*n) time, O(min(m,n)) space.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure `a` is the shorter string so the inner row is as small as possible.
  if (a.length > b.length) {
    const swap = a;
    a = b;
    b = swap;
  }

  const m = a.length;
  const n = b.length;
  let prev = new Array<number>(m + 1);
  let curr = new Array<number>(m + 1);

  for (let i = 0; i <= m; i++) prev[i] = i;

  for (let j = 1; j <= n; j++) {
    curr[0] = j;
    const bj = b.charCodeAt(j - 1);
    for (let i = 1; i <= m; i++) {
      const cost = a.charCodeAt(i - 1) === bj ? 0 : 1;
      curr[i] = Math.min(
        curr[i - 1] + 1,     // insertion
        prev[i] + 1,         // deletion
        prev[i - 1] + cost,  // substitution
      );
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[m];
}

/**
 * True if `query` loosely matches `target`:
 *   - substring match, OR
 *   - prefix within edit distance 1 on the query vs a same-length target prefix,
 *     OR
 *   - overall edit distance ≤ `maxDistance` against the full target.
 *
 * Returns a score: 0 = exact substring, 1 = fuzzy prefix, 2 = fuzzy full;
 * `-1` means no match. Lower scores rank higher.
 */
export function fuzzyMatchScore(
  query: string,
  target: string,
  maxDistance = 1,
): number {
  if (!query) return 0;
  if (target.includes(query)) return 0;
  if (query.length <= target.length) {
    const prefix = target.slice(0, query.length);
    if (editDistance(query, prefix) <= maxDistance) return 1;
  }
  if (editDistance(query, target) <= maxDistance) return 2;
  return -1;
}
