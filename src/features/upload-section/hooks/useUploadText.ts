import {useState, useRef} from 'react';
import type React from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {type UploadFormat} from "@/features/upload-section/components/uploadTextForm.tsx";
import toast from "react-hot-toast";
import {uploadHistoricalText} from "@/features/upload-section/api/uploadApi.ts";
import {Dialog} from "@base-ui/react/dialog";

const ACCEPTED_EXTENSIONS: Record<string, UploadFormat> = {
    xml: "XML",
    txt: "TXT"
}

function detectFormat(filename: string): UploadFormat | null {
    const spl = filename.split(".")
    const ext = spl[spl.length - 1]?.toLowerCase()

    return ACCEPTED_EXTENSIONS[ext] ?? null
}

type Props={
    onTextChange: (newSelected: { path: string, items: { id: number, filename: string } }) => void
    dialogHandle?: Dialog.Handle<never>
}

export function useUploadText({onTextChange, dialogHandle}: Props) {
    const queryClient = useQueryClient()
    const [mode, setMode] = useState<"file" | "text">("file")
    const [filename, setFilename] = useState("")
    const [path, setPath] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [fileFormat, setFileFormat] = useState<UploadFormat | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [text, setText] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const hasName = filename.trim().length > 0 && path.trim().length > 0

    function applyFile(file: File | undefined | null) {
        if (!file)
            return

        const format = detectFormat(file.name)
        if (!format) {
            setFile(null)
            setFileFormat(null)
            setFileError("Formato non supportato. Carica un file .txt o .xml")
            return
        }
        setFile(file)
        setFileFormat(format)
        setFileError(null)
    }

    function removeFile() {
        setFile(null)
        setFileFormat(null)
        setFileError(null)
        if (inputRef.current)
            inputRef.current.value = ""
    }

    const uploadMutation = useMutation({
        mutationKey: ["uploadHistoricalText"],
        mutationFn: uploadHistoricalText,
        onSuccess(data) {
            toast.success('Testo caricato con successo')

            void queryClient.invalidateQueries({queryKey: ['historicalText']})

            onTextChange({
                path: data.path.trim(),
                items: {
                    id: Number(data.id),
                    filename: data.filename.trim()
                }
            })

            if (dialogHandle)
                dialogHandle.close()
        },
        onError(error) {
            toast.error(error.message)
        }
    })

    function handleSubmit(e: React.SubmitEvent){
        e.preventDefault()

        if (!hasName)
            return

        if (mode === "file" && file && fileFormat)
            uploadMutation.mutate({filename, path, file})
        else if (mode === "text" && text.trim().length > 0)
            uploadMutation.mutate({filename, path, text})
    }

    return {
        mode, setMode,
        filename, setFilename,
        path, setPath,
        file, setFile,
        fileFormat, fileError,
        isDragging, setIsDragging,
        text, setText,
        inputRef,
        hasName,
        applyFile, removeFile, handleSubmit,
        isPending: uploadMutation.isPending
    }
}
