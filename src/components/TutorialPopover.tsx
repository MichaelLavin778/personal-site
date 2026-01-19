import { Backdrop, Popover, type PopoverOrigin, type PopoverVirtualElement, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import TutorialContext from "../context/TutorialContext";


type TutorialPopoverAnchorEl =
    | Element
    | PopoverVirtualElement
    | (() => Element | PopoverVirtualElement | null)
    | null
    | undefined;


// can't extend MUI's PopoverProps because open is required there, but I want it handle in here
interface TutorialPopoverProps {
    children: React.ReactNode;
    anchorEl?: TutorialPopoverAnchorEl;
    anchorOrigin?: PopoverOrigin | undefined;
    transformOrigin?: PopoverOrigin | undefined;
}

const TutorialPopover = ({ children, ...props }: TutorialPopoverProps) => {
    const { showTutorial } = useContext(TutorialContext);
    const [anchorEl, setAnchorEl] = useState<TutorialPopoverAnchorEl>(() => {
        if (props.anchorEl) return props.anchorEl;
        // default to body if no anchorEl provided
        return { getBoundingClientRect: () => window.document.body.getBoundingClientRect() } as PopoverVirtualElement;
    });
    const open = showTutorial && !!anchorEl;

    return (
        <>
            {open && (
                <Backdrop
                    open={open}
                    onClick={() => setAnchorEl(null)}
                    sx={{ zIndex: (theme) => theme.zIndex.modal - 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
                />
            )}
            <Popover open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} {...props}>
                <Typography maxWidth={300} padding={2} border={1} borderRadius={2}>
                    {children}
                </Typography>
            </Popover>
        </>
    )
}

export default TutorialPopover;