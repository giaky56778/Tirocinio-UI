import {useState} from 'react';
import {Tooltip} from '@base-ui/react/tooltip';
import {Dialog} from "@base-ui/react/dialog";
import toast from "react-hot-toast";
import AlgorithmOptionItem from "@/features/search/components/search/searchDialog/algorithmButton.tsx";
import CommonTooltip from "@/features/search/components/search/commonTooltip.tsx";
import DialogCloseCostume from "@/components/ui/common/dialogCloseCostume.tsx";
import {CheckIcon, InfoIcon, MinusIcon, SettingsIcon, TriangleExclamationIcon} from "@/components/ui/icons";
import {type SettingsType, type TooltipType} from "@/features/search/api/searchApiType.ts";

export const optionRowClass = 'cursor-pointer flex items-center gap-3 px-3 py-2 border'
export const optionRowActiveClass = 'border-orange-500 bg-orange-50'
export const checkboxClass = 'flex size-4 shrink-0 items-center justify-center border'
export const checkboxActiveClass = 'border-orange-500 bg-orange-500 text-white'

type Props = {
    settings: SettingsType,
    tooltip: TooltipType,
    algoSelected: string[],
    setAlgoSelected: (value: string[]) => void
}

export default function SearchOptionDialog({settings, tooltip, algoSelected,setAlgoSelected}: Props) {
    const hybridAlgorithm: string[] = Object.values(Object.keys(settings.sentence_transformer_models)).concat(settings.explicit_algorithms)
    const [value, setValue] = useState<string[]>(() => algoSelected.slice())
    const [algoError,setAlgoError]=useState(false)
    const tooltipRef = Tooltip.createHandle<{ text: string }>()

    const toggleAlgorithm = (key: string) => {
        setValue(value => value.includes(key) ? value.filter(x => x !== key) : [...value, key])
    }

    return (
        <Tooltip.Provider>
            <Dialog.Root disablePointerDismissal={algoError}>
                <Dialog.Trigger
                    className={'font-bold mx-auto h-8 p-3 text-sm border w-full bg-orange-700 hover:bg-orange-800 cursor-pointer transition-colors text-white rounded flex items-center justify-center'}
                    onClick={()=>setValue(algoSelected)}
                >
                    <SettingsIcon className={"size-5"}/>
                    Avanzate
                </Dialog.Trigger>
                <Dialog.Portal style={{userSelect:'none'}}>
                    <Dialog.Backdrop className="fixed inset-0 bg-black/20"/>
                    <Dialog.Popup className="rounded-md border border-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-187.5 max-w-[calc(100vw-3rem)] flex-col gap-4 bg-white p-6">
                        <DialogCloseCostume/>
                        <div className="flex items-center justify-between">
                            <div>
                                <Dialog.Title className="text-lg font-semibold">
                                    Configurazione Ricerca Avanzata
                                </Dialog.Title>
                                <Dialog.Description className="text-sm text-neutral-500">
                                    Seleziona gli algoritmi da utilizzare per la ricerca
                                </Dialog.Description>
                            </div>
                        </div>
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                if (value.length === hybridAlgorithm.length)
                                    setValue([])
                                else
                                    setValue(hybridAlgorithm.slice())
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()

                                    if (value.length === hybridAlgorithm.length)
                                        setValue([])
                                    else
                                        setValue(hybridAlgorithm.slice())
                                }
                            }}
                            className={`${optionRowClass} ${value.length > 0 ? optionRowActiveClass : ''}`}
                        >
                            <div className={`${checkboxClass} ${value.length > 0 ? checkboxActiveClass : ''}`}>
                                {value.length > 0 && value.length < hybridAlgorithm.length && (
                                    <MinusIcon className="size-4"/>
                                )}
                                {value.length === hybridAlgorithm.length && (
                                    <CheckIcon/>
                                )}
                            </div>
                            <span className="text-sm flex items-center gap-2">
                                Seleziona tutto
                                <Tooltip.Trigger
                                    handle={tooltipRef}
                                    render={<label/>}
                                    payload={{ text: tooltip?.algo?.select_all ?? tooltip?.algo?.all ?? 'Seleziona o deseleziona tutti gli algoritmi' }}
                                >
                                    <InfoIcon className="size-4 text-neutral-400 hover:text-neutral-600"/>
                                </Tooltip.Trigger>
                            </span>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-semibold text-neutral-500 mb-2">Algoritmi Espliciti</h3>
                                <div className="space-y-2">
                                    {settings.explicit_algorithms.map(algo => (
                                        <AlgorithmOptionItem
                                            key={algo}
                                            tooltipHandle={tooltipRef}
                                            itemKey={algo}
                                            label={algo}
                                            tooltipText={tooltip?.algo?.[algo] ?? algo}
                                            selected={value.includes(algo)}
                                            onToggle={toggleAlgorithm}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="w-px bg-neutral-200 shrink-0"/>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xs font-semibold text-neutral-500 mb-2">Modelli Sentence Transformer</h3>
                                    <div className="space-y-2">
                                        {Object.entries(settings.sentence_transformer_models).map(([key, label]) => (
                                            <AlgorithmOptionItem
                                                key={key}
                                                itemKey={key}
                                                tooltipHandle={tooltipRef}
                                                label={label}
                                                tooltipText={tooltip?.strans?.[key] ?? label}
                                                selected={value.includes(key)}
                                                onToggle={toggleAlgorithm}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-3 items-start">
                                    <div className="relative">
                                        <button
                                            className="w-full rounded-lg bg-green-700 px-4 py-2 text-sm text-white transition-colors hover:bg-green-900 cursor-pointer"
                                            onClick={() => {
                                                if (value.length === 0) {
                                                    setAlgoError(true)
                                                    return
                                                }
                                                setAlgoSelected(value)
                                                setAlgoError(false)
                                                toast.success("Algoritmi selezionati con successo")
                                            }}
                                        >
                                            Salva
                                        </button>
                                    </div>
                                    <Dialog.Close
                                        type="button"
                                        className="rounded-lg border px-4 py-2 text-sm cursor-pointer hover:bg-slate-200"
                                        onClick={() => {
                                            setValue(algoSelected)
                                            setAlgoError(false)
                                        }}
                                    >
                                        Annulla
                                    </Dialog.Close>
                                </div>
                            </div>
                        {algoError && (
                            <div
                                role="alert"
                                className="mt-2 absolute top-full left-0 z-10 flex w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                            >
                                <TriangleExclamationIcon className={"size-4"}/>
                                <span className={"left-4"}>Seleziona almeno un algoritmo per la ricerca</span>
                            </div>
                        )}

                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
            <CommonTooltip handle={tooltipRef}/>
        </Tooltip.Provider>
    )
}
