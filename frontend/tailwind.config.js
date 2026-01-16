import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)"],
				mono: ["var(--font-mono)"]
			}
		}
	},
	darkMode: "class",
	plugins: [
		heroui({
			themes: {
				dark: {
					colors: {
						background: "#0B2918",
						foreground: "#F5F7F4", // Increased brightness for better contrast (WCAG AA)
						primary: {
							50: "#FFF8E6",
							100: "#FFEDB3",
							200: "#FFE180",
							300: "#FFD54D",
							400: "#FFC91A",
							500: "#FFBD00", // Slightly brighter for better contrast
							600: "#CC9700",
							700: "#997100",
							800: "#664C00",
							900: "#332600",
							DEFAULT: "#FFBD00",
							foreground: "#1A1A1A" // Dark text on primary for 7:1+ contrast
						},
						content1: "#1A4530", // Lightened for better text contrast
						content2: "#245A3D", // Lightened for better text contrast
						content3: "#2E6D4A",
						content4: "#3A8058",
						focus: "#FFBD00",
						divider: "#3A8058",
						default: {
							50: "#F5F7F4",
							100: "#E8ECE6",
							200: "#D4DCD0",
							300: "#B8C7B2",
							400: "#8FA886",
							500: "#6B8A60",
							600: "#4A6B40",
							700: "#3A5432",
							800: "#2A3D24",
							900: "#1A2616",
							DEFAULT: "#3A5432",
							foreground: "#F5F7F4"
						}
					}
				},
				light: {
					colors: {
						background: "#FFFFFF",
						foreground: "#1A1A1A", // High contrast dark text
						primary: {
							50: "#FFF8E6",
							100: "#FFEDB3",
							200: "#FFE180",
							300: "#FFD54D",
							400: "#FFC91A",
							500: "#D49A00", // Darkened for better contrast on light backgrounds
							600: "#A67800",
							700: "#785600",
							800: "#4A3500",
							900: "#1C1400",
							DEFAULT: "#D49A00",
							foreground: "#1A1A1A"
						},
						content1: "#FAFAFA",
						content2: "#F5F5F5",
						content3: "#EEEEEE",
						content4: "#E0E0E0",
						focus: "#D49A00"
					}
				}
			}
		})
	]
};
