import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle 
} from "@/components/ui/card";

interface CreatorCardProps {
  displayName: string;
  profilePhotoUrl?: string;
  accentColor: string;
  bio?: string;
}

export function CreatorCard({ displayName, profilePhotoUrl, accentColor, bio }: CreatorCardProps) {
  return (
    <Card style={{ borderColor: accentColor }}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          {profilePhotoUrl ? (
            <img
              src={profilePhotoUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor + "20" }}
            >
              <span className="text-lg font-medium" style={{ color: accentColor }}>
                {displayName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold">
              {displayName}
            </h3>
            {bio && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}