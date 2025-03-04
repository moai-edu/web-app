import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
}

export default function Button({ children, onClick }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-700"
        >
            {children}
        </button>
    );
}
