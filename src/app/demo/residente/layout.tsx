import type { ReactNode } from "react";
import { DemoAccessProvider } from "@/context/demo-access-context";

export default function ResidentLayout({ children }: { children: ReactNode }) {
  return <DemoAccessProvider>{children}</DemoAccessProvider>;
}
