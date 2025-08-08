"use client";

import React, { useState, useEffect } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	Select,
	SelectItem,
	DatePicker,
	Textarea
} from "@heroui/react";
import { CalendarDate } from "@internationalized/date";

import { Application } from "./JobApplicationsDashboard";

interface JobApplicationModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (application: Application) => Promise<void>;
	application?: Application | null;
	mode: "create" | "edit";
}

// Available status options
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
	"Did Not Apply - Inbound Request"
];

export default function JobApplicationModal({
	isOpen,
	onOpenChange,
	onSave,
	application,
	mode
}: JobApplicationModalProps) {
	const [formData, setFormData] = useState({
		company_name: "",
		application_status: "",
		received_at: "",
		subject: "",
		job_title: "",
		email_from: ""
	});
	const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Reset form when modal opens/closes or application changes
	useEffect(() => {
		if (isOpen) {
			if (mode === "edit" && application) {
				setFormData({
					company_name: application.company_name || "",
					application_status: application.application_status || "",
					received_at: application.received_at || "",
					subject: application.subject || "",
					job_title: application.job_title || "",
					email_from: application.email_from || ""
				});

				// Parse the received_at date for the DatePicker
				if (application.received_at) {
					const date = new Date(application.received_at);
					setSelectedDate(new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()));
				}
			} else {
				// Reset form for create mode
				setFormData({
					company_name: "",
					application_status: "",
					received_at: "",
					subject: "",
					job_title: "",
					email_from: ""
				});
				setSelectedDate(
					new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
				);
			}
			setErrors({});
		}
	}, [isOpen, mode, application]);

	// Update received_at when date changes
	useEffect(() => {
		if (selectedDate) {
			const isoString = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}T00:00:00.000Z`;
			setFormData((prev) => ({ ...prev, received_at: isoString }));
		}
	}, [selectedDate]);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.company_name.trim()) {
			newErrors.company_name = "Company name is required";
		}

		if (!formData.application_status) {
			newErrors.application_status = "Application status is required";
		}

		if (!formData.job_title.trim()) {
			newErrors.job_title = "Job title is required";
		}

		if (!selectedDate) {
			newErrors.received_at = "Date is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		try {
			const applicationData: Application = {
				...formData,
				id: application?.id,
				received_at: formData.received_at
			};

			await onSave(applicationData);
			onOpenChange(false);
		} catch (error) {
			console.error("Error saving application:", error);
			// Handle error (you might want to show a toast or error message)
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	return (
		<Modal isOpen={isOpen} placement="center" scrollBehavior="inside" size="2xl" onOpenChange={onOpenChange}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">
							{mode === "create" ? "Add New Job Application" : "Edit Job Application"}
						</ModalHeader>
						<ModalBody>
							<div className="flex flex-col gap-4">
								<Input
									isRequired
									errorMessage={errors.company_name}
									isInvalid={!!errors.company_name}
									label="Company Name"
									placeholder="Enter company name"
									value={formData.company_name}
									onChange={(e) => handleInputChange("company_name", e.target.value)}
								/>

								<Select
									isRequired
									errorMessage={errors.application_status}
									isInvalid={!!errors.application_status}
									label="Application Status"
									placeholder="Select application status"
									selectedKeys={formData.application_status ? [formData.application_status] : []}
									onSelectionChange={(keys) => {
										const selectedStatus = Array.from(keys)[0] as string;
										handleInputChange("application_status", selectedStatus || "");
									}}
								>
									{STATUS_OPTIONS.map((status) => (
										<SelectItem key={status}>{status}</SelectItem>
									))}
								</Select>

								<div>
									<label className="block text-sm font-medium mb-2">
										Date Applied/Received <span className="text-red-500">*</span>
									</label>
									<DatePicker className="w-full" value={selectedDate} onChange={setSelectedDate} />
									{errors.received_at && (
										<p className="text-red-500 text-sm mt-1">{errors.received_at}</p>
									)}
								</div>

								<Input
									isRequired
									errorMessage={errors.job_title}
									isInvalid={!!errors.job_title}
									label="Job Title"
									placeholder="Enter job title"
									value={formData.job_title}
									onChange={(e) => handleInputChange("job_title", e.target.value)}
								/>

								<Textarea
									label="Subject/Description"
									maxRows={4}
									minRows={2}
									placeholder="Enter subject or description (optional)"
									value={formData.subject}
									onChange={(e) => handleInputChange("subject", e.target.value)}
								/>

								<Input
									label="Email From"
									placeholder="Enter sender email (optional)"
									value={formData.email_from}
									onChange={(e) => handleInputChange("email_from", e.target.value)}
								/>
							</div>
						</ModalBody>
						<ModalFooter>
							<Button color="danger" variant="light" onPress={onClose}>
								Cancel
							</Button>
							<Button color="primary" isLoading={isLoading} onPress={handleSubmit}>
								{mode === "create" ? "Add Application" : "Update Application"}
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
