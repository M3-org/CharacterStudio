/**
 * Security Configuration for CharacterStudio
 * Centralized security settings and validation functions
 */

// Allowed blockchain networks
export const ALLOWED_NETWORKS = {
  ETHEREUM: {
    MAINNET: '0x1',
    POLYGON: '0x89',
    GOERLI: '0x5' // Testnet
  },
  SOLANA: {
    MAINNET: 'mainnet-beta',
    DEVNET: 'devnet',
    TESTNET: 'testnet'
  }
}

// Security limits
export const SECURITY_LIMITS = {
  MAX_TRANSACTION_VALUE: 1000, // Maximum ETH/SOL value
  MAX_ATTRIBUTES_COUNT: 20,     // Maximum NFT attributes
  MAX_METADATA_LENGTH: 1000,    // Maximum metadata field length
  RATE_LIMIT_TRANSACTIONS: 10,  // Max transactions per hour
  RATE_LIMIT_API_CALLS: 100,    // Max API calls per minute
  MAX_FILE_SIZE: 50 * 1024 * 1024 // 50MB max file upload
}

// Validation functions
export const validators = {
  /**
   * Validate Ethereum address format
   */
  isValidEthereumAddress: (address) => {
    if (!address || typeof address !== 'string') return false
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  },

  /**
   * Validate Solana address format
   */
  isValidSolanaAddress: (address) => {
    if (!address || typeof address !== 'string') return false
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  },

  /**
   * Validate transaction value
   */
  isValidTransactionValue: (value) => {
    const num = parseFloat(value)
    return !isNaN(num) && num > 0 && num <= SECURITY_LIMITS.MAX_TRANSACTION_VALUE
  },

  /**
   * Validate contract address (includes known malicious address checks)
   */
  isValidContractAddress: (address) => {
    if (!validators.isValidEthereumAddress(address)) return false
    
    // Known malicious/problematic addresses
    const blockedAddresses = [
      '0x0000000000000000000000000000000000000000', // Zero address
      '0x000000000000000000000000000000000000dead'  // Dead address
    ]
    
    return !blockedAddresses.includes(address.toLowerCase())
  },

  /**
   * Validate API key format
   */
  isValidApiKey: (key) => {
    if (!key || typeof key !== 'string') return false
    return key.length >= 8 && key.length <= 128
  }
}

// Sanitization functions
export const sanitizers = {
  /**
   * Sanitize HTML from user input
   */
  sanitizeHtml: (input) => {
    if (!input || typeof input !== 'string') return ''
    
    // Use iterative approach to prevent incomplete sanitization
    let sanitized = input
    let previous
    do {
      previous = sanitized
      sanitized = sanitized.replace(/<[^>]*>/g, '')
    } while (sanitized !== previous)
    
    return sanitized.trim()
  },

  /**
   * Sanitize metadata object
   */
  sanitizeMetadata: (metadata) => {
    if (!metadata || typeof metadata !== 'object') return {}

    const sanitized = {}
    const allowedFields = ['name', 'description', 'image', 'external_url', 'attributes']

    allowedFields.forEach(field => {
      if (metadata[field]) {
        if (typeof metadata[field] === 'string') {
          sanitized[field] = sanitizers.sanitizeHtml(metadata[field])
            .substring(0, SECURITY_LIMITS.MAX_METADATA_LENGTH)
        } else if (field === 'attributes' && Array.isArray(metadata[field])) {
          sanitized[field] = metadata[field]
            .slice(0, SECURITY_LIMITS.MAX_ATTRIBUTES_COUNT)
            .map(attr => ({
              trait_type: sanitizers.sanitizeHtml(attr.trait_type || '').substring(0, 100),
              value: sanitizers.sanitizeHtml(String(attr.value || '')).substring(0, 100)
            }))
        }
      }
    })

    return sanitized
  },

  /**
   * Sanitize wallet address for display
   */
  sanitizeWalletAddress: (address) => {
    if (!address || typeof address !== 'string') return ''
    return address.replace(/[^a-zA-Z0-9]/g, '')
  }
}

// Rate limiting
export class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) { // Default: 100 requests per minute
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map()
  }

  isAllowed(identifier) {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }

    const userRequests = this.requests.get(identifier)
    const validRequests = userRequests.filter(time => time > windowStart)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }

  getRemainingRequests(identifier) {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    if (!this.requests.has(identifier)) {
      return this.maxRequests
    }

    const userRequests = this.requests.get(identifier)
    const validRequests = userRequests.filter(time => time > windowStart)
    
    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

// Security headers for HTTP requests
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

// Environment validation
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_HELIUS_KEY',
    'VITE_OPENSEA_KEY',
    'VITE_PINATA_API_KEY',
    'VITE_PINATA_API_SECRET'
  ]

  const missing = requiredEnvVars.filter(varName => 
    !import.meta.env[varName] || !validators.isValidApiKey(import.meta.env[varName])
  )

  if (missing.length > 0) {
    console.warn('Missing or invalid environment variables:', missing)
    return false
  }

  return true
}

// Error logging (without exposing sensitive data)
export const secureLog = {
  error: (message, details = {}) => {
    const sanitizedDetails = { ...details }
    
    // Remove sensitive fields
    const sensitiveFields = ['privateKey', 'apiKey', 'secret', 'token', 'password']
    sensitiveFields.forEach(field => {
      if (sanitizedDetails[field]) {
        sanitizedDetails[field] = '[REDACTED]'
      }
    })

    console.error(`Security Error: ${message}`, sanitizedDetails)
  },

  warn: (message, details = {}) => {
    console.warn(`Security Warning: ${message}`, details)
  }
}

export default {
  ALLOWED_NETWORKS,
  SECURITY_LIMITS,
  validators,
  sanitizers,
  RateLimiter,
  SECURITY_HEADERS,
  validateEnvironment,
  secureLog
}