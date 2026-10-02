# TRYORA AI

### AI-Powered Virtual Makeup Try-On

TRYORA AI is a web-based virtual makeup try-on experience that lets users preview makeup products on their own photos before making a purchase.

The project combines an e-commerce-style product experience with AI-powered virtual try-on technology using the **YouCam API by Perfect Corp**.

---

## ✨ Features

- 📸 Upload a personal photo
- 💄 Browse virtual makeup products
- 🤖 AI-powered virtual try-on
- 💋 Lip color try-on
- 🌸 Blush try-on
- 👁️ Eyeshadow try-on
- 🖼️ Before & After comparison
- 🔄 Try different products on the same photo
- ⬇️ Download the generated result
- 📱 Responsive web interface
- ⚡ Fast image processing with optimized uploads

---

## 🛍️ Product Experience

TRYORA AI provides a simple shopping-oriented workflow:

**Choose a product → Upload a photo → Try it virtually → Compare the result → Download the result**

The goal is to help consumers visualize how makeup products may look before purchasing them.

---

## 🤖 YouCam API Integration

TRYORA AI uses **YouCam API** for the virtual makeup try-on functionality.

The backend handles the communication between the web application and YouCam API:

1. User uploads a photo.
2. TRYORA frontend sends the image and selected product information to the backend.
3. Backend uploads the image to YouCam's File API.
4. Backend creates a Makeup Virtual Try-On task.
5. The task is monitored until processing is completed.
6. The generated result is returned to the frontend.
7. TRYORA displays the Before & After result.

This architecture keeps the API key on the server instead of exposing it in the browser.

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      TRYORA AI      │
                    │    React + Vite     │
                    └──────────┬──────────┘
                               │
                               │ Photo + Product
                               ▼
                    ┌─────────────────────┐
                    │   Node.js Backend   │
                    │     Express API     │
                    └──────────┬──────────┘
                               │
                               │ API Request
                               ▼
                    ┌─────────────────────┐
                    │     YouCam API      │
                    │   Makeup VTO API    │
                    └──────────┬──────────┘
                               │
                               │ Generated Result
                               ▼
                    ┌─────────────────────┐
                    │   Before & After    │
                    │      TRYORA AI      │
                    └─────────────────────┘
```

---

## 🧰 Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- Multer
- Axios
- dotenv

### AI / Virtual Try-On

- YouCam API
- Perfect Corp Makeup Virtual Try-On API

---

## 📁 Project Structure

```text
tryora-ai/
│
├── public/
│
├── server/
│   ├── index.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── Youcam.rest
│
├── src/
│   ├── assets/
│   ├── components/
│   │   └── TryOnPanel.tsx
│   ├── data/
│   │   └── products.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/tryora-ai.git
cd tryora-ai
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure the YouCam API key

Create:

```text
server/.env
```

Use the provided example:

```text
YOUCAM_API_KEY=your_youcam_api_key
PORT=5000
```

**Never commit your real API key to GitHub.**

The `.env` file is excluded through `.gitignore`.

### 5. Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 6. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

The Vite development server will provide the local URL shown in the terminal.

---

## 🔑 Environment Variables

The backend uses:

| Variable | Description |
|---|---|
| `YOUCAM_API_KEY` | YouCam API authentication key |
| `PORT` | Backend server port |

Example:

```env
YOUCAM_API_KEY=your_youcam_api_key
PORT=5000
```

---

## 🔒 Security

The YouCam API key is stored on the backend and is **not exposed to the frontend**.

For production deployments, environment variables should be configured directly on the server rather than committed to the repository.

---

## 🎨 Available Products

TRYORA currently includes eight virtual makeup products:

| Product | Category |
|---|---|
| Soft Rose | Lip Color |
| Nude Bloom | Lip Color |
| Berry Glow | Lip Color |
| Classic Rouge | Lip Color |
| Rosy Blush | Blush |
| Peach Glow | Blush |
| Soft Brown | Eyeshadow |
| Champagne Shine | Eyeshadow |

---

## 💡 Consumer & Retail Value

Traditional online makeup shopping makes it difficult for consumers to visualize how a product will look on their own face.

TRYORA AI addresses this by providing an interactive virtual try-on experience before purchase.

The experience can help consumers:

- Explore different makeup options
- Visualize products using their own photo
- Compare different looks
- Reduce uncertainty before purchasing
- Create a more interactive digital beauty shopping experience

For retailers, the same concept can be integrated into an online product catalog to make product discovery and visualization more engaging.

---

## 🧪 Development

Build the frontend for production:

```bash
npm run build
```

The production frontend is generated in:

```text
dist/
```

---

## 📸 Demo

Screenshots and a demonstration video will showcase the complete TRYORA AI workflow:

```text
Select Product
      ↓
Upload Photo
      ↓
AI Virtual Try-On
      ↓
Before / After
      ↓
Download Result
```

---

## 🏆 Hackathon

TRYORA AI was created for the:

**YouCam API Skin AI & eCommerce VTO Hackathon**

Organized by **Perfect Corp**.

The project focuses on combining AI-powered virtual try-on technology with an e-commerce-oriented beauty experience.

---

## 📄 License

This project is provided for demonstration and hackathon purposes.

---

## 👤 Author

**TRYORA AI**

AI-powered virtual beauty try-on experience.