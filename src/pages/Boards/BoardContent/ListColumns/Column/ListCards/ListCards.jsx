import { Box } from "@mui/material";
import Card from "./Card/Card";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const ListCards = ({ cards }) => {
  return (
    <SortableContext
      items={cards.map((card) => card._id)}
      strategy={verticalListSortingStrategy}
    >
      <Box
        sx={{
          p: "0 5px",
          m: "0 5px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          overflowX: "hidden",
          overflowY: "auto",
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} 
                - ${theme.spacing(5)} 
                - ${theme.trello.columnHeaderHeight} 
                - ${theme.trello.columnFooterHeight})`,
          "&::-webkit-scrollbar-thumb": { bgcolor: "#ced0da" },
          "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#bfc2cf" },
        }}
      >
        {cards?.map((card) => (
          <Card key={card._id} card={card} />
        ))}
      </Box>
    </SortableContext>
  );
};

export default ListCards;
