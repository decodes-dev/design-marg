declare module "design-marg" {
  import { FC } from "react";

  export const Ring: FC<{
    ringColor?: string;
    surroundRingTo?: string;
    defaultRingSize?: number;
    hideRingFor?: string;
  }>;

  export default Ring;
}
