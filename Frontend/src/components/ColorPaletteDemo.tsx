import { useTheme } from "./theme-provider";
import { openColors, getThemeColors } from "../lib/utils";

export function ColorPaletteDemo() {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const themeColors = getThemeColors(isDark);

  const colorGroups = [
    { name: "Gray", colors: openColors.gray },
    { name: "Red", colors: openColors.red },
    { name: "Orange", colors: openColors.orange },
    { name: "Yellow", colors: openColors.yellow },
    { name: "Green", colors: openColors.green },
    { name: "Blue", colors: openColors.blue },
    { name: "Indigo", colors: openColors.indigo },
    { name: "Violet", colors: openColors.violet },
  ];

  return (
    <div className="p-6 bg-background">
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        Open Color Palette Integration
      </h2>

      {/* Theme Colors Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-foreground">
          Theme Colors
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(themeColors).map(([name, value]) => (
            <div key={name} className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-border"
                style={{ backgroundColor: value }}
              />
              <span className="text-sm text-foreground capitalize">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Color Groups */}
      <div className="space-y-6">
        {colorGroups.map((group) => (
          <div key={group.name}>
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              {group.name}
            </h3>
            <div className="flex space-x-2">
              {Object.entries(group.colors).map(([shade, value]) => (
                <div key={shade} className="text-center">
                  <div
                    className="w-12 h-12 rounded border border-border cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: value }}
                    title={`${group.name} ${shade}`}
                  />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {shade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tailwind Classes Demo */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3 text-foreground">
          Tailwind Classes
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="p-3 bg-blue-1 border border-blue-3 rounded">
              <span className="text-blue-9">Blue Light Theme</span>
            </div>
            <div className="p-3 bg-green-1 border border-green-3 rounded">
              <span className="text-green-9">Green Light Theme</span>
            </div>
            <div className="p-3 bg-violet-1 border border-violet-3 rounded">
              <span className="text-violet-9">Violet Light Theme</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-blue-8 border border-blue-6 rounded">
              <span className="text-blue-1">Blue Dark Theme</span>
            </div>
            <div className="p-3 bg-green-8 border border-green-6 rounded">
              <span className="text-green-1">Green Dark Theme</span>
            </div>
            <div className="p-3 bg-violet-8 border border-violet-6 rounded">
              <span className="text-violet-1">Violet Dark Theme</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3 text-foreground">
          Usage Examples
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-medium text-blue-6 mb-2">Primary Action</h4>
            <p className="text-sm text-muted-foreground">
              Using open-color blue for primary elements
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-medium text-green-6 mb-2">Success State</h4>
            <p className="text-sm text-muted-foreground">
              Using open-color green for success indicators
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-medium text-red-6 mb-2">Error State</h4>
            <p className="text-sm text-muted-foreground">
              Using open-color red for error messages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
