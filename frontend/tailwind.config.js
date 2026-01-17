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
						background: "#0B2918", // Aztec - Main page background
						foreground: "#F3F6F2", // Snow Drift - Main body text
						primary: {
							50: "#FFF8E6",
							100: "#FFEDB3",
							200: "#FFE180",
							300: "#FFD54D",
							400: "#FFC91A",
							500: "#FFAC00", // Sun - Buttons, Active states, Links
							600: "#CC8A00",
							700: "#996700",
							800: "#664500",
							900: "#332200",
							DEFAULT: "#FFAC00",
							foreground: "#0B2918" // Dark text on primary for contrast
						},
						content1: "#143522", // Elevated Aztec - Cards
						content2: "#1c412c", // Custom - Sidebars / Input fields
						content3: "#245A3D",
						content4: "#2E6D4A",
						focus: "#FFAC00",
						divider: "#3A8058",
						default: {
							50: "#F5F7F4",
							100: "#E8ECE6",
							200: "#D4DCD0",
							300: "#B8C7B2",
							400: "#A3BFA0",
							500: "#92AB90", // Envy - Secondary text / Metadata
							600: "#748A72",
							700: "#5A6B58",
							800: "#3F4A3E",
							900: "#252A24",
							DEFAULT: "#92AB90",
							foreground: "#F3F6F2"
						}
					}
				},
				light: {
					colors: {
						background: "#FFFFFF",
						foreground: "#1A1A1A",
						primary: {
							50: "#FFF8E6",
							100: "#FFEDB3",
							200: "#FFE180",
							300: "#FFD54D",
							400: "#FFC91A",
							500: "#CC8A00", // Darkened Sun for light mode contrast
							600: "#A67000",
							700: "#805600",
							800: "#5A3C00",
							900: "#332200",
							DEFAULT: "#CC8A00",
							foreground: "#1A1A1A"
						},
						content1: "#FAFAFA",
						content2: "#F5F5F5",
						content3: "#EEEEEE",
						content4: "#E0E0E0",
						focus: "#CC8A00",
						default: {
							500: "#6B8A60"
						}
					}
				}
			}
		})
	]
};
