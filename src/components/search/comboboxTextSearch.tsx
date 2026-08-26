import React from "react";
import {Combobox} from "@base-ui/react/combobox";
import {Tooltip} from "@base-ui/react/tooltip";
import {SettingsType} from "@/api";
import {CheckIcon, ChevronUpDownIcon, InfoIcon, MinusIcon, XIcon} from "@/components/icons";
import CommonTooltip from "@/components/common/commonTooltip.tsx";

type Props = {
    sourcesSelected: string[]
    setSourcesSelected: (source: string[]) => void
    settings: SettingsType
}

type CompatibleType ={
    id: string
    value: string
}

export default function ComboboxTextSearch({sourcesSelected,setSourcesSelected,settings}: Props) {
    const source:CompatibleType[] = Object.entries(settings.sources).map(([key, value]) => ({id:key, value}))
    const allSourceIds = Object.keys(settings.sources)
    const isAllSelected = allSourceIds.length > 0 && sourcesSelected.length === allSourceIds.length
    const isSomeSelected = sourcesSelected.length > 0 && !isAllSelected
    const tooltipRef=React.useRef(Tooltip.createHandle<{text: string}>())

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSourcesSelected([])
        } else {
            setSourcesSelected(allSourceIds)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm font-medium text-gray-600">Sorgenti:</span>
                <Tooltip.Provider>
                    <Tooltip.Trigger
                        handle={tooltipRef.current}
                        type="button"
                        className="flex size-5 items-center justify-center border-0 bg-transparent text-neutral-500 hover:text-neutral-700 cursor-pointer"
                        aria-label="Informazioni sorgenti"
                        payload={{text: "Se non si seleziona alcuna sorgente, la ricerca verrà effettuata su tutte quelle disponibili."}}
                    >
                        <InfoIcon className="size-4" />
                    </Tooltip.Trigger>
                </Tooltip.Provider>
               <CommonTooltip
                   handle={tooltipRef}
                   side="top"
               />
            </div>
            <Combobox.Root
                multiple
                items={source}
                onValueChange={(value) => setSourcesSelected(value.map((v: CompatibleType) => v.id))}
                value={source.filter((v:CompatibleType) => sourcesSelected.includes(v.id))}
            >
                <div className="min-w-40 w-full">
                    <Combobox.Trigger
                        render={<div/>}
                        nativeButton={false}
                        className="flex items-center gap-1.5 max-h-16 h-16 rounded border border-gray-300 bg-white p-1.5 hover:bg-gray-50 data-popup-open:outline-2 data-popup-open:outline-orange-600 cursor-pointer w-full"
                    >
                        {sourcesSelected.length === 0 && (
                            <div className="px-4 py-3 text-center text-sm text-gray-400">Nessuna sorgente selezionata</div>
                        )}
                        <Combobox.Chips className="flex-1 min-w-0 h-full overflow-y-auto flex flex-wrap content-start items-start gap-1 pr-1">
                            <Combobox.Value>
                                {(value) => (
                                    <React.Fragment>
                                        {value.map((name:CompatibleType) => (
                                            <Combobox.Chip
                                                key={name.id}
                                                className="flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full focus:outline-2 focus:outline-orange-400"
                                                aria-label={name.value}
                                            >
                                                {name.value}
                                                <Combobox.ChipRemove
                                                    className="text-orange-500 hover:text-orange-700 cursor-pointer flex items-center"
                                                    aria-label={`Rimuovi ${settings.sources[name.id]}`}
                                                >
                                                    <XIcon />
                                                </Combobox.ChipRemove>
                                            </Combobox.Chip>
                                        ))}
                                    </React.Fragment>
                                )}
                            </Combobox.Value>
                        </Combobox.Chips>
                        <div className="shrink-0 flex items-center gap-1">
                            <Combobox.Clear
                                className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                                aria-label="Cancella selezione"
                            >
                                <XIcon className="size-4"/>
                            </Combobox.Clear>
                            <span className="flex items-center justify-center text-gray-500 pointer-events-none">
                                <ChevronUpDownIcon className="size-4"/>
                            </span>
                        </div>
                    </Combobox.Trigger>
                </div>
                <Combobox.Portal>
                    <Combobox.Positioner
                        side="bottom"
                        sideOffset={4}
                        align="start"
                        positionMethod="fixed"
                        collisionAvoidance={{side: 'none', fallbackAxisSide: 'none'}}
                    >
                        <Combobox.Popup className="min-w-(--anchor-width) rounded-lg border border-gray-200 bg-white shadow-lg text-gray-900 outline-none origin-(--transform-origin) transition-[transform,scale,opacity] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                            <div className="border-b border-gray-100 px-3 py-2.5">
                                <Combobox.InputGroup
                                    className="relative h-9 rounded-lg border border-gray-200 bg-gray-50 transition-colors focus-within:bg-white focus-within:border-orange-400 [&>input]:pr-8">
                                    <Combobox.Input
                                        className="h-full w-full border-0 bg-transparent pl-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                        placeholder="Cerca sorgenti..."
                                    />
                                </Combobox.InputGroup>
                            </div>
                            {allSourceIds.length > 0 && (
                                <div className="border-b border-gray-100 px-3 py-1.5">
                                    <button
                                        type="button"
                                        onClick={handleToggleSelectAll}
                                        className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-900 transition-colors cursor-pointer select-none"
                                    >
                                        <div className="flex size-4 items-center justify-center rounded border border-gray-300 bg-white">
                                            {isAllSelected && (<CheckIcon className="size-3 text-orange-600" />)}
                                            {isSomeSelected && (<MinusIcon className="size-3 text-orange-600" />)}
                                        </div>
                                        <span>Seleziona tutto</span>
                                    </button>
                                </div>
                            )}
                            <Combobox.List className="py-1">
                                {(name: CompatibleType) => (
                                    <Combobox.Item
                                        key={name.id}
                                        className="grid grid-cols-[1rem_1fr] items-center gap-2 px-3 py-2 text-sm cursor-default select-none outline-none data-highlighted:bg-orange-50 data-highlighted:text-orange-900"
                                        value={name}
                                    >
                                        <Combobox.ItemIndicator className="col-start-1 flex items-center justify-center text-orange-600">
                                            <CheckIcon className={"w-4 h-4"}/>
                                        </Combobox.ItemIndicator>
                                        <span className="col-start-2">{name.value}</span>
                                    </Combobox.Item>
                                )}
                            </Combobox.List>
                            <Combobox.Empty>
                                <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                                    Nessun risultato trovato
                                </div>
                            </Combobox.Empty>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
        </div>
    )
}
