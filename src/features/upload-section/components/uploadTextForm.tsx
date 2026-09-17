import React, {memo} from "react";
import {Tabs} from "@base-ui/react/tabs";
import {XIcon} from "@/components/ui/icons";
import {Button, Dialog, Field, Form} from "@base-ui/react";
import {type TextSelectedType} from "@/hook/useTextNameSelection.ts";
import {useUploadText} from "@/features/upload-section/hooks/useUploadText.ts";

export type UploadFormat = "XML" | "TXT"

const ACCEPT_ATTR = ".xml,.txt"
const tabClasses = "px-1 pb-3 text-sm text-neutral-400 select-none data-selected:text-neutral-900 hover:text-neutral-700"
const inputClasses = "w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-neutral-400"

type Props= {
    onTextChange: (newSelected: TextSelectedType) => void
    dialogHandle?:  Dialog.Handle<never>
}

function UploadTextForm({onTextChange, dialogHandle}: Props){

    const {
        mode, setMode,
        filename, setFilename,
        path, setPath,
        file, fileFormat, fileError,
        isDragging, setIsDragging,
        text, setText,
        inputRef, hasName,
        applyFile, removeFile, handleSubmit, isPending
    } = useUploadText({onTextChange, dialogHandle})

    return(
        <Form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl flex-col gap-6"
        >
            <div>
                <Dialog.Title className="text-base font-medium text-neutral-900">Carica testo</Dialog.Title>
                <Dialog.Description className="text-sm text-neutral-500">
                    Carica un file TEI o TXT, oppure incolla direttamente il testo.
                </Dialog.Description>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field.Root name="filename" className="flex flex-col gap-1">
                    <Field.Label className="text-xs text-neutral-500">Nome file</Field.Label>
                    <Field.Control
                        type="text"
                        value={filename}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilename(e.target.value)}
                        placeholder="es. bologna.psalter"
                        className={inputClasses}
                        required
                    />
                </Field.Root>
                <Field.Root name="path" className="flex flex-col gap-1">
                    <Field.Label className="text-xs text-neutral-500">Percorso</Field.Label>
                    <Field.Control
                        type="text"
                        value={path}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPath(e.target.value)}
                        placeholder="es. marco"
                        className={inputClasses}
                        required
                    />
                </Field.Root>
            </div>

            <Tabs.Root
                value={mode}
                onValueChange={(value) => setMode(value as "file" | "text")}
                className="flex flex-col gap-4"
            >
                <Tabs.List className="relative flex gap-6 border-b border-neutral-200">
                    <Tabs.Tab value="file" className={tabClasses}>
                        File
                    </Tabs.Tab>
                    <Tabs.Tab value="text" className={tabClasses}>
                        Testo
                    </Tabs.Tab>
                    <Tabs.Indicator
                        className="absolute -bottom-px left-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) bg-orange-600 transition-all duration-200 ease-out"/>
                </Tabs.List>

                <Tabs.Panel
                    value="file"
                    className="flex flex-col gap-3"
                >
                    <label
                        onDragLeave={() => setIsDragging(false)}
                        onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                        }}
                        onDrop={(e) => {
                            e.preventDefault()
                            setIsDragging(false)
                            applyFile(e.dataTransfer.files?.[0])
                        }}
                        className={`
                            flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed px-4 py-8 text-center transition-colors 
                            ${isDragging ? "border-orange-500" : "border-neutral-300 hover:border-neutral-400"}
                        `}
                    >
                        <span className="text-sm text-neutral-600">
                            Trascina un file o <span className="text-orange-600 underline underline-offset-2">selezionalo</span>
                        </span>
                        <span className="text-xs text-neutral-400">XML (.xml) · TXT (.txt)</span>
                        <Field.Control
                            ref={inputRef}
                            type="file"
                            accept={ACCEPT_ATTR}
                            className="sr-only"
                            onChange={(e) => applyFile(e.target.files?.[0])}
                        />
                    </label>

                    {fileError && (
                        <p className="text-xs text-red-600">{fileError}</p>
                    )}

                    {file && fileFormat && (
                        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-2 text-sm">
                            <span className="min-w-0 truncate text-neutral-700">
                                <span className="text-neutral-400">{fileFormat}</span> - {file.name}
                            </span>
                            <button
                                type="button"
                                onClick={removeFile}
                                aria-label="Rimuovi file"
                                className="shrink-0 text-neutral-400 hover:text-neutral-700"
                            >
                                <XIcon className="size-3.5"/>
                            </button>
                        </div>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="text" className="flex flex-col gap-2">
                    <Field.Root name="text_content" className="flex flex-col gap-2">
                        <Field.Control
                            render={
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Incolla qui il testo..."
                                    rows={10}
                                    className={`resize-y ${inputClasses}`}
                                />
                            }
                        />
                    </Field.Root>
                </Tabs.Panel>
            </Tabs.Root>

            <Button
                type="submit"
                disabled={!(hasName && (mode === "file" ? !!file && !!fileFormat : text.trim().length > 0)) || isPending}
                className="w-full rounded-md bg-orange-700 py-2.5 text-sm font-bold text-white transition-colors hover:enabled:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
                {isPending ? 'Caricamento...' : 'Carica'}
            </Button>
        </Form>
    )
}

export default memo(UploadTextForm)
