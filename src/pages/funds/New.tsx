import { CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { FieldInfo } from "@/components/FieldInfo";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import db from "@/lib/database";
import { cn } from "@/lib/utils";
import { Select } from "@radix-ui/react-select";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";

export default function FundNewPage() {
	const navigate = useNavigate();

	const { error: membersError, data: members } = useQuery({
		queryKey: ["members"],
		queryFn: async () => {
			const result = await db.select("SELECT * FROM member ORDER BY created_at DESC");

			if (!result) {
				return [];
			}

			if (!Array.isArray(result)) {
				throw new Error("Result is not an array");
			}

			return result;
		},
	});

	if (membersError) {
		console.log("error:", membersError);
		return <div className="text-destructive">Some Error Occured.</div>;
	}

	const { error: fundTypeError, data: fundTypes } = useQuery({
		queryKey: ["fund_types"],
		queryFn: async () => {
			const result = await db.select("SELECT * FROM fund_type ORDER BY created_at DESC");

			if (!result) {
				return [];
			}

			if (!Array.isArray(result)) {
				throw new Error("Result is not an array");
			}

			return result;
		},
	});

	if (fundTypeError) {
		console.log("error:", fundTypeError);
		return <div className="text-destructive">Some Error Occured.</div>;
	}

	const form = useForm({
		defaultValues: {
			memberId: "",
			amount: 0,
			fundTypeId: "",
			endowDate: new Date().toLocaleDateString(),
		},
		onSubmit: async ({ value }) => {
			console.log("value:", value);

			const createdAt = Math.floor(Date.now() / 1000);
			const modifiedAt = createdAt;
			const result = await db.execute(
				"INSERT into fund (member_id, fund_type_id, amount, endow_date, created_at, modified_at) VALUES ($1, $2, $3, $4, $5, $6)",
				[
					value.memberId,
					value.fundTypeId,
					value.amount,
					value.endowDate,
					createdAt,
					modifiedAt,
				],
			);

			console.log("result", result);

			if (result.rowsAffected) {
				toast.success(<div>Fund created successfully!</div>);
			} else {
				toast.error(<div>Error creating fund!</div>);
			}

			navigate("/funds");
		},
	});

	return (
		<div className="w-full min-w-fit">
			<Breadcrumb className="p-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/funds">Funds</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>New</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<h1 className="px-4 py-6 text-2xl font-bold">Create New Fund</h1>
			<form
				className="w-full flex flex-col p-4 space-y-2"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div className="flex flex-col space-y-2">
					<form.Field
						name="memberId"
						validators={{
							onChange: ({ value }) => (!value ? "Member is required" : undefined),
							// onChangeAsyncDebounceMs: 500,
							// onChangeAsync: async ({ value }) => {
							// 	await new Promise((resolve) => setTimeout(resolve, 1000));
							// 	return (
							// 		value.includes("error") && 'No "error" allowed in first name'
							// 	);
							// },
						}}
						children={(field) => (
							<>
								<div className="flex items-baseline flex-row space-x-4">
									<Label
										className="w-36"
										htmlFor={field.name}
									>
										Member:
									</Label>
									<Select onValueChange={field.handleChange}>
										<SelectTrigger className="min-w-xl p-2 border border-gray-400 rounded">
											<SelectValue placeholder="Select a member" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Members</SelectLabel>
												{members
													? members.map((member) => {
															return (
																<SelectItem
																	key={member.id}
																	value={member.id.toString()}
																>
																	{member.name}
																</SelectItem>
															);
													  })
													: null}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
								<FieldInfo field={field} />
							</>
						)}
					/>
					<form.Field
						name="fundTypeId"
						validators={{
							onChange: ({ value }) => (!value ? "Fund Type is required" : undefined),
							// onChangeAsyncDebounceMs: 500,
							// onChangeAsync: async ({ value }) => {
							// 	await new Promise((resolve) => setTimeout(resolve, 1000));
							// 	return (
							// 		value.includes("error") && 'No "error" allowed in first name'
							// 	);
							// },
						}}
						children={(field) => (
							/* Avoid hasty abstractions. Render props are great!*/ <>
								<div className="flex items-baseline flex-row space-x-4">
									<Label
										className="w-36"
										htmlFor={field.name}
									>
										Fund Type:
									</Label>
									<Select onValueChange={field.handleChange}>
										<SelectTrigger className="min-w-xl p-2 border border-gray-400 rounded">
											<SelectValue placeholder="Select a fund type" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Fund Types</SelectLabel>
												{fundTypes
													? fundTypes.map((fundType) => {
															return (
																<SelectItem
																	key={fundType.id}
																	value={fundType.id.toString()}
																>
																	{fundType.name}
																</SelectItem>
															);
													  })
													: null}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
								<FieldInfo field={field} />
							</>
						)}
					/>
					<form.Field
						name="amount"
						validators={{
							onChange: ({ value }) =>
								!value
									? "Amount is required"
									: Number.isNaN(value)
									? "Invalid number provided"
									: Number(value) <= 0
									? "Amount must be a positive number"
									: Number(value) > Number.MAX_SAFE_INTEGER
									? "Amount must be less than " + Number.MAX_SAFE_INTEGER
									: undefined,
						}}
						children={(field) => (
							<>
								<div className="flex items-baseline flex-row space-x-4">
									<Label
										className="w-36"
										htmlFor={field.name}
									>
										Amount:
									</Label>
									<Input
										className="w-xl p-2 border border-gray-400 rounded"
										id={field.name}
										name={field.name}
										type="number"
										value={field.state.value}
										onBlur={field.handleBlur}
										step={0.01}
										onChange={(e) => field.handleChange(e.target.valueAsNumber)}
									/>
								</div>
								<FieldInfo field={field} />
							</>
						)}
					/>

					<form.Field
						name="endowDate"
						validators={{
							onChange: ({ value }) =>
								!value ? "Endow date is required" : undefined,
						}}
						children={(field) => (
							<>
								<div className="flex items-baseline flex-row space-x-4">
									<Label
										className="w-36"
										htmlFor={field.name}
									>
										Endow Date:
									</Label>
									<Popover>
										<PopoverTrigger
											className={cn(
												"min-w-xl flex flex-row space-x-2 items-center p-2 border border-gray-300 rounded text-left font-normal focus:outline-gray-400",
												!field.state.value && "text-muted-foreground",
											)}
										>
											<CalendarIcon className="w-4 h-4" />
											<span className="text-sm">
												{field.state.value
													? field.state.value
													: "Pick a date"}
											</span>
											{/* </Button> */}
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0"
											align="start"
										>
											<Calendar
												mode="single"
												selected={
													field.state.value
														? new Date(field.state.value)
														: undefined
												}
												onSelect={(date) =>
													date &&
													field.handleChange(date.toLocaleDateString())
												}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>
								<FieldInfo field={field} />
							</>
						)}
					/>

					<div className="flex flex-row space-x-4 items-baseline ">
						<Button
							type="submit"
							className="w-36 rounded text-center items-center mt-4 p-3 shadow text-white"
						>
							Save
						</Button>
						{/* <Button
							type="button"
							onClick={async () => await deleteFund(Number(id!))}
							variant={"destructive"}
							className="w-36 rounded text-center items-center mt-4 p-3 shadow text-white"
						>
							Delete
						</Button> */}
					</div>

					<Button
						onClick={async () => await navigate("/funds")}
						className="w-36 rounded text-center items-center p-3 mt-4 shadow border border-gray-300 text-primary"
						variant={"secondary"}
					>
						Back
					</Button>
				</div>
			</form>
		</div>
	);
}
