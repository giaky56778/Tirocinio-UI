import {useNavigate, useSearchParams} from "react-router";
import {Dialog} from "@base-ui/react/dialog";
import DialogPortalPreview from "@/components/preview/dialogPortalPreview.tsx";
import {Suspense} from "react";
import ErrorBoundary from "@/components/errorBoundary.tsx";
import ErrorPreview from "@/components/errorPreview.tsx";
import ViewHighlightsSkeleton from "@/components/skeleton/viewHighlightsSkeleton.tsx";
import DoubleViewReadOnly from "@/components/preview/doubleViewReadOnly.tsx";

export default function PreviewDouble() {

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const urn_b = searchParams.get('urn_b')
    const urn_h = searchParams.get('urn_h')
    const b_start = searchParams.get('b_start')
    const b_end = searchParams.get('b_end')
    const h_start = searchParams.get('h_start')
    const h_end = searchParams.get('h_end')

    return(
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
                <DialogPortalPreview>
                    <ErrorBoundary fallback={(error) => (<ErrorPreview error={error} />)}>
                        <Suspense fallback={<ViewHighlightsSkeleton/>}>
                            <DoubleViewReadOnly
                                historical={{
                                    urn: urn_h!,
                                    ...(h_start ? {start: parseInt(h_start)} : {}),
                                    ...(h_end ? {end: parseInt(h_end)} : {})
                                }}
                                biblical={{
                                    urn: urn_b!,
                                    ...(b_start ? {start: parseInt(b_start)} : {}),
                                    ...(b_end ? {end: parseInt(b_end)} : {})
                                }}
                            />
                        </Suspense>
                    </ErrorBoundary>
                </DialogPortalPreview>
            </Dialog.Root>
        </>
    )
}
