import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContractorByProfileId } from "@/lib/queries/contractors";
import { getPortfolioPhotos } from "@/lib/queries/portfolio";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PortfolioManager } from "./portfolio-manager";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const contractor = await getContractorByProfileId(user.id);
  if (!contractor) redirect("/explore");

  const photos = await getPortfolioPhotos(contractor.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="mt-1 text-sm text-gray-500">
            Showcase your best work to attract new clients
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{photos.length}</p>
            <p className="text-xs text-gray-500">Total Photos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {photos.filter((p) => p.category === "pool").length}
            </p>
            <p className="text-xs text-gray-500">Pool</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {photos.filter((p) => p.category === "landscaping").length}
            </p>
            <p className="text-xs text-gray-500">Landscaping</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {photos.filter((p) => p.category === "maid").length}
            </p>
            <p className="text-xs text-gray-500">Maid</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload section + Gallery */}
      <PortfolioManager photos={photos} />
    </div>
  );
}
