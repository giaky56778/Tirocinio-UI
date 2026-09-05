import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {deleteText,} from "@/api";

export function useDeleteHistoricalText(){
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id}: {id: number}) => deleteText(id),
        async onSuccess() {
            await queryClient.invalidateQueries({queryKey: ["historicalText"]})
            toast.success("Testo cancellato con successo")
        },
        async onError() {
            toast.error("Errore durante la cancellazione del testo")
        }
    })
}


