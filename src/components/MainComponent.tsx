import React from "react";
import { Typography, Box } from "@mui/material";

const MainComponent: React.FC = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #F3DFDD, #F8E8E6)",
        color: "#6B4E4D", 
        zIndex: 0, 
        marginLeft:'100px'
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          textShadow: "1px 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        Select or add your rooms to continue
      </Typography>
    </Box>
  );
};

export default MainComponent;
