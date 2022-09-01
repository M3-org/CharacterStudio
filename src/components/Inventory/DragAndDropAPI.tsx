import React, { useEffect } from 'react';

const ExportingComponent = (props : any) => {
    const slotDraggedRef = React.useRef(props.activeDraggedSlot);

    useEffect(() => {
        slotDraggedRef.current = props.activeDraggedSlot;
    }, [props.activeDraggedSlot])

    const setDraggingSlot = (slotIndex) => {
        props.setActiveDraggedSlot(slotIndex);
    }

    const moveElementCloneToMouseCoords = async (x, y) => {
        const slot = slotDraggedRef.current;
        if (slot === null) return false;
        const insertedChild = document.getElementById(`item-slot-ghost-${slot}`);
        if (!insertedChild) return false;
        insertedChild.style.top = `${x}px`;
        insertedChild.style.left = `${y}px`;
    }

    const onMouseMove = (event) => {
        event.preventDefault();
        const parentRect: any = document.getElementsByClassName('inventory')[0].getBoundingClientRect();
        const { clientX, clientY } = event;
        const top = clientY - parentRect.top - 30;
        const left = clientX - parentRect.left - 25;
        moveElementCloneToMouseCoords(top, left);
    }

    const onMouseClick = (event) => {
        if (slotDraggedRef.current !== null) return false;
        event.preventDefault();
        const div = event.target;
        const slot = div.getAttribute("data-slot");
        const type = div.getAttribute("data-type");

        if (slot !== undefined && type === "item") {
            const slotNumber = parseInt(slot);
            setDraggingSlot(slotNumber);
            const itemSelected: any = document.getElementById(`item-slot-${slot}`);
            const itemList = document.getElementsByClassName("inventory")[0];
            const itemClone = itemSelected.cloneNode(true);
            itemClone.className += " being-dragged";
            itemClone.id = `item-slot-ghost-${slot}`;
            itemList.appendChild(itemClone);

            // Setting the default height and width and moving the clone to the right pos.
            const insertedChild: any = document.getElementById(`item-slot-ghost-${slot}`);
            const rect = itemSelected.getBoundingClientRect();
            // Setting Initial styling..
            insertedChild.style.height = `${rect.height}px`;
            insertedChild.style.width = `${rect.width}px`;

            const parentRect: any = document.getElementsByClassName('inventory')[0].getBoundingClientRect();
            const { clientX, clientY } = event;
            const top = clientY - parentRect.top - 30;
            const left = clientX - parentRect.left - 25;
            insertedChild.style.top = `${top}px`;
            insertedChild.style.left = `${left}px`;

            // Hiding the current item selected while dragging around the clone
            itemSelected.className += " being-moved";
        }
    }

    const onMouseReleased = (event) => {
        if (slotDraggedRef.current === null) return false;
        
        event.preventDefault();
        const { clientX, clientY } = event;
        const slot = slotDraggedRef.current;
        if (slot === null) return false;
        const itemSlotElement: any = document.getElementById(`item-slot-${slot}`);
        itemSlotElement.className = itemSlotElement.className.replace(" being-moved", "");
        // Deleting the ghost item..
        const itemGhostElement: any = document.getElementById(`item-slot-ghost-${slot}`);
        itemGhostElement.remove();

        // Emitting the event so the UI can now play with the data.
        const target:any = document.elementFromPoint(clientX, clientY);
        const targetSlot = target.getAttribute("data-slot");
        if (targetSlot !== slot && targetSlot !== null) {
            props.changeItems(slot, targetSlot)
        }
        // Cleaning up
        setDraggingSlot(null);
    }


    useEffect(() => {
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("click", onMouseClick);
        document.addEventListener("mouseup", onMouseReleased);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseReleased);
            document.removeEventListener("click", onMouseClick);
        }
        // eslint-disable-next-line
    }, []);

    return null;
}

export default ExportingComponent;