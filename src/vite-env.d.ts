/// <reference types="vite/client" />

// Ensure ImportMeta.env is recognized (Vite client types augmentation)
interface ImportMeta {
  readonly env: ImportMetaEnv
}
