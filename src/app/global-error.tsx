"use client";

import NextError from "next/error";
import { useEffect } from "react";
import { captureAnalyticsException } from "@/lib/analytics";

export default function GlobalError({
  error,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    captureAnalyticsException(error);
  }, [error]);

  return (
    <html lang="es-EC">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
