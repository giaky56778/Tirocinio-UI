import {TriangleExclamationIcon} from "./icons";

type Props={
    error: Error
}

const ErrorPreview = ({ error }: Props) => (
    <div className="h-full w-full flex items-center justify-center p-8 bg-gray-50/50">
        <div className="max-w-md w-full bg-white border border-slate-200 shadow-md rounded-2xl p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <TriangleExclamationIcon className="size-6"/>
            </div>
            <div>
                <h3 className="text-base font-semibold text-gray-900">Impossibile caricare l'anteprima</h3>
                <p className="text-xs text-red-700 mt-2 leading-relaxed bg-red-50/70 p-2.5 rounded-lg font-mono">
                    {error.message}
                </p>
            </div>
        </div>
    </div>
)

export default ErrorPreview