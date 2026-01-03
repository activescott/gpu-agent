"use client"

import type { JSX } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { BootstrapIcon } from "../BootstrapIcon"
import "./charts.scss"

export interface ShareMenuProps {
  /** Title to use when sharing */
  title: string
  /** URL to share (defaults to current page) */
  url?: string
  /** URL to the shareable image (for download) */
  imageUrl?: string
  /** Hashtags for social sharing (without #) */
  hashtags?: string[]
}

const SITE_DOMAIN = "gpupoet.com"
const CLIPBOARD_FEEDBACK_DURATION = 2000

/**
 * Dropdown menu with social sharing options.
 * Supports Twitter/X, Reddit, LinkedIn, copy link, and image download.
 */
export function ShareMenu({
  title,
  url,
  imageUrl,
  hashtags = [],
}: ShareMenuProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Get the full URL for sharing
  const getShareUrl = useCallback((): string => {
    if (url) {
      return url.startsWith("http") ? url : `https://${SITE_DOMAIN}${url}`
    }
    if (typeof window === "undefined") {
      return ""
    }
    return window.location.href
  }, [url])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Reset copied state after timeout
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, CLIPBOARD_FEEDBACK_DURATION)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [copied])

  const handleTwitterShare = (): void => {
    const shareUrl = getShareUrl()
    const hashtagsParam =
      hashtags.length > 0 ? `&hashtags=${hashtags.join(",")}` : ""
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}${hashtagsParam}`
    window.open(twitterUrl, "_blank", "width=550,height=420")
    setIsOpen(false)
  }

  const handleRedditShare = (): void => {
    const shareUrl = getShareUrl()
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`
    window.open(redditUrl, "_blank", "width=600,height=600")
    setIsOpen(false)
  }

  const handleLinkedInShare = (): void => {
    const shareUrl = getShareUrl()
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(linkedInUrl, "_blank", "width=600,height=600")
    setIsOpen(false)
  }

  const handleCopyLink = async (): Promise<void> => {
    const shareUrl = getShareUrl()
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = shareUrl
      document.body.append(textArea)
      textArea.select()
      document.execCommand("copy")
      textArea.remove()
      setCopied(true)
    }
    setIsOpen(false)
  }

  const handleDownloadImage = (): void => {
    if (!imageUrl) return
    // Use relative URL for same-origin, full URL for external
    const downloadUrl = imageUrl.startsWith("http") ? imageUrl : imageUrl
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = "gpu-chart.png"
    link.click()
    setIsOpen(false)
  }

  return (
    <div className="share-menu" ref={menuRef}>
      <button
        className="share-menu-button"
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        <BootstrapIcon icon="share" size="xs" />
        <span>Share</span>
      </button>

      <div className={`share-menu-dropdown ${isOpen ? "open" : ""}`}>
        <button
          className="share-menu-item"
          onClick={handleTwitterShare}
          type="button"
        >
          <BootstrapIcon icon="twitter-x" size="xs" />
          <span>Twitter / X</span>
        </button>

        <button
          className="share-menu-item"
          onClick={handleRedditShare}
          type="button"
        >
          <BootstrapIcon icon="reddit" size="xs" />
          <span>Reddit</span>
        </button>

        <button
          className="share-menu-item"
          onClick={handleLinkedInShare}
          type="button"
        >
          <BootstrapIcon icon="linkedin" size="xs" />
          <span>LinkedIn</span>
        </button>

        <div className="share-menu-divider" />

        <button
          className="share-menu-item"
          onClick={handleCopyLink}
          type="button"
        >
          <BootstrapIcon
            icon={copied ? "clipboard-check" : "clipboard"}
            size="xs"
          />
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>

        {imageUrl && (
          <button
            className="share-menu-item"
            onClick={handleDownloadImage}
            type="button"
          >
            <BootstrapIcon icon="download" size="xs" />
            <span>Download Image</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ShareMenu
