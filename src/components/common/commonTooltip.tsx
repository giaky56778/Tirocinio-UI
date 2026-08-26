import {RefObject} from "react";
import { Tooltip } from "@base-ui/react/tooltip";

type Props = {
    handle: RefObject<Tooltip.Handle<{text: string}>>
    disabled?: boolean
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
};

export const CommonTooltip = ({ handle, disabled, side = "bottom", sideOffset = 6 }: Props) => (
    <Tooltip.Root
        disabled={disabled}
        handle={handle.current}
    >
        {({ payload }) => (
            <Tooltip.Portal>
                <Tooltip.Positioner
                    side={side}
                    sideOffset={sideOffset}
                >
                    <Tooltip.Popup className="z-50 max-w-xs rounded-md bg-white border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 shadow-md animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1">
                        {payload !== undefined && (
                            <span>{payload.text}</span>
                        )}
                        <Tooltip.Arrow className="fill-white" />
                    </Tooltip.Popup>
                </Tooltip.Positioner>
            </Tooltip.Portal>
        )}
    </Tooltip.Root>
)

export default CommonTooltip
