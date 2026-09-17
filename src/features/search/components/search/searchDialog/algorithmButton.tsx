import {
    checkboxActiveClass,
    checkboxClass,
    optionRowActiveClass,
    optionRowClass
} from "@/features/search/components/search/searchDialog/searchOptionDialog.tsx";
import {CheckIcon, InfoIcon} from "@/components/ui/icons";
import {Tooltip} from "@base-ui/react/tooltip";

type Props = {
    itemKey: string,
    label: string,
    tooltipText: string,
    selected: boolean,
    onToggle: (key: string) => void,
    tooltipHandle: Tooltip.Handle<unknown>
};

const AlgorithmOptionItem = ({itemKey, label, tooltipText, selected, onToggle, tooltipHandle}: Props) => (
    <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={() => onToggle(itemKey)}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onToggle(itemKey)
            }
        }}
        className={`${optionRowClass} ${selected ? optionRowActiveClass : ''}`}
    >
        <div className={`${checkboxClass} ${selected ? checkboxActiveClass : ''}`}>
            {selected && <CheckIcon/>}
        </div>
        <span className="text-sm text-left flex-1 flex items-center gap-2">
            {label}
            <Tooltip.Trigger
                handle={tooltipHandle}
                render={<label/>}
                payload={{ text: tooltipText }}
            >
                <InfoIcon className="size-4 text-neutral-400 hover:text-neutral-600"/>
            </Tooltip.Trigger>

        </span>
    </div>
)

export default AlgorithmOptionItem
