/**
 * grudgeAPI.js — Grudge Studio backend API client for CharacterStudio.
 *
 * Connects to: api.grudge-studio.com (Railway Express + PostgreSQL)
 * Auth: Bearer JWT from Grudge SSO (id.grudge-studio.com)
 *
 * This is the CharacterStudio equivalent of Grudge-Builder's client/src/lib/api.ts.
 * Same endpoints, same auth pattern, same DB.
 */

const API_BASE = import.meta.env.VITE_GRUDGE_API || 'https://api.grudge-studio.com';
const AUTH_GATEWAY = import.meta.env.VITE_AUTH_GATEWAY || 'https://id.grudge-studio.com';
const ASSET_CDN = import.meta.env.VITE_ASSET_CDN || 'https://assets.grudge-studio.com';

// ── Auth helpers ─────────────────────────────────────────────────

function getAuthToken() {
  return localStorage.getItem('grudge_auth_token') || '';
}

function getGrudgeId() {
  return localStorage.getItem('grudge_id') || '';
}

function getAccountId() {
  return localStorage.getItem('grudge_account_id') || 'guest';
}

function authHeaders() {
  const token = getAuthToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function buildLoginUrl(returnUrl) {
  const redirectUri = encodeURIComponent(returnUrl || window.location.href);
  return `${AUTH_GATEWAY}/login?redirect_uri=${redirectUri}`;
}

export function logout() {
  const keys = [
    'grudge_auth_token', 'grudge_user_id', 'grudge_id', 'grudge_username',
    'grudge_user', 'grudge_account_id', 'grudge_session_token',
  ];
  keys.forEach(k => localStorage.removeItem(k));
}

// ── Generic fetch wrapper ────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body?.error || `API ${res.status}: ${path}`);
  }
  return res.json();
}

// ── Character API ────────────────────────────────────────────────

/**
 * Starting equipment for new characters.
 * Every character starts with unarmed + stone harvesting tool.
 */
const STARTING_EQUIPMENT = {
  mainHand: null,       // unarmed (no weapon equipped)
  offHand: null,
  head: null,
  chest: null,
  legs: null,
  feet: null,
  back: null,
};

const STARTING_INVENTORY = [
  { itemId: 'tool_stone_axe', quantity: 1, tier: 1 },
  { itemId: 'food_bread', quantity: 3, tier: 1 },
];

/**
 * Create a new Grudge character with auto-UUID, model3d data,
 * starting equipment (unarmed + harvesting tool), and cNFT mint.
 *
 * @param {Object} params
 * @param {string} params.name - Character name
 * @param {string} params.raceId - Race ID (human, barbarian, elf, dwarf, orc, undead)
 * @param {string} params.classId - Class ID (warrior, mage, ranger, worg)
 * @param {Object} params.model3d - 3D appearance data from CharacterStudio customization
 * @param {Object} [params.skillLoadouts] - Initial skill selections
 * @returns {Promise<Object>} Created character with id, uuid, model3d
 */
export async function createCharacter({ name, raceId, classId, model3d, skillLoadouts }) {
  const character = await apiFetch('/api/characters', {
    method: 'POST',
    body: JSON.stringify({
      name,
      raceId,
      classId,
      equipment: STARTING_EQUIPMENT,
      inventory: STARTING_INVENTORY,
      model3d: {
        baseModelId: raceId,
        equippedMeshes: model3d?.equippedMeshes || {},
        weaponSlots: {},
        faceVariant: model3d?.faceVariant || 'A',
        skinColor: model3d?.skinColor || '#ffffff',
        armorColor: model3d?.armorColor || '#ffffff',
        capeEnabled: false,
        scale: 1.0,
      },
      skillLoadouts: skillLoadouts || {},
      equippedWeaponId: null, // unarmed
      skipAvatarGeneration: false,
    }),
  });

  console.log(`[GrudgeAPI] Character created: ${character.name} (${character.id})`);

  // Auto-mint cNFT (non-blocking)
  mintCharacterCNFT(character.id).catch(err => {
    console.warn('[GrudgeAPI] cNFT mint failed (non-critical):', err.message);
  });

  return character;
}

export async function getCharacters() {
  try {
    return await apiFetch('/api/characters');
  } catch {
    return [];
  }
}

export async function getCharacter(id) {
  return apiFetch(`/api/characters/${id}`);
}

export async function updateCharacter(id, updates) {
  return apiFetch(`/api/characters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteCharacter(id) {
  return apiFetch(`/api/characters/${id}`, { method: 'DELETE' });
}

// ── cNFT Minting ─────────────────────────────────────────────────

export async function mintCharacterCNFT(characterId, avatarUrl) {
  try {
    return await apiFetch(`/api/characters/${characterId}/mint`, {
      method: 'POST',
      body: JSON.stringify({ avatarUrl }),
    });
  } catch (err) {
    console.warn('[GrudgeAPI] Mint failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Account & Inventory ──────────────────────────────────────────

export async function getAccountInventory() {
  try {
    return await apiFetch('/api/account/inventory');
  } catch {
    return [];
  }
}

export async function getAccountResources() {
  try {
    return await apiFetch('/api/account/resources');
  } catch {
    return { resources: {} };
  }
}

// ── Asset ownership check (for mesh gating) ──────────────────────

/**
 * Check if the current account owns a specific asset/mesh.
 * Used by the trait system to gate premium meshes.
 *
 * @param {string} assetId - Asset ID to check ownership for
 * @returns {Promise<boolean>}
 */
export async function ownsAsset(assetId) {
  try {
    const inventory = await getAccountInventory();
    return inventory.some(item => item.itemId === assetId);
  } catch {
    return false;
  }
}

/**
 * Get all owned asset IDs (for bulk ownership checking).
 * @returns {Promise<Set<string>>}
 */
export async function getOwnedAssetIds() {
  try {
    const inventory = await getAccountInventory();
    return new Set(inventory.map(item => item.itemId));
  } catch {
    return new Set();
  }
}

// ── Health check ─────────────────────────────────────────────────

export async function checkHealth() {
  try {
    const data = await apiFetch('/api/health');
    return { ok: true, ...data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Exports ──────────────────────────────────────────────────────

export {
  API_BASE,
  AUTH_GATEWAY,
  ASSET_CDN,
  getAuthToken,
  getGrudgeId,
  getAccountId,
};
