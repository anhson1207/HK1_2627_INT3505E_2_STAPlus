import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#3B82F6",
            dark: "#2563EB",
            light: "#EFF6FF",
        },
        success: {
            main: "#22C55E",
        },
        warning: {
            main: "#F59E0B",
        },
        error: {
            main: "#EF4444",
        },
        background: {
            default: "#F8FAFC",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#0F172A",
            secondary: "#64748B",
        },
        divider: "#E2E8F0",
    },

    typography: {
        fontFamily: '"Be Vietnam Pro", sans-serif',

        h1: {
            fontSize: "28px",
            fontWeight: 600,
        },

        h2: {
            fontSize: "24px",
            fontWeight: 600,
        },

        h3: {
            fontSize: "20px",
            fontWeight: 600,
        },

        body1: {
            fontSize: "14px",
        },

        body2: {
            fontSize: "13px",
        },
    },

    shape: {
        borderRadius: 8,
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 7,
                    boxShadow: "none",
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    border: "1px solid #E2E8F0",
                    boxShadow: "none",
                    borderRadius: 8,
                },
            },
        },

        MuiTextField: {
            defaultProps: {
                size: "small",
            },
        },
    },
});
