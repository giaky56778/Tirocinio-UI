import EditorWindowSkeleton from "./editorWindowSkeleton.tsx";

const ViewHighlightsSkeleton = () => (
    <div className={`flex flex-row h-screen w-full`}>
        <EditorWindowSkeleton/>
        <EditorWindowSkeleton/>
    </div>
)

export default ViewHighlightsSkeleton
