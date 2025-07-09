import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { mutations, queryClient, queryKeys } from "../../lib/queryFactory";

interface CreateDrawingModalProps {
  children: React.ReactNode;
}

export function CreateDrawingModal({ children }: CreateDrawingModalProps) {
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const createMutation = useMutation({
    ...mutations.drawings.create(),
    onSuccess: (data) => {
      // Invalidate queries to update the drawing list
      queryClient.invalidateQueries({ queryKey: queryKeys.drawings });
      // Navigate to the new drawing editor
      navigate(`/drawing/${data._id}`);
      // Reset and close modal
      setName("");
      setIsOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate({
      title: name.trim(),
      sceneData: JSON.stringify({
        elements: [],
        appState: { viewBackgroundColor: "#ffffff" },
      }),
    });
  };

  const handleCancel = () => {
    setName("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Drawing</DialogTitle>
          <DialogDescription>
            Enter a name for your new drawing. You can always change it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My awesome drawing"
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>Creating...</>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Drawing
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateDrawingButton() {
  return (
    <CreateDrawingModal>
      <Button className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        New Drawing
      </Button>
    </CreateDrawingModal>
  );
}
