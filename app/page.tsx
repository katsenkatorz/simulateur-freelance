import { Suspense } from "react";
import App from "@/components/simulateur";

export default function Page() {
  return (
    <Suspense>
      <App />
    </Suspense>
  );
}
