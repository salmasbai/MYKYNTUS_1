import React from "react";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import { I18nProvider } from "./app/providers/I18nProvider";
import { AuthProvider } from "./app/providers/AuthProvider";
import { NotificationProvider } from "./app/providers/NotificationProvider";
import { NavigationProvider } from "./app/providers/NavigationProvider";
import { MainLayout } from "./app/layouts/MainLayout";
import { ParrainageHierarchyDrillProvider } from "../src/modules/parrainage/shared/contexts/ParrainageHierarchyDrillContext";

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <ParrainageHierarchyDrillProvider>
            <NotificationProvider>
              <NavigationProvider>
                <MainLayout />
              </NavigationProvider>
            </NotificationProvider>
          </ParrainageHierarchyDrillProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

