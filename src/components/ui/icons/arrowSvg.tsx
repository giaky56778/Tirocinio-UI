import type {SVGProps} from "react";

export const ArrowSvg = (props: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
        <path
            d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
            className="fill-white"
        />
            <path
                d="M0 8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20"
                className="stroke-gray-200 dark:stroke-gray-300"
                strokeWidth="0.6"
                fill="none"
            />
    </svg>
)