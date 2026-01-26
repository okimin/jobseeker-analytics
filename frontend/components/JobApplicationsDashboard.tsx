"use client";

import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Tooltip
} from "@heroui/react";

import JobApplicationModal from "./JobApplicationModal";

import { DownloadIcon, SortIcon, TrashIcon, EditIcon, PlusIcon } from "@/components/icons";

export interface Application {
	id?: string;
	company_name: string;
	application_status: string;
	received_at: string;
	job_title: string;
	normalized_job_title?: string;
	subject: string;
	email_from: string;
}

interface JobApplicationsDashboardProps {
	title?: string;
	data: Application[];
	loading: boolean;
	downloading: boolean;
	onDownloadCsv: () => void;
	onRemoveItem: (id: string) => void;
	initialSortKey?: string;
	searchTerm?: string;
	onSearchChange?: (term: string) => void;
	statusFilter?: string;
	onStatusFilterChange?: (status: string) => void;
	companyFilter?: string;
	onCompanyFilterChange?: (company: string) => void;
	normalizedJobTitleFilter?: string;
	onNormalizedJobTitleFilterChange?: (title: string) => void;
	hideRejections?: boolean;
	onHideRejectionsChange?: (hide: boolean) => void;
	hideApplicationConfirmations?: boolean;
	onHideApplicationConfirmationsChange?: (hide: boolean) => void;
	onNextPage: () => void;
	onPrevPage: () => void;
	currentPage: number;
	totalPages: number;
	onRefreshData?: () => void;
	readOnly?: boolean;
}

// Load sort key from localStorage or use default
const getInitialSortKey = (key: string) => {
	return typeof window !== "undefined" ? localStorage.getItem("sortKey") || key : key;
};

// Status options for inline add
const STATUS_OPTIONS = [
	"Application Confirmation",
	"Rejection",
	"Interview Invitation",
	"Offer Made",
	"Assessment Sent",
	"Availability Request",
	"Information Request",
	"Action Required From Company",
	"Hiring Freeze Notification",
	"Withdrew Application",
	"Did Not Apply - Inbound Request",
	"Outreach"
];

//Function to get the CSS class based on application status
function getStatusClass(status: string) {
	const normalized = status?.toLowerCase();
	switch (normalized) {
		case "rejection":
			return "bg-red-100 text-red-800 dark:bg-red-600 dark:text-white";
		case "offer made":
			return "bg-green-100 text-green-800 dark:bg-success dark:text-white";
		case "application confirmation":
			return "bg-blue-100 text-blue-800 dark:bg-primary dark:text-white";
		case "availability request":
			return "bg-emerald-100 text-emerald-800 dark:bg-emerald-600 dark:text-white";
		case "information request":
			return "bg-teal-100 text-teal-800 dark:bg-teal-600 dark:text-white";
		case "assessment sent":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-white";
		case "interview invitation":
			return "bg-cyan-100 text-cyan-800 dark:bg-cyan-600 dark:text-white";
		case "did not apply - inbound request":
			return "bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-white";
		case "action required from company":
			return "bg-lime-100 text-lime-800 dark:bg-lime-600 dark:text-white";
		case "hiring freeze notification":
			return "bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-white";
		case "withdrew application":
			return "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-600 dark:text-white";
		case "false positive":
			return "bg-amber-100 text-amber-800 dark:bg-amber-600 dark:text-white";
		case "outreach":
			return "bg-indigo-100 text-indigo-800 dark:bg-indigo-600 dark:text-white";
		default:
			return "bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-white";
	}
}

export default function JobApplicationsDashboard({
	title = "Job Applications Dashboard",
	data,
	loading,
	downloading,
	onDownloadCsv,
	onRemoveItem,
	initialSortKey = "Date (Newest)",
	searchTerm = "",
	onSearchChange,
	statusFilter = "",
	onStatusFilterChange,
	companyFilter = "",
	onCompanyFilterChange,
	normalizedJobTitleFilter = "",
	onNormalizedJobTitleFilterChange,
	hideRejections = true,
	onHideRejectionsChange,
	hideApplicationConfirmations = true,
	onHideApplicationConfirmationsChange,
	onRefreshData,
	readOnly = false
}: JobApplicationsDashboardProps) {
	const [sortedData, setSortedData] = useState<Application[]>([]);
	const [selectedKeys, setSelectedKeys] = useState(new Set([getInitialSortKey(initialSortKey)]));
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
	const [showDelete, setShowDelete] = useState(false);
	const [itemToRemove, setItemToRemove] = useState<string | null>(null);

	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	// Add/Edit modal state
	const [showApplicationModal, setShowApplicationModal] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

	// Inline add row state
	const [isAddingRow, setIsAddingRow] = useState(false);
	const [newRowData, setNewRowData] = useState({
		company_name: "",
		application_status: "Application Confirmation",
		received_at: new Date().toISOString().split("T")[0],
		job_title: "",
		subject: "",
		email_from: ""
	});
	const [isSavingNewRow, setIsSavingNewRow] = useState(false);

	// Keyboard shortcut: press "i" to insert new row
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't trigger if user is typing in an input, textarea, or select
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
				return;
			}
			// Don't trigger if a modal is open
			if (showDelete || showApplicationModal) {
				return;
			}
			// Press "i" to insert new row
			if (e.key === "i" && !readOnly && !isAddingRow) {
				e.preventDefault();
				setIsAddingRow(true);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [readOnly, isAddingRow, showDelete, showApplicationModal]);

	// Get unique statuses and companies for filter dropdowns
	const uniqueStatuses = React.useMemo(() => {
		const statuses = new Set(data.map((item) => item.application_status).filter(Boolean));
		return Array.from(statuses).sort();
	}, [data]);

	const uniqueCompanies = React.useMemo(() => {
		const companies = new Set(data.map((item) => item.company_name).filter(Boolean));
		return Array.from(companies).sort();
	}, [data]);

	const uniqueNormalizedJobTitles = React.useMemo(() => {
		const titles = new Set(
			data.map((item) => item.normalized_job_title).filter((title) => title && title.trim() !== "")
		);
		return Array.from(titles).sort();
	}, [data]);

	const selectedValue = React.useMemo(() => Array.from(selectedKeys).join(", ").replace(/_/g, ""), [selectedKeys]);

	// Sort data based on selected key
	useEffect(() => {
		const sortData = () => {
			const sorted = [...data];
			const sortKey = Array.from(selectedKeys)[0];

			switch (sortKey) {
				case "Date (Newest)":
					sorted.sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
					break;
				case "Date (Oldest)":
					sorted.sort((a, b) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime());
					break;
				case "Company":
					sorted.sort((a, b) => a.company_name.localeCompare(b.company_name));
					break;
				case "Job Title":
					sorted.sort((a, b) => a.job_title.localeCompare(b.job_title));
					break;
				case "Normalized Job Title":
					sorted.sort((a, b) => {
						const titleA = a.normalized_job_title?.toLowerCase() || "";
						const titleB = b.normalized_job_title?.toLowerCase() || "";
						return titleA.localeCompare(titleB);
					});
					break;
				case "Status":
					sorted.sort((a, b) => a.application_status.localeCompare(b.application_status));
					break;
				default:
					break;
			}
			setSortedData(sorted);
		};

		if (data.length > 0) {
			sortData();
		} else {
			setSortedData([]);
		}
	}, [selectedKeys, data]);

	const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	// Handle sorting selection change and store it in localStorage
	const handleSortChange = (keys: Set<string>) => {
		const sortKey = Array.from(keys)[0];
		localStorage.setItem("sortKey", sortKey);
		setSelectedKeys(new Set([sortKey]));
	};

	// Pagination controls
	const handleNextPage = () => {
		if (currentPage < Math.ceil(sortedData.length / pageSize)) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const totalPages = Math.ceil(sortedData.length / pageSize);

	// Inline row handlers
	const resetNewRow = () => {
		setNewRowData({
			company_name: "",
			application_status: "Application Confirmation",
			received_at: new Date().toISOString().split("T")[0],
			job_title: "",
			subject: "",
			email_from: ""
		});
		setIsAddingRow(false);
	};

	const handleSaveNewRow = async () => {
		if (!newRowData.company_name.trim() || !newRowData.job_title.trim()) return;

		setIsSavingNewRow(true);
		try {
			const response = await fetch(`${apiUrl}/job-applications`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					...newRowData,
					received_at: `${newRowData.received_at}T00:00:00.000Z`
				})
			});

			if (!response.ok) throw new Error("Failed to create application");

			resetNewRow();
			if (onRefreshData) onRefreshData();
		} catch (error) {
			console.error("Error creating application:", error);
		} finally {
			setIsSavingNewRow(false);
		}
	};

	const handleSaveApplication = async (application: Application) => {
		try {
			const url =
				modalMode === "create" ? `${apiUrl}/job-applications` : `${apiUrl}/job-applications/${application.id}`;

			const method = modalMode === "create" ? "POST" : "PUT";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify(application)
			});

			if (!response.ok) {
				throw new Error(`Failed to ${modalMode} application`);
			}

			// Refresh the data by calling the parent's refresh function or refetch
			setShowApplicationModal(false);

			// Call the refresh callback if provided
			if (onRefreshData) {
				onRefreshData();
			}
		} catch (error) {
			console.error(`Error ${modalMode === "create" ? "creating" : "updating"} application:`, error);
			throw error;
		}
	};

	return (
		<div className="p-6">
			<Modal isOpen={showDelete} onOpenChange={(isOpen) => setShowDelete(isOpen)}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">Confirm Removal</ModalHeader>
							<ModalBody>
								<p>
									Are you sure you want to remove this row? Every job application impacts your
									metrics, so it's important to keep all records unless we accidentally made a mistake
									and picked up a non-job-related record.
								</p>
							</ModalBody>
							<ModalFooter>
								<Button color="default" variant="ghost" onPress={onClose}>
									Cancel
								</Button>
								<Button
									color="danger"
									onPress={() => {
										if (itemToRemove) {
											onRemoveItem(itemToRemove); // Notify the parent to remove the item
											setItemToRemove(null); // Clear the selected item
											setShowDelete(false); // Close the modal
										}
									}}
								>
									Yes, remove it
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
			{/* Filter Row */}
			<div className="flex flex-wrap items-center gap-3 mb-4">
				{/* Search Input */}
				<input
					className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-[200px]"
					placeholder="Search company, job title..."
					type="text"
					value={searchTerm}
					onChange={(e) => onSearchChange?.(e.target.value)}
				/>

				{/* Status Filter */}
				<Dropdown>
					<DropdownTrigger>
						<Button
							color={statusFilter ? "primary" : "default"}
							isDisabled={!data || data.length === 0}
							size="sm"
							variant={statusFilter ? "solid" : "bordered"}
						>
							{statusFilter || "Status"}
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						aria-label="Status filter"
						selectedKeys={statusFilter ? new Set([statusFilter]) : new Set()}
						selectionMode="single"
						onSelectionChange={(keys) => {
							const selectedStatus = Array.from(keys)[0] as string;
							onStatusFilterChange?.(selectedStatus || "");
						}}
					>
						<>
							<DropdownItem key="">All Statuses</DropdownItem>
							{uniqueStatuses.map((status: string) => (
								<DropdownItem key={status}>{status}</DropdownItem>
							))}
						</>
					</DropdownMenu>
				</Dropdown>

				{/* Company Filter */}
				<Dropdown>
					<DropdownTrigger>
						<Button
							color={companyFilter ? "primary" : "default"}
							isDisabled={!data || data.length === 0}
							size="sm"
							variant={companyFilter ? "solid" : "bordered"}
						>
							{companyFilter || "Company"}
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						aria-label="Company filter"
						selectedKeys={companyFilter ? new Set([companyFilter]) : new Set()}
						selectionMode="single"
						onSelectionChange={(keys) => {
							const selectedCompany = Array.from(keys)[0] as string;
							onCompanyFilterChange?.(selectedCompany || "");
						}}
					>
						<>
							<DropdownItem key="">All Companies</DropdownItem>
							{uniqueCompanies.map((company: string) => (
								<DropdownItem key={company}>{company}</DropdownItem>
							))}
						</>
					</DropdownMenu>
				</Dropdown>

				{/* Job Title Filter */}
				<Dropdown>
					<DropdownTrigger>
						<Button
							color={normalizedJobTitleFilter ? "primary" : "default"}
							isDisabled={!data || data.length === 0}
							size="sm"
							variant={normalizedJobTitleFilter ? "solid" : "bordered"}
						>
							{normalizedJobTitleFilter || "Job Title"}
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						aria-label="Job title filter"
						selectedKeys={normalizedJobTitleFilter ? new Set([normalizedJobTitleFilter]) : new Set()}
						selectionMode="single"
						onSelectionChange={(keys) => {
							const selectedTitle = Array.from(keys)[0] as string;
							onNormalizedJobTitleFilterChange?.(selectedTitle || "");
						}}
					>
						<>
							<DropdownItem key="">All Job Titles</DropdownItem>
							{uniqueNormalizedJobTitles.map((title: string | undefined) =>
								title ? <DropdownItem key={title}>{title}</DropdownItem> : null
							)}
						</>
					</DropdownMenu>
				</Dropdown>

				{/* Hide Options Dropdown */}
				<Dropdown>
					<DropdownTrigger>
						<Button
							color={hideRejections || hideApplicationConfirmations ? "primary" : "default"}
							isDisabled={!data || data.length === 0}
							size="sm"
							variant={hideRejections || hideApplicationConfirmations ? "solid" : "bordered"}
						>
							Hide
							{hideRejections || hideApplicationConfirmations
								? ` (${(hideRejections ? 1 : 0) + (hideApplicationConfirmations ? 1 : 0)})`
								: ""}
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						aria-label="Hide options"
						closeOnSelect={false}
						selectedKeys={
							new Set([
								...(hideRejections ? ["rejections"] : []),
								...(hideApplicationConfirmations ? ["confirmations"] : [])
							])
						}
						selectionMode="multiple"
						onSelectionChange={(keys) => {
							const selectedKeys = Array.from(keys) as string[];
							onHideRejectionsChange?.(selectedKeys.includes("rejections"));
							onHideApplicationConfirmationsChange?.(selectedKeys.includes("confirmations"));
						}}
					>
						<DropdownItem key="rejections">Rejections</DropdownItem>
						<DropdownItem key="confirmations">Application Confirmations</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				{/* Sort Dropdown */}
				<Dropdown>
					<DropdownTrigger>
						<Button
							data-testid="Sort By"
							isDisabled={!data || data.length === 0}
							size="sm"
							startContent={<SortIcon />}
							variant="bordered"
						>
							{selectedValue}
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						aria-label="Sort options"
						selectedKeys={selectedKeys}
						selectionMode="single"
						onSelectionChange={(keys) => handleSortChange(keys as Set<string>)}
					>
						<DropdownItem key="Date (Newest)">Date (Newest)</DropdownItem>
						<DropdownItem key="Date (Oldest)">Date (Oldest)</DropdownItem>
						<DropdownItem key="Company">Company (A-Z)</DropdownItem>
						<DropdownItem key="Normalized Job Title">Job Title (A-Z)</DropdownItem>
						<DropdownItem key="Status">Status</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				{/* Spacer */}
				<div className="flex-1" />

				{/* Action Buttons */}
				<Button
					color="success"
					isDisabled={!data || data.length === 0}
					isLoading={downloading}
					size="sm"
					startContent={<DownloadIcon />}
					onPress={onDownloadCsv}
				>
					CSV
				</Button>
			</div>

			{loading ? (
				<p>Loading applications...</p>
			) : (
				<div className="overflow-x-auto bg-white dark:bg-black shadow-md rounded-lg">
					{/* Notion-style add row */}
					{!readOnly && (
						<div className="border-b border-gray-200 dark:border-gray-700">
							{isAddingRow ? (
								<div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20">
									<input
										autoFocus
										className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
										placeholder="Company *"
										value={newRowData.company_name}
										onChange={(e) => setNewRowData({ ...newRowData, company_name: e.target.value })}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveNewRow();
											if (e.key === "Escape") resetNewRow();
										}}
									/>
									<select
										className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
										value={newRowData.application_status}
										onChange={(e) =>
											setNewRowData({ ...newRowData, application_status: e.target.value })
										}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveNewRow();
											if (e.key === "Escape") resetNewRow();
										}}
									>
										<option value="">Status</option>
										{STATUS_OPTIONS.map((s) => (
											<option key={s} value={s}>
												{s}
											</option>
										))}
									</select>
									<input
										className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
										type="date"
										value={newRowData.received_at}
										onChange={(e) => setNewRowData({ ...newRowData, received_at: e.target.value })}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveNewRow();
											if (e.key === "Escape") resetNewRow();
										}}
									/>
									<input
										className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
										placeholder="Job Title *"
										value={newRowData.job_title}
										onChange={(e) => setNewRowData({ ...newRowData, job_title: e.target.value })}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveNewRow();
											if (e.key === "Escape") resetNewRow();
										}}
									/>
									{newRowData.application_status === "Outreach" && (
										<input
											className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
											placeholder="Who (name)"
											value={newRowData.email_from}
											onChange={(e) =>
												setNewRowData({ ...newRowData, email_from: e.target.value })
											}
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSaveNewRow();
												if (e.key === "Escape") resetNewRow();
											}}
										/>
									)}
									<Button
										color="primary"
										isDisabled={!newRowData.company_name.trim() || !newRowData.job_title.trim()}
										isLoading={isSavingNewRow}
										size="sm"
										onPress={handleSaveNewRow}
									>
										Add
									</Button>
									<Button size="sm" variant="light" onPress={resetNewRow}>
										Cancel
									</Button>
								</div>
							) : (
								<button
									className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
									onClick={() => setIsAddingRow(true)}
								>
									<PlusIcon className="w-4 h-4" />
									<span>New application</span>
								</button>
							)}
						</div>
					)}
					<Table
						aria-label="Applications Table"
						classNames={{
							th: "bg-content1 text-foreground dark:bg-content2 dark:text-foreground"
						}}
					>
						<TableHeader>
							<TableColumn className="text-center">Company</TableColumn>
							<TableColumn className="text-center">Status</TableColumn>
							<TableColumn className="text-center">Received</TableColumn>
							<TableColumn className="text-center">Job Title</TableColumn>
							<TableColumn className="text-center">Normalized Job Title</TableColumn>
							<TableColumn className="text-center">Subject</TableColumn>
							<TableColumn className="text-center">Sender</TableColumn>
							<TableColumn className="text-center">Actions</TableColumn>
						</TableHeader>
						<TableBody>
							{paginatedData.map((item) => (
								<TableRow
									key={item.id || item.received_at}
									className="hover:bg-default-100 dark:hover:bg-content2 transition-colors"
								>
									<TableCell className="max-w-[100px] text-center">
										{item.company_name || "--"}
									</TableCell>
									<TableCell className="max-w-[120px] break-words whitespace-normal text-center">
										<span
											className={`inline-flex items-center justify-center px-1.5 py-1 rounded text-sm font-medium ${getStatusClass(item.application_status)}`}
										>
											{item.application_status || "--"}
										</span>
									</TableCell>
									<TableCell className="text-center">
										{new Date(item.received_at).toLocaleDateString() || "--"}
									</TableCell>
									<TableCell className="max-w-[136px] break-words whitespace-normal text-center">
										{item.job_title || "--"}
									</TableCell>
									<TableCell className="max-w-[136px] break-words whitespace-normal text-center">
										{item.normalized_job_title || "--"}
									</TableCell>
									<TableCell className="max-w-[200px] break-words text-center">
										{item.subject || "--"}
									</TableCell>
									<TableCell className="max-w-[220px] break-words whitespace-normal text-center">
										{item.email_from || "--"}
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center gap-2">
											{!readOnly && (
												<>
													<Tooltip content="Edit">
														<Button
															isIconOnly
															size="sm"
															variant="light"
															onPress={() => {
																setSelectedApplication(item);
																setModalMode("edit");
																setShowApplicationModal(true);
															}}
														>
															<EditIcon className="text-gray-800 dark:text-gray-300" />
														</Button>
													</Tooltip>
													<Tooltip content="Remove">
														<Button
															isIconOnly
															size="sm"
															variant="light"
															onPress={() => {
																setItemToRemove(item.id || null);
																setShowDelete(true);
															}}
														>
															<TrashIcon className="text-gray-800 dark:text-gray-300" />
														</Button>
													</Tooltip>
												</>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
			<div className="flex justify-between items-center mt-4">
				<Button disabled={currentPage === 1} onPress={handlePreviousPage}>
					Previous
				</Button>
				<span>{`${currentPage} of ${totalPages}`}</span>
				<Button disabled={currentPage === totalPages} onPress={handleNextPage}>
					Next
				</Button>
			</div>

			{/* Add/Edit Application Modal */}
			<JobApplicationModal
				application={selectedApplication}
				isOpen={showApplicationModal}
				mode={modalMode}
				onOpenChange={setShowApplicationModal}
				onSave={handleSaveApplication}
			/>
		</div>
	);
}
