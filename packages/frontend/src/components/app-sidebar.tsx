import { NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const navigation = [
  { to: '/', label: 'dashboard', icon: '⌂' },
  { to: '/clients', label: 'clients', icon: '◫' },
  { to: '/notes', label: 'notes', icon: '✎' },
  { to: '/orders', label: 'orders', icon: '▣' },
  { to: '/paids', label: 'paid', icon: '₽' },
  { to: '/events-log', label: 'events log', icon: '≣' },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { open } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
            LOGO
          </div>
          {open ? (
            <div>
              <p className="text-sm font-semibold">Проект</p>
              <p className="text-xs text-sidebar-foreground/60">Operations workspace</p>
            </div>
          ) : null}
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      className={({ isActive }) => (isActive ? 'data-[active=true]' : '')}
                      to={item.to}
                    >
                      {({ isActive }) => (
                        <span
                          className={[
                            'flex items-center gap-3',
                            isActive ? 'text-sidebar-primary-foreground' : '',
                          ].join(' ')}
                          data-active={isActive}
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center text-base">
                            {item.icon}
                          </span>
                          {open ? <span>{item.label}</span> : null}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-2xl bg-sidebar-accent px-3 py-3">
          
          {open ? (
            <>
              <p className="text-sm font-medium">
                {user ? `${user.first_name} ${user.last_name}` : 'Signed in'}
              </p>
              <p className="mt-1 text-xs text-sidebar-foreground/60">{user?.email}</p>
              <Button
                className="mt-3 w-full justify-center"
                onClick={() => void logout()}
                size="default"
                variant="secondary"
              >
                Log out
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="text-center text-xs font-semibold">{user?.first_name?.[0] ?? 'U'}</div>
              <Button
                className="h-8 w-8 rounded-full p-0"
                onClick={() => void logout()}
                size="default"
                variant="secondary"
              >
                ⎋
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
