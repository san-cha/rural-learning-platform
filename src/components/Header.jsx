import { Globe, User } from "lucide-react";
import { Button } from "./components/ui/button";
import { OfflineBadge } from "./components/OfflineBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Header = ({ user, currentLanguage = "en", onLanguageChange }) => {
  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
  ];

  return (
    <header className="bg-card border-b border-border px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">📚 Rural Learning</h1>
          <OfflineBadge />
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={currentLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="font-medium">{user.name}</span>
              <span className="text-muted-foreground">({user.role})</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
