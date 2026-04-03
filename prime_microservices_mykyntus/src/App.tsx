import { Layout } from './prime/components/Layout';
import { RoleProvider } from './prime/contexts/RoleContext';
import { ThemeProvider } from './prime/contexts/ThemeContext';
import { I18nProvider } from './prime/contexts/I18nContext';
import { NotificationProvider } from './prime/contexts/NotificationContext';
import { PrimeSectionProvider } from './prime/contexts/PrimeSectionContext';
import { HierarchyDrillProvider } from './prime/contexts/HierarchyDrillContext';

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <NotificationProvider>
          <RoleProvider>
            <HierarchyDrillProvider>
              <PrimeSectionProvider>
                <Layout />
              </PrimeSectionProvider>
            </HierarchyDrillProvider>
          </RoleProvider>
        </NotificationProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
