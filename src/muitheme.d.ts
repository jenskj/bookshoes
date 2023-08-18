declare module '@mui/material/styled' {
  // fix the type error when referencing the Theme object in your styled component
  interface Theme {
    border?: {
      main?: string;
    };
  }
}
