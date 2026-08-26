import React, {RefObject, useCallback, useRef, useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {UploadFormat} from "@/components/uploadTextForm.tsx";
import {uploadBiblicalText} from "@/api";
import toast from "react-hot-toast";

const ACCEPTED_EXTENSIONS: Record<string, UploadFormat> = {
    xml: "XML",
    txt: "TXT"
}

function detectFormat(filename: string): UploadFormat | null {
    const spl = filename.split(".")
    const ext = spl[spl.length - 1]?.toLowerCase()
    if (ext)
        return ACCEPTED_EXTENSIONS[ext] ?? null
    return null
}

type Props={
    onTextChange: (newSelected: { path: string, items: { id: number, filename: string } }) => void
    dialogHandle?:  RefObject<any>
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

    const applyFile = useCallback((candidate: File | undefined | null) => {
        if (!candidate)
            return
        const format = detectFormat(candidate.name)
        if (!format) {
            setFile(null)
            setFileFormat(null)
            setFileError("Formato non supportato. Carica un file .txt o .xml")
            return
        }
        setFile(candidate)
        setFileFormat(format)
        setFileError(null)
    }, [])

    const removeFile = useCallback(() => {
        setFile(null)
        setFileFormat(null)
        setFileError(null)
        if (inputRef.current)
            inputRef.current.value = ""
    }, [])

    const uploadMutation = useMutation({
        mutationFn: uploadBiblicalText,
        onSuccess(data) {
            toast.success('Testo caricato con successo')

            void queryClient.invalidateQueries({queryKey: ['biblicalText']})

            onTextChange({
                path: path.trim(),
                items: {
                    id: Number(data.id),
                    filename: filename.trim()
                }
            })

            if (dialogHandle?.current)
                dialogHandle.current.close()
        },
        onError(error) {
            toast.error(error.message)
        }
    })

    const handleSubmit = (e: React.SubmitEvent) => {
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
        uploadMutation
    }
}
