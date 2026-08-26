import React from "react";
import {ContextMenu} from "@base-ui/react/context-menu"
import {colorMap, Side} from "@/utils/globalType.ts";
import {HighlightStateType} from "@/hooks/useHighlightEditor.ts";
import {HighlightBound} from "@/components/reducer/wordHighlightReducer.ts";
import {CopyIcon, EditIcon, SearchIcon, TrashIcon} from "@/components/icons";
import {AlertHandlers} from "@/components/editor/highlightEditorWindow.tsx";
import {SelectionOpType, SelectionRange} from "@/components/reducer/selectionReducer.ts";

export type menuType = "highlight" | 'selected' | "default"
export type CostumeContextType = {
    menuType: menuType;
    highlightId: string | null;
    toggleMenuType: (menuType: menuType, highlightId?: string) => void;
}

type ContextMenuProps = {
    contextMenu: CostumeContextType,
    highlightState: HighlightStateType,
    highlightBound: Record<string, HighlightBound>,
    selectedRange: SelectionRange,
    alert?: AlertHandlers,
    selectionOp: SelectionOpType,
    side: Side,
    textType: Side
}

const ContextMenuCostume = ({contextMenu, highlightState, highlightBound, selectedRange, alert, selectionOp, side, textType}: ContextMenuProps) => {

    const itemCls = "mx-1 rounded-md outline-none cursor-pointer select-none py-1.5 pl-3 pr-6 flex items-center gap-2 text-sm font-medium leading-5 transition-colors duration-100 data-[highlighted]:bg-indigo-600 data-[highlighted]:text-white"
    const itemDestructiveCls = "mx-1 rounded-md outline-none cursor-pointer select-none py-1.5 pl-3 pr-6 flex items-center gap-2 text-sm font-medium leading-5 text-red-600 transition-colors duration-100 data-[highlighted]:bg-red-600 data-[highlighted]:text-white"
    const disabledCls = "opacity-40 cursor-not-allowed pointer-events-none"
    const swatchCls = "block w-[1.375rem] h-[1.375rem] p-0 rounded-full outline outline-2 outline-transparent outline-offset-1 cursor-pointer shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] transition-all duration-[120ms] data-[highlighted]:outline-gray-500 data-[highlighted]:scale-[1.18] data-[disabled]:opacity-45 data-[disabled]:cursor-not-allowed"
    const separatorCls = "my-[0.3rem] mx-2.5 h-px bg-gray-200"

    function ContextMenuRender() {
        const defaultContext=(
            <>
                <ContextMenu.Item
                    className={`${itemCls} ${!selectedRange ? disabledCls : ''}`}
                    onClick={selectionOp.copySelected}
                >
                    <CopyIcon className={"size-5"}/> Copy selected text
                </ContextMenu.Item>
                <ContextMenu.Item
                    className={`${itemCls} ${!(selectedRange && textType==='biblical') ? disabledCls : ''}`}
                    onClick={selectionOp.search}
                >
                    <SearchIcon className={"size-5"}/> Search
                </ContextMenu.Item>
            </>
        )
        switch (contextMenu.menuType) {
            case "default":
                return defaultContext
            case "highlight":
                return (
                    <>
                        <div className="pt-2 px-2.5 pb-1.5 flex flex-col gap-[0.3rem]">
                            <span
                                className="text-[0.6875rem] font-semibold tracking-[0.06em] uppercase text-gray-500 pl-0.5 select-none">
                                Highlight color
                            </span>
                            <div className="flex flex-row flex-wrap gap-[0.4rem]">
                                {Object.entries(colorMap).map(([key, value]) => (
                                    <ContextMenu.Item
                                        key={key}
                                        className={`${swatchCls} ${value.class}`}
                                        onClick={() => highlightState.setColorHighlight(contextMenu.highlightId, key)}
                                    />
                                ))}
                            </div>
                        </div>
                        <ContextMenu.Separator className={separatorCls}/>
                        <ContextMenu.Item
                            className={itemCls}
                            onClick={() => selectionOp.copyHighlight(contextMenu.highlightId, highlightBound, side)}
                        >
                            <CopyIcon className={"size-5"}/> Copy highlighted text
                        </ContextMenu.Item>
                        {defaultContext}
                        <ContextMenu.Separator className={separatorCls}/>
                        <ContextMenu.Item
                            className={itemCls}
                            onClick={() => highlightState.showToolBar(contextMenu.highlightId)}
                        >
                            <EditIcon className={"size-5"}/> Change bound
                        </ContextMenu.Item>
                        <ContextMenu.Item
                            className={itemDestructiveCls}
                            onClick={() => {
                                alert?.deleteHandler?.current?.open(contextMenu.highlightId)
                                alert?.setIdToDelete?.(contextMenu.highlightId)
                            }}
                        >
                            <TrashIcon className={"size-5"}/> Delete highlight
                        </ContextMenu.Item>
                    </>
                )
            default:
                return defaultContext
        }
    }

    return (
        <ContextMenu.Positioner className="outline-none h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)">
            <ContextMenu.Popup className="box-border min-w-40 py-1.5 rounded-lg bg-[canvas] text-gray-900 w-auto h-auto origin-(--transform-origin) transition-[transform,opacity] duration-150 outline-1 outline-gray-200 shadow-lg data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95">
                <ContextMenuRender/>
            </ContextMenu.Popup>
        </ContextMenu.Positioner>
    )
}

export default React.memo(ContextMenuCostume)
