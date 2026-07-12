import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import StartProjectWizard from "@/components/start-project/StartProjectWizard";

export default function StartProjectPage() {
  return (
    <Box component="main" sx={{ minHeight: "100svh", bgcolor: "background.default" }}>
      <Navbar />
      <Suspense
        fallback={
          <Box sx={{ minHeight: "80svh", display: "grid", placeItems: "center" }}>
            <CircularProgress color="primary" />
          </Box>
        }
      >
        <StartProjectWizard />
      </Suspense>
      <Footer />
    </Box>
  );
}
