import React from "react";
import {ContextMenu} from "@base-ui/react/context-menu"
import {colorMap, type TextType} from "@/utils/settings.ts";
import type {HighlightStateType} from "@/features/editor/hooks/useEditorState.ts";
import type {HighlightBound} from "@/features/editor/reducer/wordHighlightReducer.ts";
import {CopyIcon, EditIcon, SearchIcon, TrashIcon} from "@/components/ui/icons";
import type {SelectionRange} from "@/features/editor/reducer/selectionReducer.ts";
import type {AlertModifyPayloadType} from "@/features/search/components/search/alertModifySearch.tsx";
import {type AlertDialog} from "@base-ui/react/alert-dialog";
import type {SelectionOpType} from "@/features/editor/hooks/useCustomSelection.ts";

export type menuType = "highlight" | 'selected' | "default"
export type CostumeContextType = {
    menuType: menuType
    highlightId: string | null
    toggleMenuType: (menuType: menuType, highlightId?: string) => void
}

type Props = {
    contextMenu: CostumeContextType,
    highlightState: HighlightStateType,
    highlightBound: Record<string, HighlightBound>,
    selectedRange: SelectionRange,
    selectionOp: SelectionOpType,
    side: TextType,
    textType: TextType
    deleteHighlight: (highlightId: string) => void
    alertDeleteHandler?: AlertDialog.Handle<AlertModifyPayloadType>
}

const ContextMenuCustom = ({
    contextMenu,
    highlightState,
    highlightBound,
    selectedRange,
    selectionOp,
    side,
    textType,
    alertDeleteHandler,
    deleteHighlight
}: Props) => {

    const itemCls = "mx-1 rounded-md outline-none cursor-pointer select-none py-1.5 pl-3 pr-6 flex items-center gap-2 text-sm font-medium leading-5 transition-colors duration-100 data-[highlighted]:bg-gray-200 "
    const itemDestructiveCls = "mx-1 rounded-md outline-none cursor-pointer select-none py-1.5 pl-3 pr-6 flex items-center gap-2 text-sm font-medium leading-5 text-red-600 transition-colors duration-100 data-[highlighted]:bg-red-600 data-[highlighted]:text-white"
    const disabledCls = "opacity-40 cursor-not-allowed pointer-events-none"
    const swatchCls = "block w-[1.375rem] h-[1.375rem] p-0 rounded-full outline outline-2 outline-transparent outline-offset-1 cursor-pointer shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] transition-all duration-[120ms] data-[highlighted]:outline-gray-500 data-[highlighted]:scale-[1.18] data-[disabled]:opacity-45 data-[disabled]:cursor-not-allowed"
    const separatorCls = "my-[0.3rem] mx-2.5 h-px bg-gray-200"

    function renderContextMenuContent() {
        const defaultContext = (
            <>
                <ContextMenu.Item
                    className={`${itemCls} ${!selectedRange ? disabledCls : ''}`}
                    onClick={selectionOp.copySelected}
                >
                    <CopyIcon className={"size-5"}/>
                    Copia testo selezionato
                </ContextMenu.Item>
                <ContextMenu.Item
                    className={`${itemCls} ${!(selectedRange && textType === 'historical') ? disabledCls : ''}`}
                    onClick={selectionOp.search}
                >
                    <SearchIcon className={"size-5"}/>
                    Ricerca
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
                            <span className="text-[0.6875rem] font-semibold tracking-[0.06em] uppercase text-gray-500 pl-0.5 select-none">
                                Colore evidenziazione
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
                            <CopyIcon className={"size-5"}/>
                            Copia testo evidenziato
                        </ContextMenu.Item>
                        {defaultContext}
                        <ContextMenu.Separator className={separatorCls}/>
                        <ContextMenu.Item
                            className={itemCls}
                            onClick={() => highlightState.showToolBar(contextMenu.highlightId)}
                        >
                            <EditIcon className={"size-5"}/>
                            Modifica evidenziazione
                        </ContextMenu.Item>
                        <ContextMenu.Item
                            className={itemDestructiveCls}
                            onClick={() => {
                                alertDeleteHandler?.openWithPayload({
                                    onConfirm: () => {
                                        if(contextMenu.highlightId !== null)
                                            deleteHighlight(contextMenu.highlightId)
                                    }
                                })
                            }}
                        >
                            <TrashIcon className={"size-5"}/> Cancella evidenziazione
                        </ContextMenu.Item>
                    </>
                )
            default: {
                console.warn('Tipo di menu non supportato. È accettato unicamente: "default" | "highlight"')
                return defaultContext
            }
        }
    }

    return (
        <ContextMenu.Positioner className="outline-none h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)">
            <ContextMenu.Popup className="box-border min-w-40 py-1.5 rounded-lg bg-[canvas] text-gray-900 w-auto h-auto origin-(--transform-origin) transition-[transform,opacity] duration-150 outline-1 outline-gray-200 shadow-lg data-starting-style:opacity-0 data-starting-style:scale-95">
                {renderContextMenuContent()}
            </ContextMenu.Popup>
        </ContextMenu.Positioner>
    )
}

export default React.memo(ContextMenuCustom)
