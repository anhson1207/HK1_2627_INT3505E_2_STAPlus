import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#18181b",
            dark: "#09090b",
            light: "#f4f4f5",
            contrastText: "#ffffff",
        },
        success: {
            main: "#15803d",
        },
        warning: {
            main: "#b45309",
        },
        error: {
            main: "#b91c1c",
        },
        background: {
            default: "#fafafa",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#18181b",
            secondary: "#71717a",
        },
        divider: "#e4e4e7",
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
                    border: "1px solid #e6e9ef",
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
