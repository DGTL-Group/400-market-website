import type { Access } from 'payload'

/** Allow all read operations without auth; require auth for write operations */
export const publicRead: Access = ({ req }) => {
  if (req.user) return true
  return true // read is always public
}

/** Require authenticated user for all operations */
export const isAuthenticated: Access = ({ req }) => {
  return Boolean(req.user)
}

/** Require admin role */
export const isAdmin: Access = ({ req }) => {
  return req.user?.role === 'admin'
}

/** Require admin or editor role */
export const isAdminOrEditor: Access = ({ req }) => {
  return req.user?.role === 'admin' || req.user?.role === 'editor'
}

/** Allow users to update only their own profile */
export const isAdminOrSelf: Access = ({ req }) => {
  if (req.user?.role === 'admin') return true
  if (req.user) {
    return { id: { equals: req.user.id } }
  }
  return false
}
