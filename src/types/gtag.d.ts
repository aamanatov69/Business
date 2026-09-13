export {};

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: "conversion",
      parameters: {
        send_to: string;
        value: number;
        currency: string;
      },
    ) => void;
  }
}
