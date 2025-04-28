'use client'; // Sidebar likely needs client-side interactivity

import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
  Sidebar, // Corrected import based on shadcn docs
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarHeader // Optional header
} from "@/components/ui/sidebar"; // Make sure path is correct
import { Home, UserPlus, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have this from shadcn setup

// Menu items definition
export const menuItems = [
  {
    groupLabel: "Management",
    items: [
      {
        title: "Overview", // Changed from Home for clarity in dashboard context
        href: "/dashboard",
        icon: Home,
      },
      {
        title: "Register Participant",
        href: "/dashboard/register",
        icon: UserPlus,
      },
      {
        title: "View Participants", // Placeholder for admin view
        href: "/dashboard/admin", // Example admin route
        icon: Users,
      },
      // Add more admin links like export/import later
    ],
  },
  // You could add more groups here if needed
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Handle exact match for dashboard overview
    if (href === '/dashboard') {
      return pathname === href;
    }
    // Handle prefix match for other routes
    return pathname?.startsWith(href);
  };

  return (
    <Sidebar className="w-64 flex-shrink-0 border-r p-4 flex flex-col">
      {/* <SidebarHeader> Optional: Add logo or header content </SidebarHeader> */}
      <div className="mb-6 flex items-center justify-center py-2">
        <h2 className="text-xl font-semibold">Family Camp Admin</h2> {/* Example Header */}
      </div>
      <SidebarContent className="flex-grow">
        {menuItems.map((group) => (
          <SidebarGroup key={group.groupLabel}>
            {group.groupLabel && (
              <SidebarGroupLabel className="text-xs uppercase text-muted-foreground tracking-wider">
                {group.groupLabel}
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "justify-start",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {/* <SidebarFooter> Optional: Add footer content like settings or logout </SidebarFooter> */}
    </Sidebar>
  );
} 