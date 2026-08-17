import { ClerkConvexProvider } from "./ClerkConvexProvider";

/** Single composition point for app-wide providers (auth, data, theme, ...). */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ClerkConvexProvider>{children}</ClerkConvexProvider>;
}
