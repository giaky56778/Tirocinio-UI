import {TriangleExclamationIcon} from "./icons";

const ErrorVisualizer=({errorMessage}:{errorMessage:string}) => (
    <div className="h-screen flex items-center justify-center text-zinc-500">
        <div className="flex flex-col items-center gap-3 border border-zinc-200 rounded-lg p-8">
            <TriangleExclamationIcon className="size-8 stroke-zinc-400"/>
            <p>Error: {errorMessage}</p>
        </div>
    </div>
)

export default ErrorVisualizer
