import {Combobox} from "@base-ui/react";
import {XIcon} from "@/components/ui/icons";

const ComboboxClearButton=()=>(
    <div className="absolute right-1.5 bottom-0 flex h-9 items-center justify-center">
        <Combobox.Clear
            className="flex h-9 w-6 items-center justify-center rounded bg-transparent p-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Pulisci"
        >
            <XIcon className="size-4"/>
        </Combobox.Clear>
    </div>
)

export default ComboboxClearButton
