/**
 * Secure Blockchain Wrapper
 * Adds security layers around blockchain operations
 */

import { validators, sanitizers, RateLimiter, secureLog } from './securityConfig.js'

// Rate limiters for different operations
const transactionLimiter = new RateLimiter(10, 60 * 60 * 1000) // 10 transactions per hour
const apiLimiter = new RateLimiter(100, 60 * 1000) // 100 API calls per minute

/**
 * Secure wrapper for Solana operations
 */
export class SecureSolanaManager {
  constructor(solanaManager) {
    this.solanaManager = solanaManager
  }

  /**
   * Securely get user CNFTs with validation and rate limiting
   */
  async getUserCNFTs(ownerAddress, delegateAddress, collectionName) {
    try {
      // Rate limiting
      if (!apiLimiter.isAllowed(ownerAddress)) {
        throw new Error('Rate limit exceeded for API calls')
      }

      // Validate addresses
      if (!validators.isValidSolanaAddress(ownerAddress)) {
        secureLog.error('Invalid owner address provided', { ownerAddress: '[REDACTED]' })
        throw new Error('Invalid owner address')
      }

      if (delegateAddress && !validators.isValidSolanaAddress(delegateAddress)) {
        secureLog.error('Invalid delegate address provided')
        throw new Error('Invalid delegate address')
      }

      // Sanitize collection name
      const sanitizedCollectionName = collectionName ? 
        sanitizers.sanitizeHtml(collectionName).substring(0, 100) : null

      // Call the actual method
      const result = await this.solanaManager.getUserCNFTs(
        ownerAddress, 
        delegateAddress, 
        sanitizedCollectionName
      )

      // Validate and sanitize response
      if (result && result.items) {
        result.items = result.items.map(item => ({
          ...item,
          content: {
            ...item.content,
            metadata: sanitizers.sanitizeMetadata(item.content?.metadata || {})
          }
        }))
      }

      return result

    } catch (error) {
      secureLog.error('Failed to get user CNFTs', { 
        error: error.message,
        ownerAddress: '[REDACTED]'
      })
      throw error
    }
  }
}

/**
 * Secure wrapper for Ethereum operations
 */
export class SecureEthereumManager {
  constructor() {
    this.transactionHistory = new Map()
  }

  /**
   * Validate and secure transaction parameters
   */
  validateTransaction(params) {
    const { to, value, data, from } = params

    // Validate addresses
    if (!validators.isValidEthereumAddress(to)) {
      throw new Error('Invalid recipient address')
    }

    if (from && !validators.isValidEthereumAddress(from)) {
      throw new Error('Invalid sender address')
    }

    // Validate contract address if it's a contract interaction
    if (!validators.isValidContractAddress(to)) {
      throw new Error('Invalid or blocked contract address')
    }

    // Validate transaction value
    if (value !== undefined && !validators.isValidTransactionValue(value)) {
      throw new Error('Invalid transaction value')
    }

    // Validate data if provided
    if (data && !/^0x[a-fA-F0-9]*$/.test(data)) {
      throw new Error('Invalid transaction data format')
    }

    // Rate limiting per address
    if (!transactionLimiter.isAllowed(from || 'unknown')) {
      throw new Error('Transaction rate limit exceeded')
    }

    return true
  }

  /**
   * Securely execute contract read operation
   */
  async secureContractRead(contractAddress, functionName, params = {}) {
    try {
      // Validate contract address
      if (!validators.isValidContractAddress(contractAddress)) {
        throw new Error('Invalid contract address')
      }

      // Validate function name (whitelist approach)
      const allowedReadFunctions = [
        'tokenURI', 'balanceOf', 'ownerOf', 'name', 'symbol', 
        'totalSupply', 'getApproved', 'isApprovedForAll'
      ]

      if (!allowedReadFunctions.includes(functionName)) {
        secureLog.warn('Attempted to call non-whitelisted function', { functionName })
        throw new Error(`Function ${functionName} not allowed`)
      }

      // Rate limiting
      const identifier = `${contractAddress}:${functionName}`
      if (!apiLimiter.isAllowed(identifier)) {
        throw new Error('Rate limit exceeded for contract calls')
      }

      // Validate parameters based on function
      this.validateFunctionParams(functionName, params)

      secureLog.warn('Contract read operation attempted', { 
        contractAddress, 
        functionName,
        timestamp: new Date().toISOString()
      })

      return { success: true, validated: true }

    } catch (error) {
      secureLog.error('Contract read operation failed', { 
        error: error.message,
        contractAddress,
        functionName
      })
      throw error
    }
  }

  /**
   * Validate function parameters
   */
  validateFunctionParams(functionName, params) {
    switch (functionName) {
      case 'tokenURI':
      case 'ownerOf':
      case 'getApproved':
        if (!params.tokenId || isNaN(params.tokenId) || params.tokenId < 0) {
          throw new Error('Invalid tokenId parameter')
        }
        break
      
      case 'balanceOf':
        if (!validators.isValidEthereumAddress(params.owner)) {
          throw new Error('Invalid owner address parameter')
        }
        break
      
      case 'isApprovedForAll':
        if (!validators.isValidEthereumAddress(params.owner) || 
            !validators.isValidEthereumAddress(params.operator)) {
          throw new Error('Invalid address parameters')
        }
        break
    }
  }

  /**
   * Get transaction history for monitoring
   */
  getTransactionHistory(address) {
    if (!validators.isValidEthereumAddress(address)) {
      throw new Error('Invalid address')
    }

    return this.transactionHistory.get(address) || []
  }
}

/**
 * Security monitor for blockchain operations
 */
export class BlockchainSecurityMonitor {
  constructor() {
    this.suspiciousActivity = new Map()
    this.alertThresholds = {
      maxFailedTransactions: 5,
      maxApiCallsPerMinute: 200,
      maxValuePerTransaction: 10
    }
  }

  /**
   * Monitor for suspicious activity
   */
  checkSuspiciousActivity(address, activity) {
    if (!this.suspiciousActivity.has(address)) {
      this.suspiciousActivity.set(address, {
        failedTransactions: 0,
        apiCalls: [],
        highValueTransactions: 0,
        lastActivity: new Date()
      })
    }

    const userActivity = this.suspiciousActivity.get(address)
    const now = new Date()

    switch (activity.type) {
      case 'failed_transaction':
        userActivity.failedTransactions++
        if (userActivity.failedTransactions > this.alertThresholds.maxFailedTransactions) {
          this.triggerAlert(address, 'Too many failed transactions')
        }
        break

      case 'api_call':
        userActivity.apiCalls.push(now)
        // Clean old calls (older than 1 minute)
        userActivity.apiCalls = userActivity.apiCalls.filter(
          call => now - call < 60000
        )
        if (userActivity.apiCalls.length > this.alertThresholds.maxApiCallsPerMinute) {
          this.triggerAlert(address, 'Too many API calls')
        }
        break

      case 'high_value_transaction':
        userActivity.highValueTransactions++
        this.triggerAlert(address, 'High value transaction detected')
        break
    }

    userActivity.lastActivity = now
  }

  /**
   * Trigger security alert
   */
  triggerAlert(address, reason) {
    secureLog.warn('Security Alert Triggered', {
      address: address.substring(0, 6) + '...' + address.substring(address.length - 4),
      reason,
      timestamp: new Date().toISOString()
    })

    // In a real application, this could send alerts to monitoring systems
    console.warn(`🚨 Security Alert: ${reason} for address ${address.substring(0, 6)}...`)
  }
}

export default {
  SecureSolanaManager,
  SecureEthereumManager,
  BlockchainSecurityMonitor
}