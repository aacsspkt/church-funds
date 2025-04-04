import { useState } from "react";

import { Banknote, Church, Coins, LayoutDashboard, SquareUser } from "lucide-react";
import { Outlet, useLocation } from "react-router";

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
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

// const HOME = "HOME";
// const CHURCH = "CHURCH";
// const CHURCH_MEMBER = "CHURCH_MEMBER";
// const DASHANSA = "DASHANSA";

// const HOME_DASHBOARD = "/";
// const CHURCH_LIST = "/churches";
// const CHURCH_NEW = "/churches/new";
// const CHURCH_MEMBER_LIST = "/church-members";
// const CHURCH_MEMBER_NEW = "/church-members/new";
// const DASHANSA_LIST = "/dashansa-records";
// const DASHANSA_NEW = "/dashansa-records/new";

const Layout = () => {
	const [name, setName] = useState("");

	const { pathname } = useLocation();
	console.log("pathName:", pathname);

	const items = [
		{
			name: "Dashboard",
			path: "/",
			icon: LayoutDashboard,
		},
		{
			name: "Church",
			path: "/churches",
			icon: Church,
		},
		{
			name: "Church Members",
			path: "/church-members",
			icon: SquareUser,
		},
		{
			name: "Fund Types",
			path: "/fund-types",
			icon: Coins,
		},
		{
			name: "Funds",
			path: "/funds",
			icon: Banknote,
		},
	];

	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarHeader>
					<h1 className="text-2xl font-bold">Church Funds</h1>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								{items.map((item) => (
									<SidebarMenuItem key={item.name}>
										<SidebarMenuButton asChild>
											<a href={item.path}>
												<item.icon />
												<span>{item.name}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter />
			</Sidebar>

			<main className="w-full h-full">
				<section className="flex flex-col items-start justify-start border-sm border-red">
					<div className="w-full p-2 border-b border-gray-400 flex flex-row space-x-4">
						<SidebarTrigger className="p-2 w-9 h-9 border border-gray-300" />
						<input
							className="h-8 px-2  w-1/2 border border-gray-400 rounded"
							type="text"
							placeholder="Search Commands"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<Outlet />
				</section>
			</main>
		</SidebarProvider>
	);
};

export default Layout;
