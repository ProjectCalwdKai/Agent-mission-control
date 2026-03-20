"use client";

import { usePathname } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import RightRail from '@/components/layout/RightRail';
import BottomDrawer from '@/components/layout/BottomDrawer';

import Overview from '@/components/layout/sections/Overview';
import TasksCenter from '@/components/layout/sections/TasksCenter';
import AgentsCenter from '@/components/layout/sections/AgentsCenter';
import ApprovalsCenter from '@/components/layout/sections/ApprovalsCenter';
import OutputsCenter from '@/components/layout/sections/OutputsCenter';
import ActivityCenter from '@/components/layout/sections/ActivityCenter';
import DelegationCenter from '@/components/layout/sections/DelegationCenter';
import OfficeCenter from '@/components/layout/sections/OfficeCenter';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  let CenterPanelContent: React.ComponentType;
  switch (pathname) {
    case '/tasks':
      CenterPanelContent = TasksCenter;
      break;
    case '/agents':
      CenterPanelContent = AgentsCenter;
      break;
    case '/approvals':
      CenterPanelContent = ApprovalsCenter;
      break;
    case '/outputs':
      CenterPanelContent = OutputsCenter;
      break;
    case '/activity':
      CenterPanelContent = ActivityCenter;
      break;
    case '/delegation':
      CenterPanelContent = DelegationCenter;
      break;
    case '/office':
      CenterPanelContent = OfficeCenter;
      break;
    case '/':
    default:
      CenterPanelContent = Overview;
      break;
  }

  return (
    <>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white lg:block">
          <Sidebar />
        </aside>
        <div className="flex min-w-0 flex-1 overflow-hidden">
          <main className="min-w-0 flex-1 overflow-y-auto bg-zinc-50 p-6">
            <CenterPanelContent />
            {children}
          </main>
          <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-zinc-200 bg-white xl:block">
            <RightRail />
          </aside>
        </div>
      </div>
      <BottomDrawer />
    </>
  );
}
