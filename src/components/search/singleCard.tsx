import {Dialog} from "@base-ui/react/dialog";
import {ExpandIcon} from "@/components/icons";
import DialogPortalPreview from "@/components/preview/dialogPortalPreview.tsx";
import SingleViewReadOnlyHistorical from "@/components/preview/singleViewReadOnlyHistorical.tsx";
import {SingleSearchType} from "@/api";

type Props={
    item: SingleSearchType
}

const SingleCard=({item}:Props)=>(
    <Dialog.Root>
        <Dialog.Trigger
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 transition-colors duration-100 select-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-orange-600">
            <ExpandIcon className="size-6"/>
            Anteprima
        </Dialog.Trigger>
        <DialogPortalPreview previewText={item.query}>
            <div inert className="min-h-0 overflow-hidden">
                <SingleViewReadOnlyHistorical urn={item.text.urn}/>
            </div>
        </DialogPortalPreview>
    </Dialog.Root>
)

export default SingleCard
