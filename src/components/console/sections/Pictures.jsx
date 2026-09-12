import { useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const photos = [
  { file: 'landscape.svg', caption: 'Landscape placeholder' },
  { file: 'portrait.svg', caption: 'Portrait placeholder' },
  { file: 'square.svg', caption: 'Square placeholder' },
  { file: 'wide.svg', caption: 'Wide placeholder' },
]

export function Pictures({ controls }) {
  const { gallerySelection: selected, setGallerySelection, reducedMotion } = controls
  const initialIndex = useRef(selected)
  const [viewportRef, api] = useEmblaCarousel({
    loop: false, align: 'center', containScroll: false, startIndex: initialIndex.current,
    duration: reducedMotion ? 0 : 20, watchFocus: false,
  })
  useEffect(() => {
    if (!api) return
    const sync = () => setGallerySelection(api.selectedScrollSnap())
    api.on('select', sync).on('reInit', sync)
    return () => { api.off('select', sync).off('reInit', sync) }
  }, [api, setGallerySelection])
  const select = (index) => {
    if (index < 0 || index >= photos.length) return
    api?.scrollTo(index, !!reducedMotion)
  }
  return (
    <div className="picture-gallery" role="region" aria-roledescription="carousel" aria-label="Picture gallery"
      tabIndex={0} data-gallery onKeyDown={event => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          event.stopPropagation()
          select(selected + (event.key === 'ArrowLeft' ? -1 : 1))
        }
      }}>
      <div className="gallery-viewport" ref={viewportRef}>
        <div className="gallery-track">
          {photos.map((photo, index) => (
            <div className="gallery-slide" key={photo.file} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${photos.length}`}>
              <button className={`gallery-photo ${selected === index ? 'gallery-photo--selected' : ''}`}
                type="button" tabIndex={selected === index ? 0 : -1} aria-label={`View ${photo.caption.toLowerCase()}`}
                aria-pressed={selected === index} onClick={() => select(index)}>
                <img src={`${import.meta.env.BASE_URL}draft-gallery/${photo.file}`} alt={photo.caption} draggable={false} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="gallery-controls">
        <button type="button" aria-label="Previous picture" aria-disabled={selected === 0} onClick={() => select(selected - 1)}><ChevronLeft aria-hidden="true" /></button>
        <p role="status" aria-live="polite" aria-atomic="true">{selected + 1} / {photos.length}<span>{photos[selected].caption}</span></p>
        <button type="button" aria-label="Next picture" aria-disabled={selected === photos.length - 1} onClick={() => select(selected + 1)}><ChevronRight aria-hidden="true" /></button>
      </div>
      <p className="gallery-hint">Click a neighbor, use the arrows, or swipe.</p>
    </div>
  )
}
