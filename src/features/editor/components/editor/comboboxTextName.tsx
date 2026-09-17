import {memo} from 'react';
import {AlertDialog} from "@base-ui/react/alert-dialog";
import {Combobox} from '@base-ui/react/combobox';
import type {TextSelectedType} from "@/hook/useTextNameSelection.ts";
import {CheckIcon, ChevronUpDownIcon, XIcon} from "@/components/ui/icons";
import AlertDeleteText from "@/features/editor/components/editor/alertDeleteText.tsx";
import ComboboxClearButton from "@/components/ui/common/comboboxClearButton.tsx";
import type {ContentItemText, TextListSchema} from "@/api/indexType.ts";
import type {TextType} from "@/utils/settings.ts";
import type {TextOperationType} from "@/features/double-editor/components/doubleEditor.tsx";
import {useSelectionStore} from "@/features/editor/store/useSelectionStore.tsx";

type Props ={
    textNames: TextListSchema
    textNameSelect: TextSelectedType
    textOp:TextOperationType
    side: TextType
}

function ComboboxTextName({textNames, textNameSelect, textOp, side}: Props) {
    const alert = AlertDialog.createHandle<{id: number}>()
    const setSelectionBlocked = useSelectionStore(s => s.setSelectionBlocked)

    return(
        <div className="w-75 max-w-full">
            <Combobox.Root
                items={textNames}
                value={textNameSelect.items.id}
                onValueChange={(val: number | null | undefined) => {
                    if (val == undefined)
                        return
                    for (const group of textNames) {
                        const find = group.items.find(i => i.id === val)
                        if (find) {
                            textOp.select({path: group.path, items: find})
                            return
                        }
                    }
                }}
                onOpenChange={setSelectionBlocked}
            >
                <Combobox.Label className="sr-only">Seleziona testo</Combobox.Label>
                <Combobox.Trigger className="cursor-pointer flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-gray-900 select-none hover:border-gray-300 data-popup-open:shadow-md focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-indigo-500 duration-150">
                    <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 leading-4">Testo corrente</span>
                        <span className="truncate text-sm font-medium text-gray-900 leading-5">
                            <span>{textNameSelect.items.filename}</span>
                            <br/>
                            <span className="text-xs text-gray-500">
                                {textNameSelect.path}
                            </span>
                        </span>
                    </span>
                    <Combobox.Icon className="flex shrink-0 text-gray-400 size-6">
                        <ChevronUpDownIcon/>
                    </Combobox.Icon>
                </Combobox.Trigger>
                <Combobox.Portal>
                    <Combobox.Positioner
                        className="outline-none"
                        align="start"
                        sideOffset={4}
                    >
                        <Combobox.Popup
                            className="w-(--anchor-width) max-h-96 flex flex-col rounded-xl bg-white text-gray-900 border border-gray-100 outline-none overflow-hidden transition-all data-ending-style:scale-95 data-ending-style:opacity-0"
                            aria-label="Seleziona testo"
                        >
                            <div className="shrink-0 border-b border-gray-100 px-3 py-2.5">
                                <Combobox.InputGroup className="relative h-9 rounded-lg border border-gray-200 bg-gray-50 transition-colors">
                                    <Combobox.Input
                                        className="h-full w-full border-0 bg-transparent pl-3 text-sm text-gray-900 outline-none"
                                        placeholder="Cerca testo..."
                                    />
                                    <ComboboxClearButton/>
                                </Combobox.InputGroup>
                            </div>
                            <Combobox.List className="outline-none overflow-y-auto scroll-py-2 pb-2 overscroll-contain flex-1 min-h-0">
                                {(group: { path: string; items: ContentItemText[] }) => (
                                    <Combobox.Group key={group.path} items={group.items} className="block">
                                        <Combobox.GroupLabel className="sticky top-0 z-10 bg-white px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                            {group.path}
                                        </Combobox.GroupLabel>
                                        <Combobox.Collection>
                                            {(item: ContentItemText) => (
                                                <Combobox.Item
                                                    key={item.id}
                                                    value={item.id}
                                                    className="grid cursor-default grid-cols-[1rem_1fr_auto] items-center gap-2 mx-1 px-3 py-2 text-sm leading-5 outline-none select-none rounded-md transition-colors duration-75 data-highlighted:bg-orange-50 data-highlighted:text-orange-900"
                                                >
                                                    <Combobox.ItemIndicator
                                                        className="col-start-1 flex items-center justify-center">
                                                        <CheckIcon className="size-3.5 text-orange-600"/>
                                                    </Combobox.ItemIndicator>
                                                    <span className="col-start-2 min-w-0 truncate">{item.filename}</span>
                                                    {side==='historical' && (
                                                        <AlertDialog.Trigger
                                                            handle={alert}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                            }}
                                                            className={"col-start-3 flex items-center justify-center rounded-lg p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"}
                                                            payload={{ id: item.id }}
                                                        >
                                                            <XIcon className="size-3.5"/>
                                                        </AlertDialog.Trigger>
                                                    )}
                                                </Combobox.Item>
                                            )}
                                        </Combobox.Collection>
                                    </Combobox.Group>
                                )}
                            </Combobox.List>
                            <Combobox.Empty>
                                <div className="px-4 py-8 text-center text-sm text-gray-400">Nessun testo trovato</div>
                            </Combobox.Empty>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
            {side==='historical' &&(
                <AlertDeleteText
                    alert={alert}
                    deleteText={textOp.delete}
                />
            )}
        </div>
    )
}

export default memo(ComboboxTextName)
