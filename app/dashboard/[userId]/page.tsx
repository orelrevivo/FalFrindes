import { redirect } from "next/navigation";

export default async function DashboardPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  redirect(`/dashboard/${userId}/profile`);
}
