import Box from "@mui/material/Box";
import ModeSelect from "../ModeSelect";
//Icons
import AppsIcon from "@mui/icons-material/Apps";

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
      <Box>
        <AppsIcon />
        Trello
      </Box>
      <Box>
        <ModeSelect />
      </Box>
    </Box>
  );
};

export default AppBar;
