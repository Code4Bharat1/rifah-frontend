import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, } from "class-variance-authority";

import { cn } from "@shared/lib/utils";
import { extractLabel, usePrototypeAction } from "@shared/lib/prototype-action";


const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        brand: "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90",
        navy: "bg-navy text-navy-foreground shadow-sm hover:bg-navy/90",
        soft: "bg-primary-soft text-accent-foreground hover:bg-primary-soft/70",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        success: "bg-success text-success-foreground shadow-sm hover:bg-success/90",
        outline:
          "border border-input bg-surface shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2 md:h-10",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-7 text-[15px]",
        icon: "h-11 w-11 md:h-10 md:w-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);






const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, onClick, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const action = usePrototypeAction();

    // Prototype safety net: any button without its own handler still responds
    // with a panel describing the action, its data and next steps.
    const handleClick = React.useCallback(
      (event) => {
        onClick?.(event);
        if (onClick || asChild || props.type === "submit" || props.disabled) return;
        if (event.defaultPrevented) return;
        const label =
          extractLabel(children).trim() ||
          (props["aria-label"] ) ||
          "Prototype action";
        action?.open({ label });
      },
      [onClick, asChild, props.type, props.disabled, props["aria-label"], children, action],
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
