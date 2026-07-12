import { Box } from "@mui/material";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ServicesPageClient from "@/components/services/ServicesPageClient";

export default function ServicesPage() {
  return (
    <Box component="main" sx={{ minHeight: "100svh", bgcolor: "background.default" }}>
      <Navbar />
      <ServicesPageClient />
      <Footer />
    </Box>
  );
}
