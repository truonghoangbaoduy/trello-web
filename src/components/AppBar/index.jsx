import Box from "@mui/material/Box";
import ModeSelect from "../ModeSelect";

const AppBar = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: (theme) => theme.trello.appBarHeight,
        display: "flex",
        alighItems: "center",
      }}
    >
      <ModeSelect />
    </Box>
  );
};

export default AppBar;
