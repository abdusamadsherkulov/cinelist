import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import OnboardingForm from "@/components/OnboardingForm";

export default async function Onboarding() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.username) redirect("/");
  return <OnboardingForm name={user.name} />;
}