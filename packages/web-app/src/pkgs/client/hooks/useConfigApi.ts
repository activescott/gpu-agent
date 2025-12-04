"use client"
import { useState, useEffect } from "react"

// eslint-disable-next-line import/no-unused-modules
export interface PublicConfig {
  domain: string
  posthogKey: string
  posthogHost: string
}

// eslint-disable-next-line import/no-unused-modules
export interface ConfigState {
  config: PublicConfig | null
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch application configuration from /api/config endpoint.
 * This provides runtime configuration without using build-time environment variables.
 */
export function useConfigApi(): ConfigState {
  const [state, setState] = useState<ConfigState>({
    config: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config")
        if (!response.ok) {
          throw new Error(
            `Failed to fetch config: ${response.status} ${response.statusText}`,
          )
        }
        const config: PublicConfig = await response.json()
        setState({ config, loading: false, error: null })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"
        setState({ config: null, loading: false, error: errorMessage })
      }
    }

    fetchConfig()
  }, [])

  return state
}
