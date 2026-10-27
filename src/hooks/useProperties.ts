import { useSyncExternalStore } from "react";
import { propertyService } from "@/services/propertyService";

export function useProperties() {
  return useSyncExternalStore(
    propertyService.subscribe,
    propertyService.getSnapshot,
    propertyService.getServerSnapshot,
  );
}

export function useProperty(id: string) {
  return useProperties().find((p) => p.id === id);
}
