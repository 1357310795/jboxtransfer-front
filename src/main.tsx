import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { NotificationContextProvider } from './contexts/notification'
import { UserContextProvider } from './contexts/user'
import { MessageContextProvider } from './contexts/message'
import { ModalContextProvider } from './contexts/modal'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModalContextProvider>
      <MessageContextProvider>
        <NotificationContextProvider>
          <UserContextProvider>
            <App />
          </UserContextProvider>
        </NotificationContextProvider>
      </MessageContextProvider>
    </ModalContextProvider>
  </StrictMode>,
)
