/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UBIDOTS_PRESENCE_DEVICE_ID?: string;
  readonly VITE_UBIDOTS_PRESENCE_TOKEN?: string;
  readonly VITE_UBIDOTS_PRESENCE_VARIABLE_LABEL?: string;
  readonly VITE_UBIDOTS_GAS_DEVICE_ID?: string;
  readonly VITE_UBIDOTS_GAS_TOKEN?: string;
  readonly VITE_UBIDOTS_GAS_VARIABLE_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
