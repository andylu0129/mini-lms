"use client";

import { Label as LabelPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/shadcn/lib/utils";
import { cva } from "class-variance-authority";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(labelVariants(), className)}
      {...props}
    />
  );
}
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
