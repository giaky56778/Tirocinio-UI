import EditorWindowSkeleton from "../../../editor/components/skeleton/editorWindowSkeleton";

const ViewHighlightsSkeleton = () => (
    <div className={`flex flex-row divide-x divide-gray-500 h-screen w-full`}>
        <EditorWindowSkeleton/>
        <EditorWindowSkeleton/>
    </div>
)

export default ViewHighlightsSkeleton
