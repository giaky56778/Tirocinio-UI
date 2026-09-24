import DoubleEditorSkeleton from "../../../editor/components/skeleton/singleEditorSkeleton.tsx";

const ViewHighlightsSkeleton = () => (
    <div className={`flex flex-row divide-x divide-gray-500 h-screen w-full`}>
        <DoubleEditorSkeleton/>
        <DoubleEditorSkeleton/>
    </div>
)

export default ViewHighlightsSkeleton
