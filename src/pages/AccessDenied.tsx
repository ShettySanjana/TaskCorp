import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card-elevated p-10 max-w-md text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="font-display text-2xl font-bold">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          This area is restricted to workspace administrators. Your current
          role does not have permission to view it.
        </p>
        <Link to="/employee">
          <Button>Go to my dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
