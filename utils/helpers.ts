// deno-lint-ignore-file no-explicit-any
import iro, {
  blue,
  bold,
  green,
  red,
  yellow,
} from "https://deno.land/x/iro@1.0.3/mod.ts";

export function logNormal(message: string, data?: any) {
  console.log(iro(message, bold, blue));
  data && console.log(data);
}

export function logSuccess(message: string, data?: any) {
  console.log(iro(message, green));
  data && console.log(data);
}

export function logWarning(message: string, data?: any) {
  console.log(iro(message, bold, yellow));
  data && console.log(data);
}

export function logError(message: string, data?: any) {
  console.log(iro(message, bold, red));
  data && console.log(data);
}
