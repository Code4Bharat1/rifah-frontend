"use client";
import dynamic from "next/dynamic";

const CustomerProfile = dynamic(
  () => import("@modules/customer").then((mod) => mod.CustomerProfile),
  { ssr: false }
);

export default function CustomerProfilePage(props) {
  return <CustomerProfile {...props} />;
}

