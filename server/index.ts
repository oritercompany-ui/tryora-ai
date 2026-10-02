import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000
const YOUCAM_API_KEY = process.env.YOUCAM_API_KEY
const YOUCAM_BASE_URL =
  'https://yce-api-01.makeupar.com'

const MAX_FILE_SIZE =
  10 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
})

app.use(cors())
app.use(
  express.json({
    limit: '15mb',
  }),
)

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Tryora API is running',
  })
})

/* =====================================================
   TRY-ON
   Photo + Product
   -> YouCam File API
   -> S3
   -> Makeup VTO
===================================================== */

app.post(
  '/api/try-on',
  upload.single('photo'),
  async (req, res) => {
    try {
      /* =================================================
         API KEY
      ================================================= */

      if (!YOUCAM_API_KEY) {
        return res.status(500).json({
          success: false,
          message:
            'YOUCAM_API_KEY is not configured',
        })
      }

      /* =================================================
         PHOTO REQUIRED
      ================================================= */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Photo is required',
        })
      }

      /* =================================================
         PHOTO VALIDATION
      ================================================= */

      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
      ]

      if (
        !allowedMimeTypes.includes(
          req.file.mimetype,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Only JPG, PNG, and WEBP images are supported',
        })
      }

      if (
        req.file.size >
        MAX_FILE_SIZE
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Image size must be less than 10MB',
        })
      }

      /* =================================================
         PRODUCT EFFECT
      ================================================= */

      let productEffect = {
        category: 'lip_color',
        color: '#E96B83',
        intensity: 70,
        texture: 'matte',
      }

      if (req.body.product) {
        try {
          const parsedProduct =
            JSON.parse(
              req.body.product,
            )

          if (
            parsedProduct.effect
          ) {
            productEffect = {
              category:
                parsedProduct.effect.category ||
                productEffect.category,

              color:
                parsedProduct.effect.color ||
                productEffect.color,

              intensity:
                parsedProduct.effect.intensity ??
                productEffect.intensity,

              texture:
                parsedProduct.effect.texture ||
                productEffect.texture,
            }
          }
        } catch (error) {
          console.error(
            'Invalid product data:',
            error,
          )

          return res.status(400).json({
            success: false,
            message:
              'Invalid product data',
          })
        }
      }

      console.log(
        'Selected product effect:',
        productEffect,
      )

      /* =================================================
         FILE INFORMATION
      ================================================= */

      const contentType =
        req.file.mimetype ||
        'image/jpeg'

      const fileName =
        req.file.originalname ||
        'tryora-photo.jpg'

      const fileSize =
        req.file.size

      console.log(
        'Received photo:',
        {
          name: fileName,
          type: contentType,
          size: fileSize,
        },
      )

      /* =================================================
         STEP 1
         REQUEST YOUCAM FILE API
      ================================================= */

      const fileResponse =
        await fetch(
          `${YOUCAM_BASE_URL}/s2s/v2.0/file`,
          {
            method: 'POST',

            headers: {
              Authorization:
                `Bearer ${YOUCAM_API_KEY}`,

              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              files: [
                {
                  content_type:
                    contentType,

                  file_name:
                    fileName,

                  file_size:
                    fileSize,
                },
              ],
            }),
          },
        )

      const fileResponseText =
        await fileResponse.text()

      let fileData: any

      try {
        fileData =
          JSON.parse(
            fileResponseText,
          )
      } catch {
        console.error(
          'Invalid File API response:',
          fileResponseText,
        )

        return res.status(502).json({
          success: false,
          message:
            'Invalid response from YouCam File API',
        })
      }

      if (
        !fileResponse.ok ||
        fileData.status !== 200
      ) {
        console.error(
          'YouCam File API error:',
          fileData,
        )

        return res.status(502).json({
          success: false,
          message:
            'YouCam File API request failed',
          details: fileData,
        })
      }

      const fileInfo =
        fileData?.data?.files?.[0]

      const fileId =
        fileInfo?.file_id

      const uploadRequest =
        fileInfo?.requests?.[0]

      const uploadUrl =
        uploadRequest?.url

      const uploadHeaders =
        uploadRequest?.headers || {}

      if (
        !fileId ||
        !uploadUrl
      ) {
        console.error(
          'Missing YouCam file upload information:',
          fileData,
        )

        return res.status(502).json({
          success: false,
          message:
            'YouCam did not return a valid upload URL',
        })
      }

      console.log(
        'YouCam file created:',
        {
          fileId,
          uploadUrlReceived:
            true,
        },
      )

      /* =================================================
         STEP 2
         UPLOAD PHOTO TO SIGNED S3 URL
      ================================================= */

      const s3Headers: Record<
        string,
        string
      > = {}

      if (
        uploadHeaders['Content-Type']
      ) {
        s3Headers[
          'Content-Type'
        ] =
          uploadHeaders[
            'Content-Type'
          ]
      } else {
        s3Headers[
          'Content-Type'
        ] = contentType
      }

      if (
        uploadHeaders[
          'Content-Length'
        ]
      ) {
        s3Headers[
          'Content-Length'
        ] =
          String(
            uploadHeaders[
              'Content-Length'
            ],
          )
      } else {
        s3Headers[
          'Content-Length'
        ] =
          String(fileSize)
      }

      const uploadResponse =
        await fetch(
          uploadUrl,
          {
            method: 'PUT',

            headers:
              s3Headers,

            body: new Uint8Array(
              req.file.buffer,
            ),
          },
        )

      if (
        !uploadResponse.ok
      ) {
        const uploadError =
          await uploadResponse.text()

        console.error(
          'S3 upload failed:',
          uploadResponse.status,
          uploadError,
        )

        return res.status(502).json({
          success: false,
          message:
            'Failed to upload photo to YouCam storage',
          status:
            uploadResponse.status,
        })
      }

      console.log(
        'Photo uploaded successfully to YouCam storage',
      )

      /* =================================================
         STEP 3
         CREATE MAKEUP VTO TASK
      ================================================= */

      /*
       * KEEPING THE WORKING LIP COLOR PAYLOAD
       */

      const vtoEffect =
        productEffect.category ===
        'lip_color'
          ? {
              category:
                productEffect.category,

              shape: {
                name: 'original',
              },

              style: {
                type: 'full',
              },

              palettes: [
                {
                  color:
                    productEffect.color,

                  texture:
                    productEffect.texture,

                  colorIntensity:
                    productEffect.intensity,
                },
              ],
            }
          : {
              category:
                productEffect.category,

              pattern: {
                name: '1color1',
              },

              palettes: [
                {
                  color:
                    productEffect.color,

                  texture:
                    productEffect.texture,

                  colorIntensity:
                    productEffect.intensity,
                },
              ],
            }

      const vtoPayload = {
        src_file_id:
          fileId,

        effects: [
          vtoEffect,
        ],

        version: '1.0',
      }

      console.log(
        'Sending VTO payload:',
        JSON.stringify(
          vtoPayload,
          null,
          2,
        ),
      )

      const vtoResponse =
        await fetch(
          `${YOUCAM_BASE_URL}/s2s/v2.0/task/makeup-vto`,
          {
            method: 'POST',

            headers: {
              Authorization:
                `Bearer ${YOUCAM_API_KEY}`,

              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              vtoPayload,
            ),
          },
        )

      const vtoResponseText =
        await vtoResponse.text()

      let vtoData: any

      try {
        vtoData =
          JSON.parse(
            vtoResponseText,
          )
      } catch {
        console.error(
          'Invalid Makeup VTO response:',
          vtoResponseText,
        )

        return res.status(502).json({
          success: false,
          message:
            'Invalid response from YouCam Makeup VTO',
        })
      }

      if (
        !vtoResponse.ok ||
        vtoData.status !== 200
      ) {
        console.error(
          'Makeup VTO creation failed:',
          vtoData,
        )

        return res.status(502).json({
          success: false,
          message:
            'Failed to create YouCam VTO task',
          details: vtoData,
        })
      }

      const taskId =
        vtoData?.data?.task_id

      if (!taskId) {
        return res.status(502).json({
          success: false,
          message:
            'YouCam did not return a task ID',
        })
      }

      console.log(
        'YouCam VTO task created:',
        taskId,
      )

      /* =================================================
         STEP 4
         POLL TASK STATUS
      ================================================= */

      const maxAttempts = 30

      const firstIntervalMs =
        1000

      const normalIntervalMs =
        1500

      let resultUrl:
        string | null =
        null

      let finalTaskData:
        any = null

      for (
        let attempt = 1;
        attempt <=
        maxAttempts;
        attempt++
      ) {
        /*
         * First check after 1 second.
         * Next checks every 1.5 seconds.
         */

        const intervalMs =
          attempt === 1
            ? firstIntervalMs
            : normalIntervalMs

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              intervalMs,
            ),
        )

        const statusResponse =
          await fetch(
            `${YOUCAM_BASE_URL}/s2s/v2.0/task/makeup-vto/${taskId}`,
            {
              method: 'GET',

              headers: {
                Authorization:
                  `Bearer ${YOUCAM_API_KEY}`,

                Accept:
                  'application/json',
              },
            },
          )

        const statusResponseText =
          await statusResponse.text()

        let statusData: any

        try {
          statusData =
            JSON.parse(
              statusResponseText,
            )
        } catch {
          console.error(
            'Invalid task status response:',
            statusResponseText,
          )

          return res.status(502).json({
            success: false,
            message:
              'Invalid response from YouCam task status API',
          })
        }

        if (
          !statusResponse.ok
        ) {
          console.error(
            'Task status request failed:',
            statusResponse.status,
            statusData,
          )

          return res.status(502).json({
            success: false,
            message:
              'Failed to check YouCam VTO task',
            status:
              statusResponse.status,
          })
        }

        finalTaskData =
          statusData?.data

        const taskStatus =
          statusData?.data
            ?.task_status

        console.log(
          `VTO attempt ${attempt}/${maxAttempts}:`,
          taskStatus,
        )

        /* =============================================
           SUCCESS
        ============================================= */

        if (
          taskStatus ===
          'success'
        ) {
          resultUrl =
            statusData?.data
              ?.results?.url ||
            null

          break
        }

        /* =============================================
           ERROR
        ============================================= */

        if (
          taskStatus ===
          'error'
        ) {
          console.error(
            'YouCam VTO processing error:',
            statusData?.data,
          )

          return res.status(502).json({
            success: false,

            message:
              statusData?.data
                ?.error_message ||
              statusData?.data
                ?.error ||
              'YouCam VTO processing failed',

            taskId,

            details:
              statusData?.data,
          })
        }
      }

      /* =================================================
         STEP 5
         TIMEOUT
      ================================================= */

      if (!resultUrl) {
        return res.status(504).json({
          success: false,

          message:
            'YouCam VTO processing timed out',

          taskId,

          lastStatus:
            finalTaskData,
        })
      }

      console.log(
        'YouCam VTO completed successfully',
      )

      /* =================================================
         STEP 6
         CLEAN RESPONSE
      ================================================= */

      return res.json({
        success: true,

        message:
          'Virtual try-on completed successfully',

        taskId,

        resultUrl,

        productEffect,

        result: {
          before: {
            available: true,
          },

          after: {
            available: true,
            url: resultUrl,
          },
        },
      })
    } catch (error) {
      console.error(
        'Try-on error:',
        error,
      )

      return res.status(500).json({
        success: false,
        message:
          'Failed to process virtual try-on',
      })
    }
  },
)

/* =====================================================
   MULTER ERROR HANDLER
===================================================== */

app.use(
  (
    error: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error(
      'Server error:',
      error,
    )

    if (
      error?.code ===
      'LIMIT_FILE_SIZE'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Image size must be less than 10MB',
      })
    }

    return res.status(500).json({
      success: false,
      message:
        'Something went wrong on the server',
    })
  },
)

/* =====================================================
   START SERVER
===================================================== */

app.listen(
  PORT,
  () => {
    console.log(
      `Tryora server running on http://localhost:${PORT}`,
    )
  },
)