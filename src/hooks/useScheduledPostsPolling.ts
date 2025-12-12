'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface PollingResult {
  published: number
  total?: number
  message?: string
}

interface UseScheduledPostsPollingOptions {
  enabled?: boolean
  interval?: number // in milliseconds, default 60000 (1 minute)
  onPublish?: (result: PollingResult) => void
}

export function useScheduledPostsPolling(options: UseScheduledPostsPollingOptions = {}) {
  const {
    enabled = true,
    interval = 60000, // Default: check every 60 seconds
    onPublish,
  } = options

  const [isPolling, setIsPolling] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(false)
  const router = useRouter()

  const checkAndPublish = useCallback(async () => {
    if (isPollingRef.current) {
      console.log('[Polling] Already polling, skipping...')
      return // Prevent concurrent requests
    }

    isPollingRef.current = true
    setIsPolling(true)

    try {
      console.log('[Polling] Checking for scheduled posts...')

      const response = await fetch('/api/scheduled-posts/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Polling] Failed to check scheduled posts:', response.status, errorText)
        throw new Error('Failed to check scheduled posts')
      }

      const result: PollingResult = await response.json()
      setLastChecked(new Date())

      console.log('[Polling] Check complete:', result)

      // If posts were published, notify and refresh
      if (result.published > 0) {
        console.log(`✅ Published ${result.published} scheduled post(s)`)

        if (onPublish) {
          onPublish(result)
        }

        // Refresh the current page to show updated post statuses
        router.refresh()
      }
    } catch (error) {
      console.error('[Polling] Error checking scheduled posts:', error)
    } finally {
      isPollingRef.current = false
      setIsPolling(false)
    }
  }, [onPublish, router])

  useEffect(() => {
    if (!enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    console.log('[Polling] Starting polling with interval:', interval, 'ms')

    // Initial check immediately
    checkAndPublish()

    // Set up interval for polling
    intervalRef.current = setInterval(() => {
      checkAndPublish()
    }, interval)

    // Cleanup on unmount
    return () => {
      console.log('[Polling] Stopping polling')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval, checkAndPublish])

  return {
    isPolling,
    lastChecked,
    checkNow: checkAndPublish,
  }
}
