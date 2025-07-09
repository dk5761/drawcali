import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  queries,
  mutations,
  queryClient,
  queryKeys,
} from "../../lib/queryFactory";
import { useAuthStore } from "../../stores/authStore";
import { CreateDrawingButton } from "./CreateDrawingModal";
import { ModeToggle } from "../theme-toggle";
import { Trash2, Edit, LogOut } from "lucide-react";

export function DrawingList() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const {
    data: drawings = [],
    isLoading,
    error,
  } = useQuery(queries.drawings.all());

  const deleteMutation = useMutation({
    ...mutations.drawings.delete(),
    onSuccess: () => {
      // Invalidate the drawings list query to update the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.drawings });
    },
  });

  const handleEditDrawing = (id: string) => {
    navigate(`/drawing/${id}`);
  };

  const handleDeleteDrawing = (id: string) => {
    if (window.confirm("Are you sure you want to delete this drawing?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg text-foreground">Loading your drawings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg text-destructive">Failed to load drawings</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Drawings</h1>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <CreateDrawingButton />
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {drawings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No drawings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first drawing to get started
                </p>
                {/* <CreateDrawingButton /> */}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drawings.map((drawing) => (
              <Card
                key={drawing._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEditDrawing(drawing._id!)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{drawing.title}</CardTitle>
                  <CardDescription>
                    Drawing • Last modified recently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDrawing(drawing._id!);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDrawing(drawing._id!);
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
