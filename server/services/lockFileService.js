/**
 * Lock File Service - Destructive Activation
 * Manages filesystem-based Pro license lock file
 * If lock file is lost/corrupted, Pro features are disabled
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// Lock file paths
const DOCKER_LOCK_PATH = '/app/License/.pro_lock'
const LOCK_FILE_PATH = path.join(process.cwd(), 'License', '.pro_lock')

/**
 * Get the lock file path (Docker or local)
 */
const getLockFilePath = () => {
  // Try Docker path first
  if (fs.existsSync('/app/License')) {
    return DOCKER_LOCK_PATH
  }
  // Fallback to local path
  return LOCK_FILE_PATH
}

/**
 * Create lock file with activation data
 * @param {Object} activationData - Data to store in lock file
 * @returns {boolean} - True if lock file created successfully
 */
export const createLockFile = (activationData = {}) => {
  try {
    const lockFilePath = getLockFilePath()
    const lockDir = path.dirname(lockFilePath)
    
    // Ensure directory exists
    if (!fs.existsSync(lockDir)) {
      fs.mkdirSync(lockDir, { recursive: true })
    }
    
    // Create lock file with activation metadata
    const lockData = {
      activated: true,
      activatedAt: new Date().toISOString(),
      activationDate: activationData.date || new Date().toISOString(),
      organizationId: activationData.organizationId || null,
      organizationName: activationData.organizationName || null,
      checksum: crypto.createHash('sha256')
        .update(`${activationData.organizationId || ''}${Date.now()}`)
        .digest('hex')
    }
    
    fs.writeFileSync(lockFilePath, JSON.stringify(lockData, null, 2), 'utf8')
    console.log(`[LockFile] ✅ Created lock file at: ${lockFilePath}`)
    return true
  } catch (error) {
    console.error('[LockFile] Error creating lock file:', error.message)
    return false
  }
}

/**
 * Check if lock file exists and is valid
 * @returns {boolean} - True if lock file exists and is valid
 */
export const checkLockFile = () => {
  try {
    const lockFilePath = getLockFilePath()
    
    if (!fs.existsSync(lockFilePath)) {
      return false
    }
    
    // Verify lock file is readable and contains valid data
    const lockContent = fs.readFileSync(lockFilePath, 'utf8')
    const lockData = JSON.parse(lockContent)
    
    // Basic validation
    if (!lockData.activated) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('[LockFile] Error checking lock file:', error.message)
    return false
  }
}

/**
 * Delete lock file (destructive - user must pay again)
 * @returns {boolean} - True if lock file deleted successfully
 */
export const deleteLockFile = () => {
  try {
    const lockFilePath = getLockFilePath()
    
    if (fs.existsSync(lockFilePath)) {
      fs.unlinkSync(lockFilePath)
      console.log(`[LockFile] ⚠️  Lock file deleted: ${lockFilePath}`)
      return true
    }
    
    return false
  } catch (error) {
    console.error('[LockFile] Error deleting lock file:', error.message)
    return false
  }
}

/**
 * Get lock file info
 * @returns {Object|null} - Lock file data or null
 */
export const getLockFileInfo = () => {
  try {
    const lockFilePath = getLockFilePath()
    
    if (!fs.existsSync(lockFilePath)) {
      return null
    }
    
    const lockContent = fs.readFileSync(lockFilePath, 'utf8')
    return JSON.parse(lockContent)
  } catch (error) {
    console.error('[LockFile] Error reading lock file:', error.message)
    return null
  }
}

export default {
  createLockFile,
  checkLockFile,
  deleteLockFile,
  getLockFileInfo
}

