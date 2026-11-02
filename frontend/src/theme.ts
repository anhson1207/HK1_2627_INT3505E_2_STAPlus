import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#0f172a",
            dark: "#020617",
            light: "#f1f5f9",
            contrastText: "#ffffff",
        },
        success: {
            main: "#166534",
        },
        warning: {
            main: "#92400e",
        },
        error: {
            main: "#991b1b",
        },
        background: {
            default: "#f4f5f7",
            paper: "#ffffff",
        },
        text: {
            primary: "#0f172a",
            secondary: "#64748b",
        },
        divider: "#e2e8f0",
    },

    typography: {
        fontFamily: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

        h1: {
            fontSize: "24px",
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
                    borderRadius: 6,
                    boxShadow: "none",
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    border: "1px solid #e2e8f0",
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
