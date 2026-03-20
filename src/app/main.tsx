import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

function ConvexWrappedApp() {
  const { isLoaded, userId } = useAuth()

  return (
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <ConvexWrappedApp />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
