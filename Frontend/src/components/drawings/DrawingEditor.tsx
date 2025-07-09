import { Excalidraw, exportToCanvas } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Save } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  mutations,
  queries,
  queryClient,
  queryKeys,
} from "../../lib/queryFactory";
import { createExcalidrawColorPalette, getThemeColors } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTheme } from "../theme-provider";

export function DrawingEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Redirect to list if no ID provided
  if (!id) {
    navigate("/");
    return null;
  }

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentElements, setCurrentElements] = useState<any[]>([]);
  const [currentAppState, setCurrentAppState] = useState<any>({});

  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const colorPalette = createExcalidrawColorPalette(isDark);
  const themeColors = getThemeColors(isDark);

  // Load the drawing
  const {
    data: drawing,
    isLoading,
    error,
  } = useQuery({
    ...queries.drawings.byId(id),
    enabled: !!id,
  });

  // Update mutation only (no create since we create in modal)
  const updateMutation = useMutation({
    ...mutations.drawings.update(),
    onSuccess: (
      _: any,
      variables: { id: string; title: string; sceneData: string }
    ) => {
      // Invalidate queries to update both the list and current drawing
      queryClient.invalidateQueries({ queryKey: queryKeys.drawings });
      queryClient.invalidateQueries({
        queryKey: queryKeys.drawing(variables.id),
      });
      setHasUnsavedChanges(false);
    },
  });

  // Derive title from drawing data or use default
  const title = useMemo(() => {
    return drawing?.title || "Untitled Drawing";
  }, [drawing?.title]);

  // Derive scene data from drawing or use default
  const sceneData = useMemo(() => {
    if (drawing?.sceneData) {
      try {
        return JSON.parse(drawing.sceneData);
      } catch (error) {
        console.error("Failed to parse scene data:", error);
      }
    }
    return {
      elements: [],
      appState: { viewBackgroundColor: colorPalette.canvasBackground },
    };
  }, [drawing?.sceneData, colorPalette.canvasBackground]);

  // Prepare initial data for Excalidraw
  const initialData = useMemo(() => {
    return {
      elements: sceneData.elements || [],
      appState: {
        viewBackgroundColor: colorPalette.canvasBackground,
        currentItemStrokeColor: themeColors.text,
        currentItemBackgroundColor: colorPalette.elementBackground,
        currentItemFillStyle: "solid",
        currentItemStrokeWidth: 2,
        currentItemRoughness: 1,
        currentItemOpacity: 100,
        currentItemFontFamily: 1,
        currentItemFontSize: 20,
        currentItemTextAlign: "left",
        currentItemLinearStrokeSharpness: "round",
        gridSize: null,
        colorPalette: {
          canvasBackground: colorPalette.canvasBackground,
          elementBackground: colorPalette.elementBackground,
          elementStroke: colorPalette.elementStroke,
          appBackground: colorPalette.appBackground,
          custom: colorPalette.palette,
        },
        ...sceneData.appState,
      },
    };
  }, [sceneData, colorPalette, themeColors]);

  // Handle scene changes
  const handleChange = useCallback((elements: any, appState: any) => {
    setCurrentElements(elements);
    setCurrentAppState(appState);
    setHasUnsavedChanges(true);
  }, []);

  // Save drawing
  const handleSave = useCallback(async () => {
    const drawingTitle =
      (
        document.querySelector(
          'input[placeholder="Drawing title"]'
        ) as HTMLInputElement
      )?.value?.trim() || title;

    if (!drawingTitle) {
      alert("Please enter a title for your drawing");
      return;
    }

    const newSceneData = JSON.stringify({
      elements: currentElements,
      appState: {
        viewBackgroundColor: currentAppState.viewBackgroundColor,
        currentItemStrokeColor: currentAppState.currentItemStrokeColor,
        currentItemBackgroundColor: currentAppState.currentItemBackgroundColor,
        currentItemFillStyle: currentAppState.currentItemFillStyle,
        currentItemStrokeWidth: currentAppState.currentItemStrokeWidth,
        currentItemStrokeStyle: currentAppState.currentItemStrokeStyle,
        currentItemRoughness: currentAppState.currentItemRoughness,
        currentItemOpacity: currentAppState.currentItemOpacity,
        currentItemFontFamily: currentAppState.currentItemFontFamily,
        currentItemFontSize: currentAppState.currentItemFontSize,
        currentItemTextAlign: currentAppState.currentItemTextAlign,
        currentItemLinearStrokeSharpness:
          currentAppState.currentItemLinearStrokeSharpness,
        gridSize: currentAppState.gridSize,
        colorPalette: currentAppState.colorPalette,
      },
    });

    updateMutation.mutate({
      id: id!,
      title: drawingTitle,
      sceneData: newSceneData,
    });
  }, [currentElements, currentAppState, title, id, updateMutation]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (!excalidrawAPI) return;

    try {
      const canvas = await exportToCanvas({
        elements: excalidrawAPI.getSceneElements(),
        appState: excalidrawAPI.getAppState(),
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `${title}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Failed to export drawing:", error);
    }
  }, [excalidrawAPI, title]);

  // Back to drawings list
  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-lg text-foreground">Loading drawing...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-lg text-destructive">Failed to load drawing</div>
      </div>
    );
  }

  // Not found state
  if (!drawing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Drawing not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Input
            defaultValue={title}
            onChange={() => setHasUnsavedChanges(true)}
            className="max-w-md"
            placeholder="Drawing title"
          />
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600">Unsaved changes</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PNG
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Excalidraw Canvas */}
      <div className="h-full w-full">
        <Excalidraw
          excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
          initialData={initialData}
          onChange={handleChange}
          theme={isDark ? "dark" : "light"}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveAsImage: false,
            },
          }}
        />
      </div>
    </div>
  );
}
