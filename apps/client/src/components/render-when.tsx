import type { ReactNode } from "react";

type RenderWhenProps = {
    condition: boolean;
    children: ReactNode;
    fallback?: ReactNode;
};

export const RenderWhen: React.FC<RenderWhenProps> = ({
    condition,
    children,
    fallback = null,
}) => {
    return condition ? <>{children}</> : <>{fallback}</>;
};

export default RenderWhen;