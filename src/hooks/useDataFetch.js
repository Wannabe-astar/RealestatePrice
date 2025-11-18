import { useState, useEffect, useCallback } from 'react'
import { getErrorMessage } from '../utils/errorHandling'

// ========================================
// useDataFetch - Generic Data Fetching Hook
// ========================================

/**
 * Generic data fetching hook with loading and error states
 * @param {function} fetchFunction - Async function to fetch data
 * @param {array} dependencies - Dependencies to trigger refetch
 * @param {object} options - Hook options
 * @param {boolean} options.immediate - Fetch immediately on mount (default: true)
 * @param {function} options.onSuccess - Success callback
 * @param {function} options.onError - Error callback
 * @returns {object} - { data, loading, error, refetch, setData }
 */
export function useDataFetch(fetchFunction, dependencies = [], options = {}) {
  const { immediate = true, onSuccess, onError } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction()

      if (result.error) {
        throw result.error
      }

      setData(result.data)

      if (onSuccess) {
        onSuccess(result.data)
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)

      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, dependencies)

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData
  }
}

// ========================================
// usePaginatedFetch - Paginated Data Fetching
// ========================================

/**
 * Paginated data fetching hook
 * @param {function} fetchFunction - Function(page, limit) => Promise<{data, error}>
 * @param {object} options - Hook options
 * @param {number} options.initialPage - Initial page (default: 1)
 * @param {number} options.pageSize - Items per page (default: 10)
 * @returns {object} - { data, loading, error, page, hasMore, loadMore, refresh }
 */
export function usePaginatedFetch(fetchFunction, options = {}) {
  const { initialPage = 1, pageSize = 10 } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(true)

  const fetchData = useCallback(async (pageNum, append = false) => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction(pageNum, pageSize)

      if (result.error) {
        throw result.error
      }

      const newData = result.data || []

      if (append) {
        setData(prev => [...prev, ...newData])
      } else {
        setData(newData)
      }

      setHasMore(newData.length === pageSize)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, pageSize])

  useEffect(() => {
    fetchData(page)
  }, [])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchData(nextPage, true)
    }
  }, [page, loading, hasMore, fetchData])

  const refresh = useCallback(() => {
    setPage(initialPage)
    fetchData(initialPage, false)
  }, [initialPage, fetchData])

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    loadMore,
    refresh
  }
}

// ========================================
// useInfiniteScroll - Infinite Scroll Hook
// ========================================

/**
 * Infinite scroll hook
 * @param {function} fetchFunction - Function to fetch next page
 * @param {object} options - Hook options
 * @returns {object} - { data, loading, error, hasMore, observerRef }
 */
export function useInfiniteScroll(fetchFunction, options = {}) {
  const { pageSize = 10 } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [observerRef, setObserverRef] = useState(null)

  const fetchData = useCallback(async (pageNum) => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction(pageNum, pageSize)

      if (result.error) {
        throw result.error
      }

      const newData = result.data || []
      setData(prev => [...prev, ...newData])
      setHasMore(newData.length === pageSize)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, pageSize])

  useEffect(() => {
    fetchData(page)
  }, [page])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerRef) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1)
        }
      },
      { threshold: 1.0 }
    )

    observer.observe(observerRef)

    return () => {
      if (observerRef) {
        observer.unobserve(observerRef)
      }
    }
  }, [observerRef, hasMore, loading])

  return {
    data,
    loading,
    error,
    hasMore,
    observerRef: setObserverRef
  }
}

// ========================================
// usePolling - Polling Hook
// ========================================

/**
 * Polling hook for periodic data fetching
 * @param {function} fetchFunction - Function to fetch data
 * @param {number} interval - Polling interval in ms (default: 5000)
 * @param {object} options - Hook options
 * @returns {object} - { data, loading, error, startPolling, stopPolling }
 */
export function usePolling(fetchFunction, interval = 5000, options = {}) {
  const { immediate = true } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPolling, setIsPolling] = useState(immediate)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction()

      if (result.error) {
        throw result.error
      }

      setData(result.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [fetchFunction])

  useEffect(() => {
    if (!isPolling) return

    fetchData()
    const intervalId = setInterval(fetchData, interval)

    return () => clearInterval(intervalId)
  }, [isPolling, interval, fetchData])

  const startPolling = useCallback(() => setIsPolling(true), [])
  const stopPolling = useCallback(() => setIsPolling(false), [])

  return {
    data,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling
  }
}
