import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { NotificationContextProvider } from './contexts/notification'
import { UserContextProvider } from './contexts/user'
import { MessageContextProvider } from './contexts/message'
import { ModalContextProvider } from './contexts/modal'
import { ThemeContextProvider } from './contexts/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeContextProvider>
      <ModalContextProvider>
        <MessageContextProvider>
          <NotificationContextProvider>
            <UserContextProvider>
              <App />
            </UserContextProvider>
          </NotificationContextProvider>
        </MessageContextProvider>
      </ModalContextProvider>
    </ThemeContextProvider>
  </StrictMode>,
)
