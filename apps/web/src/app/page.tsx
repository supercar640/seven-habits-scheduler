import { redirect } from "next/navigation";

export default function HomePage() {
  // The Planner is the center of the product; send users there by default.
  redirect("/planner");
}
