'use client';

import { initialize } from "@/lib/utils";

export function Initializer({ expressUrl }: { expressUrl: string }) {
    initialize({ expressUrl });
    return null;
}