import { Button } from "@mui/material";
import { Globe } from "lucide-react";

interface GoogleLoginButtonProps {
    disabled?: boolean;
    onClick?: () => void;
}

export default function GoogleLoginButton({
    disabled = false,
    onClick,
}: GoogleLoginButtonProps) {
    return (
        <Button
            type="button"
            variant="outlined"
            fullWidth
            size="large"
            disabled={disabled}
            onClick={onClick}
            startIcon={<Globe size={18} />}
            sx={{
                textTransform: "none",
                fontWeight: 500,
                borderColor: "var(--crm-border)",
                color: "var(--crm-heading)",
                "&:hover": {
                    borderColor: "var(--crm-primary)",
                    backgroundColor: "var(--crm-surface-subtle)",
                },
            }}
        >
            Tiếp tục với Google
        </Button>
    );
}