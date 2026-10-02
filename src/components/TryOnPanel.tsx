import { useRef, useState } from 'react'
import {
  Camera,
  Download,
  ImagePlus,
  Sparkles,
  Upload,
  X,
  RotateCcw,
} from 'lucide-react'

import type { Product } from '../data/products'

interface TryOnPanelProps {
  product: Product
  onClose: () => void
}

interface TryOnResponse {
  success: boolean
  message?: string
  taskId?: string
  resultUrl?: string
}

function TryOnPanel({
  product,
  onClose,
}: TryOnPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [photo, setPhoto] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [processing, setProcessing] = useState(false)
  const [resultReady, setResultReady] = useState(false)
  const [resultUrl, setResultUrl] =
    useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  /* =====================================================
     RESIZE UPLOADED IMAGE
  ===================================================== */

  const resizeImage = (
    file: File,
    maxSize = 1024,
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        const originalWidth = img.width
        const originalHeight = img.height
        const minSize = 320

        if (
          originalWidth >= minSize &&
          originalHeight >= minSize &&
          originalWidth <= maxSize &&
          originalHeight <= maxSize
        ) {
          URL.revokeObjectURL(objectUrl)
          resolve(file)
          return
        }

        let scale = Math.min(
          maxSize / originalWidth,
          maxSize / originalHeight,
        )

        scale = Math.max(
          scale,
          minSize / originalWidth,
          minSize / originalHeight,
        )

        let width = Math.round(
          originalWidth * scale,
        )

        let height = Math.round(
          originalHeight * scale,
        )

        if (width < minSize) {
          const extraScale = minSize / width

          width = Math.round(
            width * extraScale,
          )

          height = Math.round(
            height * extraScale,
          )
        }

        if (height < minSize) {
          const extraScale = minSize / height

          width = Math.round(
            width * extraScale,
          )

          height = Math.round(
            height * extraScale,
          )
        }

        const canvas =
          document.createElement('canvas')

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')

        if (!ctx) {
          URL.revokeObjectURL(objectUrl)

          reject(
            new Error(
              'Unable to resize image.',
            ),
          )

          return
        }

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height,
        )

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl)

            if (!blob) {
              reject(
                new Error(
                  'Unable to process image.',
                ),
              )

              return
            }

            const resizedFile = new File(
              [blob],
              file.name,
              {
                type: 'image/jpeg',
                lastModified: Date.now(),
              },
            )

            resolve(resizedFile)
          },
          'image/jpeg',
          0.9,
        )
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)

        reject(
          new Error(
            'Unable to load image.',
          ),
        )
      }

      img.src = objectUrl
    })
  }

  /* =====================================================
     FILE UPLOAD
  ===================================================== */

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image file.',
      )
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        'Image size must be less than 10MB.',
      )
      return
    }

    try {
      const resizedFile =
        await resizeImage(file, 1024)

      const imageUrl =
        URL.createObjectURL(resizedFile)

      setPhoto(imageUrl)
      setSelectedFile(resizedFile)

      setResultReady(false)
      setResultUrl(null)
      setError(null)
    } catch (err) {
      console.error(
        'Image resize error:',
        err,
      )

      setError(
        'Unable to process your image.',
      )
    }
  }

  /* =====================================================
     GENERATE VIRTUAL TRY-ON
  ===================================================== */

  const handleTryOn = async () => {
    if (!selectedFile || processing) {
      return
    }

    setProcessing(true)
    setResultReady(false)
    setResultUrl(null)
    setError(null)

    try {
      const formData = new FormData()

      formData.append(
        'photo',
        selectedFile,
      )

      formData.append(
        'product',
        JSON.stringify(product),
      )

      console.log(
        'Sending product:',
        product,
      )

      const response = await fetch(
        'http://localhost:5000/api/try-on',
        {
          method: 'POST',
          body: formData,
        },
      )

      const data =
        (await response.json()) as TryOnResponse

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Failed to generate virtual try-on.',
        )
      }

      if (!data.resultUrl) {
        throw new Error(
          'YouCam did not return a result image.',
        )
      }

      setResultUrl(data.resultUrl)
      setResultReady(true)
    } catch (err) {
      console.error(
        'Try-on error:',
        err,
      )

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(
          'Something went wrong while generating your look.',
        )
      }
    } finally {
      setProcessing(false)
    }
  }

  /* =====================================================
     DOWNLOAD RESULT
  ===================================================== */

  const handleDownloadResult = async () => {
    if (!resultUrl || downloading) {
      return
    }

    setDownloading(true)
    setError(null)

    try {
      const response = await fetch(resultUrl)

      if (!response.ok) {
        throw new Error(
          'Unable to download the result image.',
        )
      }

      const blob = await response.blob()
      const blobUrl =
        URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      link.href = blobUrl
      link.download = `tryora-${product.name
        .toLowerCase()
        .replace(/\s+/g, '-')}-try-on.jpg`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error(
        'Download error:',
        err,
      )

      window.open(
        resultUrl,
        '_blank',
        'noopener,noreferrer',
      )
    } finally {
      setDownloading(false)
    }
  }

  /* =====================================================
     CHANGE PHOTO
  ===================================================== */

  const handleChangePhoto = () => {
    if (photo) {
      URL.revokeObjectURL(photo)
    }

    setPhoto(null)
    setSelectedFile(null)
    setResultReady(false)
    setResultUrl(null)
    setError(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  /* =====================================================
     TRY ANOTHER PRODUCT
  ===================================================== */

  const handleTryAnotherProduct = () => {
    if (photo) {
      URL.revokeObjectURL(photo)
    }

    setPhoto(null)
    setSelectedFile(null)
    setResultReady(false)
    setResultUrl(null)
    setError(null)

    onClose()
  }

  return (
    <div className="tryon-overlay">
      <div
        className="tryon-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tryon-title"
      >

        {/* =====================================================
            CLOSE
        ===================================================== */}

        <button
          type="button"
          className="tryon-close"
          onClick={onClose}
          aria-label="Close virtual try-on"
        >
          <X size={19} aria-hidden="true" />
        </button>


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="tryon-header">
          <div className="tryon-title">

            <div
              className="tryon-icon"
              aria-hidden="true"
            >
              <Sparkles size={19} />
            </div>

            <div>
              <span>TRYORA AI</span>

              <h2 id="tryon-title">
                {resultReady
                  ? 'Your Virtual Look'
                  : 'Virtual Try-On'}
              </h2>
            </div>

          </div>

          <div className="selected-product">
            <img
              src={product.image}
              alt={product.name}
            />

            <div>
              <span>{product.brand}</span>

              <strong>
                {product.name}
              </strong>
            </div>
          </div>
        </div>


        {/* =====================================================
            RESULT STATUS
        ===================================================== */}

        {resultReady && resultUrl && (
          <div className="tryon-result-status">
            <div>
              <Sparkles
                size={16}
                aria-hidden="true"
              />

              <div>
                <strong>
                  AI Virtual Try-On Complete
                </strong>

                <span>
                  Your look with {product.name} is ready.
                </span>
              </div>
            </div>

            <span className="result-status-pill">
              READY
            </span>
          </div>
        )}


        {/* =====================================================
            BODY
        ===================================================== */}

        <div className="tryon-body">

          {/* ===================================================
              PHOTO / RESULT AREA
          =================================================== */}

          <div className="photo-area">

            {photo ? (

              resultReady && resultUrl ? (

                /* =================================================
                   BEFORE / AFTER
                ================================================= */

                <div
                  className="before-after"
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'minmax(0, 1fr) minmax(0, 1fr)',
                    gap: '16px',
                    width: '100%',
                    alignItems: 'start',
                    position: 'relative',
                    boxSizing: 'border-box',
                  }}
                >

                  {/* BEFORE */}

                  <div
                    className="before-after-card"
                    style={{
                      minWidth: 0,
                      width: '100%',
                    }}
                  >
                    <div className="before-after-label">
                      <span className="before-dot" />
                      BEFORE
                    </div>

                    <div
                      className="before-after-image"
                      style={{
                        width: '100%',
                        aspectRatio: '4 / 5',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={photo}
                        alt="Before virtual try-on"
                        style={{
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  </div>


                  {/* AFTER */}

                  <div
                    className="before-after-card after-card"
                    style={{
                      minWidth: 0,
                      width: '100%',
                    }}
                  >
                    <div className="before-after-label after-label">
                      <Sparkles
                        size={9}
                        aria-hidden="true"
                      />
                      AFTER
                    </div>

                    <div
                      className="before-after-image"
                      style={{
                        width: '100%',
                        aspectRatio: '4 / 5',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={resultUrl}
                        alt="After AI virtual try-on"
                        style={{
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />

                      <div className="ai-result-badge">
                        <Sparkles
                          size={13}
                          aria-hidden="true"
                        />
                        AI PREVIEW READY
                      </div>
                    </div>
                  </div>


                  {/* CHANGE PHOTO */}

                  <button
                    type="button"
                    className="before-after-change"
                    onClick={handleChangePhoto}
                    style={{
                      gridColumn: '1 / -1',
                      justifySelf: 'center',
                      position: 'static',
                      transform: 'none',
                      marginTop: '2px',
                    }}
                  >
                    <RotateCcw
                      size={14}
                      aria-hidden="true"
                    />
                    Change photo
                  </button>

                </div>

              ) : (

                /* =================================================
                   UPLOADED PHOTO
                ================================================= */

                <div className="uploaded-photo">
                  <img
                    src={photo}
                    alt="Uploaded preview"
                  />

                  <button
                    type="button"
                    onClick={handleChangePhoto}
                  >
                    <RotateCcw
                      size={14}
                      aria-hidden="true"
                    />
                    Change photo
                  </button>
                </div>
              )

            ) : (

              /* =================================================
                 UPLOAD AREA
              ================================================= */

              <button
                type="button"
                className="upload-area"
                onClick={() =>
                  inputRef.current?.click()
                }
              >
                <div
                  className="upload-icon"
                  aria-hidden="true"
                >
                  <ImagePlus size={28} />
                </div>

                <strong>
                  Upload your photo
                </strong>

                <span>
                  Use a clear front-facing photo
                  for the best result
                </span>

                <div className="upload-hint">
                  <Upload
                    size={14}
                    aria-hidden="true"
                  />
                  JPG, PNG or WEBP up to 10MB
                </div>
              </button>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              hidden
            />

          </div>


          {/* ===================================================
              INFO PANEL
          =================================================== */}

          <div className="tryon-info">

            {/* PRODUCT */}

            <div className="info-section">
              <span className="info-label">
                SELECTED PRODUCT
              </span>

              <div className="product-preview">
                <img
                  src={product.image}
                  alt={product.name}
                />

                <div>
                  <strong>
                    {product.name}
                  </strong>

                  <span>
                    {product.category}
                  </span>

                  <small>
                    {product.price}
                  </small>
                </div>
              </div>
            </div>


            {/* RESULT DETAILS / STEPS */}

            {resultReady && resultUrl ? (

              <div className="info-section">
                <span className="info-label">
                  YOUR RESULT
                </span>

                <div className="result-details">
                  <div
                    className="result-detail-icon"
                    aria-hidden="true"
                  >
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <strong>
                      Virtual look created
                    </strong>

                    <span>
                      Powered by TRYORA AI
                    </span>
                  </div>
                </div>
              </div>

            ) : (

              <div className="info-section">
                <span className="info-label">
                  HOW IT WORKS
                </span>

                <div className="steps">

                  <div>
                    <b>01</b>

                    <span>
                      Upload your photo
                    </span>
                  </div>

                  <div>
                    <b>02</b>

                    <span>
                      AI analyzes your image
                    </span>
                  </div>

                  <div>
                    <b>03</b>

                    <span>
                      See your virtual look
                    </span>
                  </div>

                </div>
              </div>
            )}


            {/* =================================================
                RESULT ACTIONS
            ================================================= */}

            {resultReady && resultUrl ? (

              <div className="result-actions">

                <button
                  type="button"
                  className="download-button"
                  onClick={handleDownloadResult}
                  disabled={downloading}
                >
                  <span className="action-icon">
                    {downloading ? (
                      <span
                        className="spinner"
                        aria-label="Preparing download"
                      />
                    ) : (
                      <Download
                        size={18}
                        aria-hidden="true"
                      />
                    )}
                  </span>

                  <span className="action-content">
                    <strong>
                      {downloading
                        ? 'Preparing...'
                        : 'Download Result'}
                    </strong>

                    <small>
                      Save your AI look
                    </small>
                  </span>

                  {!downloading && (
                    <span
                      className="action-arrow"
                      aria-hidden="true"
                    >
                      ↓
                    </span>
                  )}
                </button>


                <button
                  type="button"
                  className="another-product-button"
                  onClick={handleTryAnotherProduct}
                >
                  <span className="action-icon secondary">
                    <Sparkles
                      size={17}
                      aria-hidden="true"
                    />
                  </span>

                  <span className="action-content">
                    <strong>
                      Try Another Product
                    </strong>

                    <small>
                      Explore another look
                    </small>
                  </span>

                  <span
                    className="action-arrow secondary-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>

              </div>

            ) : (

              <button
                type="button"
                className="generate-button"
                disabled={
                  !selectedFile ||
                  processing
                }
                onClick={handleTryOn}
              >
                {processing ? (
                  <>
                    <span
                      className="spinner"
                      aria-hidden="true"
                    />
                    Creating your look...
                  </>
                ) : (
                  <>
                    <Sparkles
                      size={17}
                      aria-hidden="true"
                    />
                    Generate virtual try-on
                  </>
                )}
              </button>
            )}


            {/* PHOTO REQUIRED */}

            {!photo && (
              <p className="photo-required">
                <Camera
                  size={13}
                  aria-hidden="true"
                />
                Upload a photo to continue
              </p>
            )}


            {/* PROCESSING */}

            {processing && (
              <div className="result-message">
                <Sparkles
                  size={14}
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    AI is creating your look
                  </strong>

                  <span>
                    This may take a few seconds.
                  </span>
                </div>
              </div>
            )}


            {/* RESULT READY */}

            {resultReady && (
              <div className="result-message">
                <Sparkles
                  size={14}
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    Preview generated
                  </strong>

                  <span>
                    Your virtual try-on result
                    is ready.
                  </span>
                </div>
              </div>
            )}


            {/* ERROR */}

            {error && (
              <div className="result-message">
                <X
                  size={14}
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    Generation failed
                  </strong>

                  <span>
                    {error}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default TryOnPanel