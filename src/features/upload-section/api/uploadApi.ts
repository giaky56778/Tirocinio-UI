export type UploadIdType={
    id:number
}

type Props = {
    path: string
    filename: string
    file?: File
    text?: string
}

export async function uploadHistoricalText({path, filename, file, text}: Props) {
    const formData = new FormData()
    formData.append('path', path)
    formData.append('filename', filename)
    if (file)
        formData.append('file', file)
    if (text !== undefined)
        formData.append('text', text)

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/text/upload`, {
        method: 'POST',
        body: formData,
    })

    if (!res.ok)
        throw new Error(`Errore durante il caricamento del testo`)

    return await res.json() as UploadIdType
}
