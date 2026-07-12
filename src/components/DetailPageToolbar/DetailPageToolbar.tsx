"use client";

import type { ReactNode } from "react";
import { Box, Button, Container, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { publicContainerSx } from "@/theme/layout";

type DetailPageToolbarProps = {
  backLabel: string;
  onBack: () => void;
  actions?: ReactNode;
  belowNavbar?: boolean;
};

export default function DetailPageToolbar({
  backLabel,
  onBack,
  actions,
  belowNavbar = false,
}: DetailPageToolbarProps) {
  const theme = useTheme();

  return (
    <Box
      component="nav"
      aria-label="Detail page navigation"
      sx={{
        position: "sticky",
        top: belowNavbar ? { xs: 56, sm: 64 } : 0,
        mt: belowNavbar ? { xs: "56px", sm: "64px" } : 0,
        zIndex: theme.zIndex.appBar - 1,
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflowX: "clip",
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        boxShadow: `0 10px 28px ${alpha(theme.palette.common.black, 0.32)}`,
      }}
    >
      <Container maxWidth="xl" sx={publicContainerSx}>
        <Box
          sx={{
            minHeight: { xs: 58, sm: 54 },
            py: 0.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "nowrap",
            minWidth: 0,
            gap: { xs: 1.25, sm: 1.5 },
          }}
        >
          <Button
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            color="inherit"
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontWeight: 500,
              px: 1,
              "&:hover": {
                color: "primary.main",
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {backLabel}
          </Button>

          {actions && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                flexWrap: "nowrap",
                width: "auto",
                maxWidth: { xs: "58%", sm: "none" },
                minWidth: 0,
                overflowX: { xs: "auto", sm: "visible" },
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                gap: 1,
                "& .MuiButton-root": {
                  flexShrink: 0,
                  minHeight: 30,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 4,
                  fontSize: "0.68rem",
                },
              }}
            >
              {actions}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
