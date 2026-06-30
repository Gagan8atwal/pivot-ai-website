'use client'

import * as React from 'react'
import { errorMessage } from '@/lib/api'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Generic data-fetching hook for the typed API client.
 * Re-runs whenever `deps` change. Returns a `refetch` for manual refresh.
 */
export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList = []
): ApiState<T> & { refetch: () => void } {
  const [state, setState] = React.useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })
  const [nonce, setNonce] = React.useState(0)

  const fetcherRef = React.useRef(fetcher)
  fetcherRef.current = fetcher

  React.useEffect(() => {
    const controller = new AbortController()
    let active = true
    setState((s) => ({ ...s, loading: true, error: null }))
    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (controller.signal.aborted || !active) return
        setState({ data: null, loading: false, error: errorMessage(err) })
      })
    return () => {
      active = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const refetch = React.useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, refetch }
}
