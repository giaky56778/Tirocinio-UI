import {RefObject, useEffect, useState} from "react";
import {Progress} from "@base-ui/react";
import {Dialog} from "@base-ui/react/dialog";
import {CheckIcon, LoadingSpinner, TriangleExclamationIcon} from "@/components/icons";

type Props = {
    dialogHandle: RefObject<Dialog.Handle<any>>
    algoSelected: string[]
    data: {
        isLoading: boolean
        algoFinished: Record<string, boolean>
        messages: string[]
        hasError: boolean
        resultFilename: {
            filename: string
            total_size: number
        }
    }
}

const TIMERLIMIT = 10
const DEFAULTTIMER=-1

export default function DialogSSESearch({
    dialogHandle,
    algoSelected,
    data
}: Props) {

    const [closeAlertTimerRemain, setCloseAlertTimerRemain] = useState(DEFAULTTIMER)

    useEffect(() => {
        let interval: number | undefined
        
        if (!data.isLoading && closeAlertTimerRemain < TIMERLIMIT) {
            if (closeAlertTimerRemain === DEFAULTTIMER) {
                setCloseAlertTimerRemain(0)
            }
            
            interval = setInterval(() => {
                setCloseAlertTimerRemain(prev => prev === DEFAULTTIMER ? 1 : prev + 1)
            }, 1000)
        }
        
        if(closeAlertTimerRemain >= TIMERLIMIT)
            dialogHandle.current.close()

        return () => clearInterval(interval)
    }, [data.isLoading, closeAlertTimerRemain, dialogHandle]);

    return (
        <Dialog.Root
            disablePointerDismissal={data.isLoading}
            handle={dialogHandle.current}
            onOpenChange={(open, eventDetails) => {
                if (!open && data.isLoading) {
                    eventDetails.cancel()
                    return
                }
                if(open)
                    setCloseAlertTimerRemain(DEFAULTTIMER)
            }}
        >

            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 bg-black/40"/>
                <Dialog.Popup className="w-xl h-1/2 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="flex items-start justify-between p-4 border-b">
                        <div>
                            <Dialog.Title className="font-semibold">
                                Risultati Ricerca
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-neutral-500">
                                {data.isLoading ? "Elaborazione in corso…" : "Elaborazione completata."}
                            </Dialog.Description>
                        </div>
                        {data.isLoading && <LoadingSpinner className="size-5 text-orange-500 shrink-0"/>}
                    </div>

                    <div className="p-4 flex flex-wrap gap-2 border-b">
                        {algoSelected.map((algo) => (
                            <div
                                key={algo}
                                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${
                                    data.algoFinished[algo] ? "text-emerald-700 border-emerald-200" : "text-neutral-500"
                                }`}
                            >
                                {data.algoFinished[algo]
                                    ? <CheckIcon className="size-3"/>
                                    : data.hasError ? <TriangleExclamationIcon className="stroke-red-600 size-3"/> : <LoadingSpinner className="size-3"/>
                                }
                                <span>{algo}</span>
                            </div>
                        ))}
                    </div>

                    <div className="h-60 overflow-y-auto bg-neutral-950 p-4 font-mono text-xs space-y-1.5">
                        {data.messages.length === 0 ? (
                            <p className="text-neutral-500 italic font-sans text-sm">In attesa di messaggi dal server…</p>
                        ) : (
                            data.messages.map((msg, idx) => (
                                <div key={idx} className="flex gap-2.5">
                                    <span className="text-neutral-600 shrink-0">
                                        {String(idx + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-emerald-400"> {msg} </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 border-t">

                        {!data.isLoading && (
                            <span className="text-sm text-neutral-500">
                                {closeAlertTimerRemain > DEFAULTTIMER && `Chiusura in ${TIMERLIMIT - closeAlertTimerRemain}s`}
                            </span>
                        )}
                        <Dialog.Close
                            type="button"
                            disabled={data.isLoading}
                            className="ml-auto rounded-md bg-orange-600 px-4 py-2 text-sm text-white disabled:opacity-40"
                        >
                            Chiudi
                        </Dialog.Close>
                    </div>
                    {closeAlertTimerRemain > DEFAULTTIMER && (
                        <Progress.Root
                            value={TIMERLIMIT - closeAlertTimerRemain}
                            max={TIMERLIMIT}
                            className="absolute bottom-0 left-0 right-0 h-1"
                        >
                            <Progress.Track className="h-full bg-neutral-100">
                                <Progress.Indicator className="bg-orange-500 h-full transition-all duration-1000 ease-linear"/>
                            </Progress.Track>
                        </Progress.Root>
                    )}
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
