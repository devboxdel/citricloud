import './index.css';
import { Suspense } from 'react';
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from './components/ThemeProvider';
import { ToastProvider } from './components/Toast';
import { LanguageProvider } from './context/LanguageContext';
const queryClient = new QueryClient();



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<div style={{background:'purple',color:'white',padding:32,fontWeight:'bold',fontSize:32}}>Loading...</div>}>
                <App />
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
