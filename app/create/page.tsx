import { headers } from "next/headers";
import CreateClient from "./CreateClient";

export const revalidate = 0;

export default function CreatePage() {
  const headersList = headers();
  const country = headersList.get("x-vercel-ip-country") || "US";

  return <CreateClient defaultCountry={country} />;
}
