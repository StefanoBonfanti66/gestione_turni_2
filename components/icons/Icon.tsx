
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    children: React.ReactNode;
}

export const Icon: React.FC<IconProps> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        {...props}
    >
        {children}
    </svg>
);
