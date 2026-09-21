import {Tooltip} from "@base-ui/react/tooltip";
import {ArrowSvg} from "@/components/ui/icons";
import type {Side} from "@base-ui/react/internals/useAnchorPositioning";

type Props = {
    handle:Tooltip.Handle<{text: string}>
    position?: Side
    sideOffset?: number
};

export const CommonTooltip = ({
    handle,
    position = 'top',
    sideOffset = 6
}: Props) => (
    <Tooltip.Root handle={handle}>
        {({ payload }) => (
            <Tooltip.Portal>
                <Tooltip.Positioner
                    sideOffset={sideOffset}
                    side={position}
                >
                    <Tooltip.Popup className="z-50 max-w-xs rounded-md bg-white border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 shadow-md animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1">
                        {payload !== undefined && (
                            <span className={"text-sm"}>{payload.text}</span>
                        )}
                        <Tooltip.Arrow
                            className="data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
                            render={ArrowSvg}
                        />
                    </Tooltip.Popup>
                </Tooltip.Positioner>
            </Tooltip.Portal>
        )}
    </Tooltip.Root>
)

export default CommonTooltip
