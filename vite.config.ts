import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Enable top-level await
    chunkSizeWarningLimit: 500, // Reduce warning limit for better performance
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor libraries - split more granularly
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // UI libraries
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('@heroicons')) {
              return 'heroicons';
            }
            
            // PDF processing
            if (id.includes('pdfjs-dist')) {
              return 'pdfjs';
            }
            if (id.includes('pdf-lib')) {
              return 'pdf-lib';
            }
            
            // Document processing
            if (id.includes('xlsx')) {
              return 'xlsx';
            }
            if (id.includes('mammoth')) {
              return 'mammoth';
            }
            
            // Image processing
            if (id.includes('html2canvas')) {
              return 'html2canvas';
            }
            if (id.includes('jspdf')) {
              return 'jspdf';
            }
            
            // Data processing
            if (id.includes('papaparse')) {
              return 'papaparse';
            }
            if (id.includes('purify.es')) {
              return 'purify';
            }
            
            // FFmpeg and video processing
            if (id.includes('@ffmpeg') || id.includes('ffmpeg')) {
              return 'ffmpeg';
            }
            
            // Other utilities
            if (id.includes('lodash') || id.includes('underscore')) {
              return 'utils';
            }
            
            // Remaining node_modules
            return 'vendor';
          }
          
          // Split tool pages by category for better caching
          if (id.includes('src/pages/tools/')) {
            // Audio tools
            if (id.includes('Audio')) {
              return 'audio-tools';
            }
            
            // Video tools
            if (id.includes('Video') || id.includes('Frame')) {
              return 'video-tools';
            }
            
            // Image tools
            if (id.includes('Image') || id.includes('QRCode') || id.includes('ColorPalette')) {
              return 'image-tools';
            }
            
            // Document tools
            if (id.includes('Word') || id.includes('Excel') || id.includes('CSV') || id.includes('PDF')) {
              return 'document-tools';
            }
            
            // Developer tools
            if (id.includes('Hash') || id.includes('Base64') || id.includes('Password') || 
                id.includes('CSS') || id.includes('Text') || id.includes('Regex') || 
                id.includes('Markdown') || id.includes('Column') || id.includes('Duplicate')) {
              return 'developer-tools';
            }
            
            // Archive tools
            if (id.includes('Zip') || id.includes('Archive') || id.includes('File') || 
                id.includes('Batch') || id.includes('SevenZip')) {
              return 'archive-tools';
            }
            
            // Calculation tools
            if (id.includes('Calculator') || id.includes('Date') || id.includes('Loan') || 
                id.includes('Tax') || id.includes('Percentage') || id.includes('Statistics') || 
                id.includes('Investment') || id.includes('BMI')) {
              return 'calculation-tools';
            }
            
            // Presentation tools
            if (id.includes('PPTX')) {
              return 'presentation-tools';
            }
            
            // Privacy tools
            if (id.includes('Encrypt') || id.includes('Decrypt') || id.includes('Secure') || 
                id.includes('Random') || id.includes('EXIF') || id.includes('Hash') || 
                id.includes('Shredder')) {
              return 'privacy-tools';
            }
            
            // Utility tools
            if (id.includes('Watermark') || id.includes('EXIF') || id.includes('Format') || 
                id.includes('JSON') || id.includes('Batch') || id.includes('TextFrom')) {
              return 'utility-tools';
            }
          }
          
          // Color design tools
          if (id.includes('src/tools/colorDesign/')) {
            return 'color-design-tools';
          }
          
          // Components
          if (id.includes('src/components/')) {
            if (id.includes('layout/')) {
              return 'layout-components';
            }
            if (id.includes('tools/')) {
              return 'tool-components';
            }
            return 'shared-components';
          }
          
          // Hooks and utilities
          if (id.includes('src/hooks/') || id.includes('src/utils/')) {
            return 'app-utils';
          }
          
          // Default to main chunk
          return undefined;
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    headers: {
      // Add security headers for SharedArrayBuffer support
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: {
    // Pre-bundle commonly used dependencies
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@heroicons/react'
    ]
  }
})
