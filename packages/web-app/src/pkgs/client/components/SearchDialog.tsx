"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type KeyboardEvent,
} from "react"
import { useRouter } from "next/navigation"
import { BootstrapIcon } from "./BootstrapIcon"
import { useSearchData } from "../hooks/useSearchData"
import { search, type SearchResult } from "../search/searchGpus"

interface Props {
  onClose: () => void
}

export default function SearchDialog({ onClose }: Props): JSX.Element {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const { data: gpus } = useSearchData()

  const results = useMemo(() => search(query, gpus), [query, gpus])

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [results])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.querySelector(
      '[aria-selected="true"]',
    ) as HTMLElement | null
    active?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  const navigateTo = useCallback(
    (href: string) => {
      onClose()
      router.push(href)
    },
    [onClose, router],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          setActiveIndex((i) => Math.min(i + 1, results.length - 1))
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          setActiveIndex((i) => Math.max(i - 1, 0))
          break
        }
        case "Enter": {
          e.preventDefault()
          if (results[activeIndex]) {
            navigateTo(results[activeIndex].href)
          }
          break
        }
        case "Escape": {
          e.preventDefault()
          onClose()
          break
        }
      }
    },
    [results, activeIndex, navigateTo, onClose],
  )

  // Group results by type for rendering
  const gpuResults = results.filter((r) => r.type === "gpu")
  const pageResults = results.filter((r) => r.type === "page")

  // Calculate the offset for page results in the flat list
  const gpuCount = gpuResults.length

  return (
    <>
      <div
        className="search-dialog-backdrop"
        onClick={onClose}
        data-testid="search-backdrop"
      />
      <div
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        data-testid="search-dialog"
        onKeyDown={handleKeyDown}
      >
        <div className="search-dialog-input-wrapper">
          <BootstrapIcon icon="search" size="xs" />
          <input
            ref={inputRef}
            type="text"
            className="search-dialog-input"
            placeholder="Search GPUs, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-results"
            data-testid="search-input"
          />
          <kbd className="search-dialog-esc">Esc</kbd>
        </div>
        <div
          id="search-results"
          ref={listRef}
          role="listbox"
          className="search-dialog-results"
          data-testid="search-results"
        >
          {query && results.length === 0 && (
            <div className="search-dialog-empty">No results found</div>
          )}
          {gpuResults.length > 0 && (
            <>
              <div className="search-dialog-group-label">GPUs</div>
              {gpuResults.map((result, i) => (
                <ResultItem
                  key={result.href}
                  result={result}
                  active={activeIndex === i}
                  onClick={() => navigateTo(result.href)}
                />
              ))}
            </>
          )}
          {pageResults.length > 0 && (
            <>
              <div className="search-dialog-group-label">Pages</div>
              {pageResults.map((result, i) => (
                <ResultItem
                  key={result.href}
                  result={result}
                  active={activeIndex === gpuCount + i}
                  onClick={() => navigateTo(result.href)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function ResultItem({
  result,
  active,
  onClick,
}: {
  result: SearchResult
  active: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <div
      role="option"
      aria-selected={active}
      className={`search-dialog-result${active ? " search-dialog-result-active" : ""}`}
      onClick={onClick}
      data-testid="search-result-item"
    >
      <BootstrapIcon
        icon={result.type === "gpu" ? "gpu-card" : "file-earmark-text"}
        size="xs"
      />
      <div className="search-dialog-result-text">
        <div className="search-dialog-result-label">{result.label}</div>
        <div className="search-dialog-result-desc">{result.description}</div>
      </div>
      {active && <BootstrapIcon icon="arrow-return-left" size="xs" />}
    </div>
  )
}
