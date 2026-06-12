"use client";

import { Button, Chip, Stack } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

type SectionSaveButtonProps = {
  label?: string;
  dirty?: boolean;
  saving?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export default function SectionSaveButton({
  label = "Save Section",
  dirty = false,
  saving = false,
  disabled = false,
  onClick,
}: SectionSaveButtonProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: "center", flexShrink: 0 }}
    >
      {dirty && <Chip size="small" label="Unsaved changes" color="warning" />}
      <Button
        type="button"
        variant="outlined"
        startIcon={<SaveOutlinedIcon />}
        disabled={disabled || saving || !dirty}
        onClick={onClick}
      >
        {saving ? "Saving..." : label}
      </Button>
    </Stack>
  );
}
