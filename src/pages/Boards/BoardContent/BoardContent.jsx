import { useEffect, useState, useCallback, useRef } from "react";
import { cloneDeep } from "lodash";
import { Box } from "@mui/material";
import ListColumns from "./ListColumns/ListColumns";
import { mapOrder } from "~/utils/sorts";
import {
  DndContext,
  // PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_COLUMN",
  CARD: "ACTIVE_DRAG_CARD",
};

const BoardContent = ({ board }) => {
  // const pointerSensor = useSensor(PointerSensor, {
  //   activationConstraint: { distance: 10 },
  // });

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 },
  });

  // const sensors = useSensors(pointerSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  const [orderedColumns, setOrderedColumns] = useState([]);

  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [originalColumnWhenDragging, setOriginalColumnWhenDragging] =
    useState(null);

  // Điểm va chạm cuối cùng (xử lý thuật toán phát hiện va chạm video 37).
  const lastOverId = useRef(null);

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "_id"));
  }, [board]);

  const findColumnByCardId = (id) => {
    return orderedColumns.find((column) =>
      column.cards.map((card) => card._id)?.includes(id)
    );
  };

  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns((prevColumns) => {
      const overCardIndex = overColumn.cards.findIndex(
        (card) => card._id === overCardId
      );
      // console.log("overCardIndex: ", overCardIndex);

      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards.length + 1;

      // console.log("isBelowOverItem: ", isBelowOverItem);
      // console.log("modifier: ", modifier);
      // console.log("newCardIndex: ", newCardIndex);

      const nextColumns = cloneDeep(prevColumns);

      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      );

      if (nextActiveColumn) {
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        );
      }

      if (nextOverColumn) {
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );

        // console.log(
        //   "rebuild_activeDraggingCardData: ",
        //   rebuild_activeDraggingCardData
        // );

        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id,
        });
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        );
      }

      return nextColumns;
    });
  };

  const handleDragStart = (event) => {
    // console.log(">>> handleDragStart: ", event);
    setActiveDragItemId(event?.active.id);
    setActiveDragItemType(
      event?.active.data.current.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(event?.active.data.current);

    // Nếu là kéo Card thì mới set giá trị cho originalColumn
    if (event?.active.data.current.columnId) {
      setOriginalColumnWhenDragging(findColumnByCardId(event.active.id));
    }
  };

  const handleDragOver = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;

    // console.log(">>> handleDragOver: ", event);

    const { active, over } = event;
    if (!active || !over) return;
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData },
    } = active;
    const { id: overCardId } = over;

    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);

    if (!activeColumn || !overColumn) return;

    if (activeColumn !== overColumn) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      );
    }
  };

  const handleDragEnd = (event) => {
    // console.log(">>> handleDragEnd: ", event);

    const { active, over } = event;

    if (!active || !over) return;

    // Xử lý kéo thẻ Card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // console.log(">>> Hành động kéo thả Card!");
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData },
      } = active;
      const { id: overCardId } = over;

      const activeColumn = findColumnByCardId(activeDraggingCardId);
      const overColumn = findColumnByCardId(overCardId);

      if (!activeColumn || !overColumn) return;

      if (originalColumnWhenDragging._id !== overColumn._id) {
        // console.log("Hành động kéo thả Card giữa 2 column khác nhau.");
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        );
      } else {
        // console.log("Hành động kéo thả Card trong cùng 1 column.");
        const oldCardIndex = originalColumnWhenDragging.cards.findIndex(
          (c) => c._id === activeDragItemId
        );
        const newCardIndex = overColumn.cards.findIndex(
          (c) => c._id === overCardId
        );

        const dndOrderedCards = arrayMove(
          originalColumnWhenDragging.cards,
          oldCardIndex,
          newCardIndex
        );

        setOrderedColumns((prevColumns) => {
          const nextColumns = cloneDeep(prevColumns);

          // Tìm tới column mà ta đang thả
          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          );

          // Cập nhật lại 2 giá trị là cards và cardOrderIds
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderedCards.map((card) => card._id);

          return nextColumns;
        });
      }
    }

    // Xử lý kéo thả Column trong Board
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        const oldColumnIndex = orderedColumns.findIndex(
          (c) => c._id === active.id
        );
        const newColumnIndex = orderedColumns.findIndex(
          (c) => c._id === over.id
        );
        const dndOrderedColumns = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        );
        const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
        setOrderedColumns(dndOrderedColumns);
      }
    }

    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOriginalColumnWhenDragging(null);
  };

  // console.log(">>> activeDragItemId: ", activeDragItemId);
  // console.log(">>> activeDragItemType: ", activeDragItemType);
  // console.log(">>> activeDragItemData: ", activeDragItemData);

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }

      const pointerIntersection = pointerWithin(args);
      // console.log("pointerIntersection: ", pointerIntersection);
      if (!pointerIntersection.length) return;

      // const intersection = !!pointerIntersection.length
      //   ? pointerIntersection
      //   : rectIntersection(args);

      let overId = getFirstCollision(pointerIntersection, "id");
      if (overId) {
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        );

        if (checkColumn) {
          // console.log("overId before: ", overId);
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) =>
                container.id !== overId &&
                checkColumn?.cardOrderIds?.includes(container.id)
            ),
          })[0]?.id;
          // console.log("overId after: ", overId);
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // Nếu overId là null thì trả về mảng rỗng
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType, orderedColumns]
  );

  return (
    <DndContext
      sensors={sensors}
      //collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
          width: "100%",
          height: (theme) => theme.trello.boardContentHeight,
          p: "10px 0",
        }}
      >
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={dropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemId &&
            activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
              <Column column={activeDragItemData} />
            )}
          {activeDragItemId &&
            activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
              <Card card={activeDragItemData} />
            )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
};

export default BoardContent;
