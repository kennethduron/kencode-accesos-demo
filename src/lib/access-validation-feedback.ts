export type ValidationSource = "qr" | "manual";

export type ValidationGateResult<T> =
  | { started: false }
  | { started: true; value: T };

interface ValidationGateOptions {
  minimumVisibleMs?: number;
  now?: () => number;
  wait?: (milliseconds: number) => Promise<void>;
}

export interface AccessValidationGate {
  isProcessing: () => boolean;
  run: <T>(
    task: () => Promise<T>,
    onStart: () => void,
    onFinish: () => void,
  ) => Promise<ValidationGateResult<T>>;
}

const defaultWait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

export function createAccessValidationGate({
  minimumVisibleMs = 400,
  now = () => Date.now(),
  wait = defaultWait,
}: ValidationGateOptions = {}): AccessValidationGate {
  let processing = false;
  const minimumDuration = Math.max(0, minimumVisibleMs);

  return {
    isProcessing: () => processing,
    async run<T>(task: () => Promise<T>, onStart: () => void, onFinish: () => void) {
      if (processing) return { started: false };

      processing = true;
      const startedAt = now();

      try {
        onStart();
        const value = await task();
        return { started: true, value };
      } finally {
        const remaining = minimumDuration - (now() - startedAt);
        if (remaining > 0) await wait(remaining);
        processing = false;
        onFinish();
      }
    },
  };
}
