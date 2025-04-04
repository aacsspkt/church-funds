import "./App.css";

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ChurchEditPage from "./pages/church/Edit";
import ChurchListPage from "./pages/church/List";
import ChurchNewPage from "./pages/church/New";
import ChurchMemberEditPage from "./pages/churchMember/Edit";
import ChurchMemberListPage from "./pages/churchMember/List";
import ChurchMemberNewPage from "./pages/churchMember/New";
import FundEditPage from "./pages/funds/Edit";
import FundListPage from "./pages/funds/List";
import FundNewPage from "./pages/funds/New";
import FundTypeEditPage from "./pages/fundTypes/Edit";
import FundTypeListPage from "./pages/fundTypes/List";
import FundTypeNewPage from "./pages/fundTypes/New";
import HomePage from "./pages/home/Dashboard";
import Layout from "./pages/Layout";

const queryClient = new QueryClient();

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route
			path="/"
			element={<Layout />}
		>
			<Route
				index
				element={<HomePage />}
			/>
			<Route path="churches">
				<Route
					index
					element={<ChurchListPage />}
				/>
				<Route
					path="new"
					element={<ChurchNewPage />}
				/>
				<Route
					path=":id/edit"
					element={<ChurchEditPage />}
				/>
			</Route>

			<Route path="church-members">
				<Route
					index
					element={<ChurchMemberListPage />}
				/>
				<Route
					path="new"
					element={<ChurchMemberNewPage />}
				/>
				<Route
					path=":id/edit"
					element={<ChurchMemberEditPage />}
				/>
			</Route>
			<Route path="funds">
				<Route
					index
					element={<FundListPage />}
				/>
				<Route
					path="new"
					element={<FundNewPage />}
				/>
				<Route
					path=":id/edit"
					element={<FundEditPage />}
				/>
			</Route>
			<Route path="fund-types">
				<Route
					index
					element={<FundTypeListPage />}
				/>
				<Route
					path="new"
					element={<FundTypeNewPage />}
				/>
				<Route
					path=":id/edit"
					element={<FundTypeEditPage />}
				/>
			</Route>
		</Route>,
	),
);

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	);
}

export default App;
