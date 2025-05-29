declare module 'pdfjs-dist' {
  export const getDocument: any;
  export const GlobalWorkerOptions: any;
}
declare module 'pdfjs-dist/build/pdf.worker?worker' {
  const workerSrc: string;
  export default workerSrc;
}
declare module 'pdfjs-dist/legacy/build/pdf.mjs' {
  export const getDocument: any;
  export const GlobalWorkerOptions: any;
}
declare module 'pdfjs-dist/build/pdf';
declare module 'pdfjs-dist/build/pdf.worker.entry'; 