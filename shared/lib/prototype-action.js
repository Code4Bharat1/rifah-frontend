"use client";
import * as React from "react";

 






export const PrototypeActionContext = React.createContext(null);

export function usePrototypeAction() {
  return React.useContext(PrototypeActionContext);
}

/** Best-effort read of a button's visible text so the panel can name the action. */
export function extractLabel(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractLabel).join(" ").trim();
  if (React.isValidElement(node)) {
    const props = node.props ;
    return extractLabel(props?.children);
  }
  return "";
}
