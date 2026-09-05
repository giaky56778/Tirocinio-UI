import {useNavigate, useSearchParams} from "react-router";
import {Dialog} from "@base-ui/react/dialog";
import SingleViewReadOnlyBiblical from "@/features/search/components/preview/singleViewReadOnlyBiblical.tsx";
import DialogPortalPreview from "@/components/ui/common/dialogPortalPreview.tsx";
import ErrorBoundary from "@/components/layout/errorBoundary.tsx";
import {Suspense} from "react";
import ViewHighlightsSkeleton from "@/features/view/components/skeleton/viewHighlightsSkeleton.tsx";
import ErrorPreview from "@/components/layout/errorPreview.tsx";

export default function PreviewSingle(){
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const urn_h = searchParams.get('urn_h')
    const query = searchParams.get('query')

    return (
        <>
            <ViewHighlightsSkeleton/>
            <Dialog.Root
                defaultOpen={true}
                onOpenChange={(open) => {
                    if (!open) {
                        navigate("/")
                    }
                }}
            >
                <DialogPortalPreview previewText={query}>
                    <ErrorBoundary fallback={(error) => (<ErrorPreview error={error} />)}>
                        <Suspense fallback={<ViewHighlightsSkeleton/>}>
                            <div inert className="relative min-h-0 overflow-hidden">
                                <SingleViewReadOnlyBiblical urn={urn_h!}/>
                            </div>
                        </Suspense>
                    </ErrorBoundary>
                </DialogPortalPreview>
            </Dialog.Root>
        </>
    )
}
