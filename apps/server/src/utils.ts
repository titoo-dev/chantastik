import { KVNamespace } from "@cloudflare/workers-types";
import cryptojs from "crypto-js";
import { Audio, Project } from "./types";

export async function saveProject(env: KVNamespace, project: Project) {
  project.updatedAt = new Date().toISOString();
  await env.put(`project:${project.id}`, JSON.stringify(project));
}

/**
 * Find a file with the given hash in the KV store
 * @param {KVNamespace} kv - The KV namespace to search
 * @param {string} hash - File hash to search for
 * @returns {Promise<Audio|null>} - Returns file metadata if found, null otherwise
 */
export async function findFileByHash(
  kv: KVNamespace,
  hash: string
): Promise<Audio | null> {
  // List all audio files
  const { keys } = await kv.list({ prefix: "audio:" });

  // Check each file for matching hash
  for (const key of keys) {
    const raw = await kv.get(key.name);
    if (!raw) continue;

    const meta = JSON.parse(raw) as Audio;
    if (meta.fileHash === hash) {
      return meta;
    }
  }

  return null;
}

/**
 * Generate a SHA-256 hash from file content
 * @param {Uint8Array} fileContent - The file content to hash
 * @returns {Promise<string>} - Hex string of the hash
 */
export async function generateFileHash(fileContent: Uint8Array): Promise<string> {
  // Convert Uint8Array to WordArray that CryptoJS can use
  const wordArray = cryptojs.lib.WordArray.create(fileContent);

  // Generate SHA-256 hash using CryptoJS
  const hash = cryptojs.SHA256(wordArray);

  // Return the hash as a hex string
  return hash.toString(cryptojs.enc.Hex);
}

/**
 * Sanitize and validate search query
 */
export function sanitizeSearchQuery(query: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!query || typeof query !== 'string') {
    return { isValid: false, sanitized: '', error: 'Query is required' };
  }
  
  const sanitized = query.trim();
  
  if (sanitized.length < 2) {
    return { isValid: false, sanitized, error: 'Search query must be at least 2 characters' };
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, sanitized, error: 'Search query too long (max 100 characters)' };
  }
  
  // Basic content filtering - block potentially harmful queries
  const blockedPatterns = [
    /(?:api[_-]?key|token|secret)/i,
    /(?:script|javascript|<|>)/i,
    /(?:sql|union|select|drop|delete)/i,
    /(?:eval|function|constructor)/i
  ];
  
  if (blockedPatterns.some(pattern => pattern.test(sanitized))) {
    return { isValid: false, sanitized, error: 'Invalid search query' };
  }
  
  return { isValid: true, sanitized };
}

/**
 * Simple rate limiting check
 */
export async function checkRateLimit(
  kv: KVNamespace, 
  identifier: string, 
  limit: number = 10, 
  windowSeconds: number = 60
): Promise<{ allowed: boolean; count: number }> {
  const key = `rate_limit:${identifier}`;
  
  try {
    const currentCount = await kv.get(key);
    const count = currentCount ? parseInt(currentCount) : 0;
    
    if (count >= limit) {
      return { allowed: false, count };
    }
    
    // Increment counter with TTL
    await kv.put(key, (count + 1).toString(), { expirationTtl: windowSeconds });
    return { allowed: true, count: count + 1 };
  } catch (error) {
    // If rate limiting fails, allow the request but log the error
    console.warn('Rate limiting error:', error);
    return { allowed: true, count: 0 };
  }
}

/**
 * Sanitize YouTube API response data
 */
export function sanitizeYouTubeResponse(data: any): any[] {
  if (!data?.items || !Array.isArray(data.items)) {
    return [];
  }
  
  return data.items
    .filter((item: any) => item.id?.videoId && item.snippet) // Filter valid items
    .map((item: any) => ({
      id: item.id.videoId,
      title: (item.snippet.title || '').substring(0, 200), // Limit title length
      description: (item.snippet.description || '').substring(0, 500), // Limit description
      thumbnail: item.snippet.thumbnails?.medium?.url || null,
      channelTitle: (item.snippet.channelTitle || '').substring(0, 100),
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }))
    .slice(0, 10); // Ensure max 10 results
}

/**
 * Calculate how well a title matches search terms (for title search ranking)
 */
export function calculateTitleMatchScore(title: string, searchTerms: string[]): number {
  if (!title || searchTerms.length === 0) return 0;
  
  const titleLower = title.toLowerCase();
  let score = 0;
  
  for (const term of searchTerms) {
    const termLower = term.toLowerCase();
    
    // Exact word match gets highest score
    const wordBoundaryRegex = new RegExp(`\\b${termLower}\\b`, 'i');
    if (wordBoundaryRegex.test(titleLower)) {
      score += 10;
    }
    // Partial match gets lower score
    else if (titleLower.includes(termLower)) {
      score += 5;
    }
    
    // Bonus points if term appears early in title
    const position = titleLower.indexOf(termLower);
    if (position !== -1) {
      const positionBonus = Math.max(0, 5 - Math.floor(position / 10));
      score += positionBonus;
    }
  }
  
  // Bonus for having multiple search terms
  const uniqueMatches = searchTerms.filter(term => 
    titleLower.includes(term.toLowerCase())
  ).length;
  
  if (uniqueMatches > 1) {
    score += uniqueMatches * 2;
  }
  
  return score;
}

