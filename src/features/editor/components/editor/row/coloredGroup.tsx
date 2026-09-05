import {Popover} from "@base-ui/react/popover";
import {ReactNode, RefObject} from "react";
import {TextType} from "@/utils/settings.ts";

type ColoredGroupProps = {
    side: TextType,
    lineIndex: number,
    highlightId: string,
    colorClass: string,
    isBlinking: boolean,
    toolBarVisible: boolean,
    onContextMenu: () => void,
    children: ReactNode,
    previewCardHandler?: RefObject<Popover.Handle<string>>
}

export default function ColoredGroup({side, lineIndex, highlightId, colorClass, isBlinking, toolBarVisible, previewCardHandler, onContextMenu, children}: ColoredGroupProps) {

    const item = (
        <span
            className={`${colorClass} ${isBlinking ? 'animate-pulse' : ''} relative inline`}
            onContextMenu={onContextMenu}
        >
            {children}
        </span>
    )

    if (!previewCardHandler || toolBarVisible)
        return item

    const triggerId = `${side}-group-${lineIndex}-${highlightId}`;
    return (
        <Popover.Trigger
            key={triggerId}
            handle={previewCardHandler.current}
            id={triggerId}
            payload={`${side}:${highlightId}`}
            nativeButton={false}
            render={<span/>}
        >
            {item}
        </Popover.Trigger>
    )
}