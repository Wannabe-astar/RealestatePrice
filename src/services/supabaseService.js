// ========================================
// Supabase Service - Generic CRUD Operations
// ========================================

import { supabase } from '../lib/supabaseClient'

// ========================================
// Generic CRUD Operations
// ========================================

/**
 * Create a new entity
 * @param {string} table - Table name
 * @param {object} data - Data to insert
 * @returns {Promise<{data: any, error: any}>}
 */
export async function createEntity(table, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single()

    return { data: result, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Get entity by ID
 * @param {string} table - Table name
 * @param {string} id - Entity ID
 * @returns {Promise<{data: any, error: any}>}
 */
export async function getEntityById(table, id) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Get list of entities with optional filtering and pagination
 * @param {string} table - Table name
 * @param {object} options - Query options
 * @param {object} options.filters - Filter conditions (e.g., { user_id: '123' })
 * @param {string} options.orderBy - Column to order by
 * @param {boolean} options.ascending - Sort order (default: true)
 * @param {number} options.limit - Limit number of results
 * @param {number} options.offset - Offset for pagination
 * @param {string} options.select - Custom select query (default: '*')
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function getEntityList(table, options = {}) {
  try {
    const {
      filters = {},
      orderBy = 'created_at',
      ascending = false,
      limit,
      offset,
      select = '*'
    } = options

    let query = supabase.from(table).select(select)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value)
      }
    })

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy, { ascending })
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1)
    }

    const { data, error } = await query

    return { data: data || [], error }
  } catch (err) {
    return { data: [], error: err }
  }
}

/**
 * Update entity
 * @param {string} table - Table name
 * @param {string} id - Entity ID
 * @param {object} updates - Data to update
 * @returns {Promise<{data: any, error: any}>}
 */
export async function updateEntity(table, id, updates) {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Delete entity
 * @param {string} table - Table name
 * @param {string} id - Entity ID
 * @returns {Promise<{data: any, error: any}>}
 */
export async function deleteEntity(table, id) {
  try {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

// ========================================
// Domain-Specific Services
// ========================================

/**
 * Get user properties with optional filters
 */
export async function getUserProperties(userId, filters = {}) {
  return getEntityList('user_properties', {
    filters: { user_id: userId, ...filters },
    orderBy: 'created_at',
    ascending: false
  })
}

/**
 * Get property price history
 */
export async function getPropertyPriceHistory(propertyId) {
  return getEntityList('property_prices', {
    filters: { property_id: propertyId },
    orderBy: 'date',
    ascending: true,
    select: 'id, property_id, price, date'
  })
}

/**
 * Get regional statistics
 */
export async function getRegionalStatistics(regionCode = null) {
  const filters = regionCode ? { region_code: regionCode } : {}
  return getEntityList('regional_statistics', {
    filters,
    orderBy: 'date',
    ascending: false,
    limit: 1,
    select: 'region_code, average_price, price_change, transaction_count'
  })
}

/**
 * Get user alerts
 */
export async function getUserAlerts(userId, activeOnly = false) {
  const filters = { user_id: userId }
  if (activeOnly) {
    filters.is_active = true
  }

  return getEntityList('user_alerts', {
    filters,
    orderBy: 'created_at',
    ascending: false
  })
}

/**
 * Get user wishlist
 */
export async function getUserWishlist(userId) {
  return getEntityList('user_wishlist', {
    filters: { user_id: userId },
    orderBy: 'created_at',
    ascending: false
  })
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId, unreadOnly = false) {
  const filters = { user_id: userId }
  if (unreadOnly) {
    filters.is_read = false
  }

  return getEntityList('notifications', {
    filters,
    orderBy: 'created_at',
    ascending: false,
    limit: 50
  })
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId) {
  return updateEntity('notifications', notificationId, {
    is_read: true,
    read_at: new Date().toISOString()
  })
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

// ========================================
// Real-time Subscriptions
// ========================================

/**
 * Subscribe to table changes
 * @param {string} table - Table name
 * @param {function} callback - Callback function for changes
 * @param {object} filters - Optional filters (e.g., { user_id: '123' })
 * @returns {object} Subscription object
 */
export function subscribeToTable(table, callback, filters = {}) {
  let channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: Object.entries(filters)
          .map(([key, value]) => `${key}=eq.${value}`)
          .join(',')
      },
      callback
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from channel
 */
export async function unsubscribe(channel) {
  if (channel) {
    await supabase.removeChannel(channel)
  }
}

// ========================================
// Batch Operations
// ========================================

/**
 * Batch create entities
 * @param {string} table - Table name
 * @param {array} dataArray - Array of data objects
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function batchCreate(table, dataArray) {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert(dataArray)
      .select()

    return { data: data || [], error }
  } catch (err) {
    return { data: [], error: err }
  }
}

/**
 * Batch delete entities
 * @param {string} table - Table name
 * @param {array} ids - Array of IDs to delete
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function batchDelete(table, ids) {
  try {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .in('id', ids)
      .select()

    return { data: data || [], error }
  } catch (err) {
    return { data: [], error: err }
  }
}
