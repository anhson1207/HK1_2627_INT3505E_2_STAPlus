import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#c2410c",
            dark: "#9a3412",
            light: "#fff7ed",
            contrastText: "#ffffff",
        },
        success: {
            main: "#16a34a",
        },
        warning: {
            main: "#d97706",
        },
        error: {
            main: "#dc2626",
        },
        background: {
            default: "#faf8f5",
            paper: "#ffffff",
        },
        text: {
            primary: "#1c1917",
            secondary: "#78716c",
        },
        divider: "#e7e5e4",
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
                    border: "1px solid #e7e5e4",
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
