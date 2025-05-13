import { SidebarNav, MobileSidebarTrigger } from "@/components/layout/sidebar-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <SidebarNav />
        <MobileSidebarTrigger />
        <SidebarInset className="flex-1">
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
