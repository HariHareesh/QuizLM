import { ClientConfig } from "@repo/shared/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let config: ClientConfig;

export function initialize(newConfig: ClientConfig) {
  config = newConfig;
}

export function getClientConfig(): ClientConfig {
  if (!config) {
    throw new Error("Config not initialized");
  }
  return config;
}