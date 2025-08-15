declare module 'html2pdf.js' {
  interface Html2PdfInstance {
    from: (source: HTMLElement | string) => Html2PdfInstance;
    set: (options: unknown) => Html2PdfInstance;
    save: () => Promise<void>;
  }

  export default function html2pdf(): Html2PdfInstance;
}
