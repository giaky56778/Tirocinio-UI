import React, {memo} from "react";
import {Combobox} from "@base-ui/react/combobox";
import {CheckIcon, ChevronUpDownIcon} from "@/components/ui/icons";
import {ScrollType} from "@/features/editor/hooks/useScrollDynamic.ts";
import ComboboxClearButton from "@/components/ui/common/comboboxClearButton.tsx";

type Props = {
    chapterIndex: chapterIndex[],
    visibleRange: { startIndex: number; endIndex: number },
    scroll: ScrollType
    blockSelectedRef?: React.RefObject<boolean>
}

type chapterIndex = {
    value: string
    indexMin: number
    indexMax: number
}

export const CHAPTER_SELECT_CONTAINER_CLASS = "w-full max-w-full px-4 py-2 border border-gray-200 rounded-b-lg bg-white"
export const CHAPTER_SELECT_TRIGGER_CLASS = "flex w-full max-w-full items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-left text-gray-900 select-none hover:bg-gray-50 hover:border-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-orange-600 data-popup-open:border-orange-500 data-popup-open:bg-white transition-colors duration-150 cursor-default"

const IndexTextPosition = memo(({chapterIndex, visibleRange, scroll, blockSelectedRef}: Props) => {
    const find = chapterIndex.find(r => visibleRange.startIndex + 2 <= r.indexMax)
    return (
        <div className={CHAPTER_SELECT_CONTAINER_CLASS}>
            <Combobox.Root
                items={chapterIndex}
                value={find}
                onOpenChange={(isOpen) => {
                    if (blockSelectedRef)
                        blockSelectedRef.current = isOpen
                }}
            >
                <Combobox.Label className="sr-only">
                    Seleziona capitolo
                </Combobox.Label>
                <Combobox.Trigger className={`${CHAPTER_SELECT_TRIGGER_CLASS} cursor-pointer`}>
                    <span className="flex min-w-0 flex-col">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 leading-4">
                            Capitolo corrente
                        </span>
                        <span className="truncate text-sm font-medium text-gray-900">
                            {find?.value || 'Nessuno'}
                        </span>
                    </span>
                    <Combobox.Icon className="flex shrink-0 text-gray-600">
                        <ChevronUpDownIcon/>
                    </Combobox.Icon>
                </Combobox.Trigger>
                <Combobox.Portal>
                    <Combobox.Positioner align="start" sideOffset={6}>
                        <Combobox.Popup
                            className="w-(--anchor-width) max-h-96 flex flex-col rounded-xl bg-white shadow-xl shadow-gray-200/60 text-gray-900 border border-gray-100 outline-none overflow-hidden transition-all data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
                            aria-label="Seleziona testo"
                        >
                            <div className="border-b border-gray-200 px-4 py-3">
                                <Combobox.InputGroup className="relative h-9 rounded-lg border border-gray-200 bg-gray-50 transition-colors focus-within:bg-white focus-within:border-indigo-400">
                                    <Combobox.Input
                                        className="h-full w-full border-0 bg-transparent pl-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                        placeholder="Cerca Capitolo..."
                                    />
                                    <ComboboxClearButton/>
                                </Combobox.InputGroup>
                            </div>
                            <Combobox.Empty>
                                <div className="p-4 text-center text-sm text-gray-500">
                                    Nessun capitolo trovato.
                                </div>
                            </Combobox.Empty>

                            <Combobox.List className="outline-0 overflow-y-auto scroll-py-2 py-2 overscroll-contain data-empty:p-0">
                                {(country: chapterIndex) => (
                                    <Combobox.Item
                                        key={country.value}
                                        value={country}
                                        className="grid cursor-default grid-cols-[1rem_1fr_auto] items-center gap-2 mx-1 px-3 py-2 text-sm leading-5 outline-none select-none rounded-md transition-colors duration-75 data-highlighted:bg-orange-50 data-highlighted:text-orange-900"
                                        onClick={() => scroll.setScroll({lineIndex: country.indexMin})}
                                    >
                                        <Combobox.ItemIndicator className="col-start-1 flex items-center justify-center w-3 h-3">
                                            <CheckIcon className="size-4 text-orange-600"/>
                                        </Combobox.ItemIndicator>
                                        <span className="col-start-2 min-w-0 truncate">{country.value}</span>
                                    </Combobox.Item>
                                )}
                            </Combobox.List>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
        </div>
    )
})

export default IndexTextPosition
